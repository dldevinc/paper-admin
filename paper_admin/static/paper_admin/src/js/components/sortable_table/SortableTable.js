/**
 * Таблица с возможностью сортировки строк.
 * Каждая строка должна иметь атрибуты data-id и data-order-value.
 * В случае, если строки представляют дерево, то еще необходим атрибут data-parent.
 * @module SortableTable
 */

/**
 * @typedef {Object} module:SortableTable.SortableTableOptions
 * @property {String}  url
 * @property {Boolean} [tree]
 * @property {String}  [handler]
 * @property {String}  [disabledClass]
 */

import Sortable from "sortablejs";
import ListTree from "js/components/sortable_table/ListTree.js";

export default class SortableTable {
    /**
     * @param {Element} table
     * @param {module:SortableTable.SortableTableOptions} [options]
     */
    constructor(table, options) {
        /** @type {module:SortableTable.SortableTableOptions} */
        this.opts = Object.assign(
            {
                url: null,
                tree: false,
                handler: ".handler",
                disabledClass: "disabled"
            },
            options
        );

        /** @type {Element} */
        this.table = table;

        /** @type {Element} */
        this.tbody = table.querySelector("tbody");
        if (!this.tbody) {
            throw new Error("table body not found");
        }

        /** @type {?ListTree} */
        this.tree = null;

        this._createSortable();
    }

    /**
     * Инициализация плагина сортировки.
     * @returns {Sortable}
     * @private
     */
    _createSortable() {
        return Sortable.create(this.tbody, {
            animation: 0,
            draggable: "tr",
            handle: this.opts.handler,
            filter: (event, row, instance) => {
                if (row.classList.contains(this.opts.disabledClass)) {
                    return true;
                }

                const handler = row.querySelector(this.opts.handler);
                if (handler && handler.classList.contains(this.opts.disabledClass)) {
                    return true;
                }
            },
            ghostClass: "sortable-ghost",
            onStart: this._onStart.bind(this),
            onMove: this._onMove.bind(this),
            onEnd: this._onEnd.bind(this)
        });
    }

    /**
     * Обработчик события начала перетаскивания.
     * @param evt
     * @private
     */
    _onStart(evt) {
        const rows = this.tbody.querySelectorAll("tr");

        if (this.opts.tree) {
            this.tree = new ListTree(rows);

            // Блокируем все узлы, кроме соседних.
            const currentParentId = evt.item.dataset.parent;
            if (typeof currentParentId !== "undefined") {
                rows.forEach(row => {
                    const parentId = row.dataset.parent;
                    if ((typeof parentId !== "undefined") && (parentId !== currentParentId)) {
                        row.classList.add(this.opts.disabledClass);
                    }
                });
            }
        }
    }

    /**
     * Обработчик события перетаскивания.
     * @param evt
     * @returns {boolean}
     * @private
     */
    _onMove(evt) {
        return !evt.related.classList.contains(this.opts.disabledClass);
    }

    /**
     * Обработчик события завершения перетаскивания.
     * @param evt
     * @private
     */
    _onEnd(evt) {
        // Снимаем блокировку со всех узлов.
        const rows = this.tbody.querySelectorAll("tr");
        rows.forEach(row => {
            row.classList.remove(this.opts.disabledClass);
        });

        const moved = this._getMovedRows(evt);
        if (!moved.length || moved.length === 1) {
            return;
        }

        this._normalizeTable(evt, moved);

        const map = this._createOrderMap(evt, moved);

        // блокировка областей сортировки на время выполнения запроса
        const handlers = this.tbody.querySelectorAll(this.opts.handler);
        handlers.forEach(handler => {
            handler.classList.add(this.opts.disabledClass);
        });

        // отправка запроса на сервер
        this._sendRequest(map).then(() => {
            // снятие блокировки
            handlers.forEach(handler => {
                handler.classList.remove(this.opts.disabledClass);
            });
        });
    }

    /**
     * Получение строк, чей порядок изменился после перетаскивания.
     * @param evt
     * @returns {HTMLElement[]}
     * @private
     */
    _getMovedRows(evt) {
        const sliceStart = Math.min(evt.oldIndex, evt.newIndex);
        const sliceEnd = Math.max(evt.oldIndex, evt.newIndex);
        const rows = this.tbody.querySelectorAll("tr");
        let slice = Array.prototype.slice.call(rows, sliceStart, sliceEnd + 1);
        if (this.tree) {
            // пропускаем узлы, не являющиеся соседними
            const pk = evt.item.dataset.id;
            const node = this.tree.getNode(pk);
            slice = slice.filter(row => {
                return row.dataset.parent === node.parent;
            });
        }
        return slice;
    }

    /**
     * Создание карты новых значений сортировки элементов.
     * @param evt
     * @param {HTMLElement[]} rows
     * @returns {Object}
     * @private
     */
    _createOrderMap(evt, rows) {
        const pkArray = [];
        const orderArray = [];

        // заполнение массивов ID и сортировки
        rows.forEach(row => {
            const handle = row.querySelector(this.opts.handler);
            if (handle) {
                pkArray.push(row.dataset.id);
                orderArray.push(parseInt(row.dataset.orderValue));
            }
        });

        // циклический сдвиг значений сортировки
        const movedDown = evt.oldIndex < evt.newIndex;
        if (movedDown) {
            orderArray.unshift(orderArray.pop());
        } else {
            orderArray.push(orderArray.shift());
        }

        return pkArray.reduce((result, pk, i) => {
            result[pk] = orderArray[i];

            // обновляем атрибут data-order-value
            const row = this.tbody.querySelector(`tr[data-id="${pk}"]`);
            row.setAttribute("data-order-value", orderArray[i]);

            return result;
        }, {});
    }

    /**
     * Нормализация таблицы.
     * Все дочерние строки перемещаются под своего родителя.
     * Без этого метода может случиться ситуация, когда элемент
     * был перемещен между своим соседом и его детьми.
     * @param evt
     * @param {Element[]} moved
     * @private
     */
    _normalizeTable(evt, moved) {
        if (!this.tree) {
            return;
        }

        const pk = evt.item.dataset.id;
        const node = this.tree.getNode(pk);
        const prev = evt.item.previousElementSibling;
        const next = evt.item.nextElementSibling;
        const parents = moved.slice();
        if (prev && next) {
            // если предыдущая строка - сосед, а следующая - ребенок соседа,
            // то сосед должен быть в списке нормализации.
            const isPrevSibling = prev.dataset.parent === node.parent;
            const isNextChild = next.dataset.parent === prev.dataset.id;
            if (isPrevSibling && isNextChild && !parents.includes(prev)) {
                parents.unshift(prev);
            }
        }

        // перенос детей под родителя
        parents.forEach(parent => {
            const pk = parent.dataset.id;
            const childs = this.tree.getDescendants(pk);
            Element.prototype.after.apply(parent, childs);
        });
    }

    /**
     * Отправка новых значений сортировки на сервер.
     * @param {Object} data
     * @returns {Promise<Response>}
     * @private
     */
    _sendRequest(data) {
        return fetch(this.opts.url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                const error = new Error(`${response.status} ${response.statusText}`);
                error.response = response;
                throw error;
            }
        });
    }
}
