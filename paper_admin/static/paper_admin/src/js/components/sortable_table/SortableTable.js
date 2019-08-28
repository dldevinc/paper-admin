/**
 * Таблица с возможностью сортировки строк.
 * Каждая строка должна иметь атрибут data-id.
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
import bootbox from "../../vendor/bootbox";
import ListTree from "./ListTree";
import StaggerHighlight from "./StaggerHighlight";

/**
 * Конструктор объектов SortableTable.
 * @param {Element} table
 * @param {module:SortableTable.SortableTableOptions} [options]
 * @constructor
 */
function SortableTable(table, options) {
    /** @type {module:SortableTable.SortableTableOptions} */
    this.opts = Object.assign({
        url: null,
        tree: false,
        handler: '.handler',
        disabledClass: 'disabled'
    }, options);

    /** @type {Element} */
    this.table = table;

    /** @type {Element} */
    this.tbody = table.querySelector('tbody');
    if (!this.tbody) {
        throw new Error('table body not found');
    }

    /** @type {?ListTree} */
    this.tree = null;

    this._createSortable();
}

/**
 * Инициализация плагина сортировки.
 * @private
 */
SortableTable.prototype._createSortable = function() {
    return Sortable.create(this.tbody, {
        animation: 0,
        draggable: 'tr',
        handle: this.opts.handler,
        filter: '.' + this.opts.disabledClass,
        ghostClass: 'sortable-ghost',
        onStart: this._onStart.bind(this),
        onMove: this._onMove.bind(this),
        onEnd: this._onEnd.bind(this),
    });
};

/**
 * Обработчик события начала перетаскивания.
 * @param evt
 * @private
 */
SortableTable.prototype._onStart = function(evt) {
    const rows = this.tbody.querySelectorAll('tr');

    if (this.opts.tree) {
        this.tree = new ListTree(rows);
    }

    // блокируем все узлы, кроме соседних
    const item_parentId = parseInt(evt.item.dataset.parent);
    rows.forEach(function(row) {
        const parentId = parseInt(row.dataset.parent);
        if ((!isNaN(parentId) || !isNaN(item_parentId)) && parentId !== item_parentId) {
            row.classList.add(this.opts.disabledClass);
        }
    }.bind(this));
};

/**
 * Обработчик события перетаскивания.
 * @param evt
 * @returns {Boolean}
 * @private
 */
SortableTable.prototype._onMove = function(evt) {
    return !evt.related.classList.contains(this.opts.disabledClass);
};

/**
 * Обработчик события завершения перетаскивания.
 * @param evt
 * @private
 */
SortableTable.prototype._onEnd = function(evt) {
    // снимаем блокировку со всех узлов
    const rows = this.tbody.querySelectorAll('tr');
    rows.forEach(function(row) {
        row.classList.remove(this.opts.disabledClass);
    }.bind(this));

    let moved = this._getMovedRows(evt);
    if (!moved.length) {
        return
    }

    this._normalizeTable(evt, moved);

    const map = this._createOrderMap(evt, moved);

    // выделение рядов, учавствовавших в перемещении
    const highlighter = new StaggerHighlight(moved);
    this._sendRequest(map).then(function() {
        highlighter.release();
    });
};

/**
 * Получение строк, чей порядок изменился.
 * @param evt
 * @returns {Element[]}
 * @private
 */
SortableTable.prototype._getMovedRows = function(evt) {
    const sliceStart = Math.min(evt.oldIndex, evt.newIndex);
    const sliceEnd = Math.max(evt.oldIndex, evt.newIndex);
    const rows = this.tbody.querySelectorAll('tr');
    let slice = Array.prototype.slice.call(rows, sliceStart, sliceEnd + 1);
    if (this.tree) {
        // пропускаем узлы, не являющиеся соседними
        const pk = parseInt(evt.item.dataset.id);
        const node = this.tree.getNode(pk);
        slice = slice.filter(function(row) {
            return parseInt(row.dataset.parent) === node.parent
        });
    }
    return slice;
};

/**
 * Создание карты новых значений сортировки строк.
 * @param evt
 * @param {Element[]} rows
 * @returns {Object}
 * @private
 */
SortableTable.prototype._createOrderMap = function(evt, rows) {
    const pk_array = [];
    const order_array = [];
    rows.forEach(function(row) {
        const handle = row.querySelector(this.opts.handler);
        if (handle) {
            pk_array.push(parseInt(row.dataset.id));
            order_array.push(parseInt(handle.dataset.order));
        }
    }.bind(this));

    // циклический сдвиг значений order
    const movedDown = evt.oldIndex < evt.newIndex;
    if (movedDown) {
        order_array.unshift(order_array.pop());
    } else {
        order_array.push(order_array.shift());
    }

    return pk_array.reduce(function(result, pk, i) {
        result[pk] = order_array[i];

        // обновляем атрибут order
        const row = this.tbody.querySelector('tr[data-id="'+pk+'"]');
        row.querySelector(this.opts.handler).setAttribute('data-order', order_array[i]);

        return result;
    }.bind(this), {});
};

/**
 * Нормализация таблицы.
 * Все дочерние строки перемещаются под своего родителя.
 * Без этого метода может случиться ситуация, когда элемент
 * был перемещен между своим соседом и его детьми.
 * @param evt
 * @param {Element[]} moved
 * @private
 */
SortableTable.prototype._normalizeTable = function(evt, moved) {
    if (this.tree) {
        const pk = parseInt(evt.item.dataset.id);
        const node = this.tree.getNode(pk);
        const prev = evt.item.previousElementSibling;
        const next = evt.item.nextElementSibling;
        const parents = moved.slice();
        if (prev && next) {
            // если предыдущая строка - сосед, а следующая - ребенок соседа,
            // то сосед должен быть в списке нормализации.
            const isPrevSibling = parseInt(prev.dataset.parent) === node.parent;
            const isNextChild = parseInt(next.dataset.parent) === parseInt(prev.dataset.id);
            if (isPrevSibling && isNextChild && (parents.indexOf(prev) < 0)) {
                parents.unshift(prev);
            }
        }

        // перенос детей под родителя
        parents.forEach(function(parent) {
            const pk = parseInt(parent.dataset.id);
            const childs = this.tree.getDescendants(pk);
            Element.prototype.after.apply(parent, childs);
        }.bind(this));
    }
};

/**
 * Отправка новых значений сортировки на сервер.
 * @param {Object} data
 * @returns {Promise<Response>}
 * @private
 */
SortableTable.prototype._sendRequest = function(data) {
    return fetch(this.opts.url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function(response) {
        if (!response.ok) {
            const error = new Error(`${response.status} ${response.statusText}`);
            error.response = response;
            throw error;
        }
    }).catch(function(error) {
        error.response.text().then(function(text) {
            bootbox.alert({
                message: text,
                size: 'small'
            });
        });
    });
};


export default SortableTable;
