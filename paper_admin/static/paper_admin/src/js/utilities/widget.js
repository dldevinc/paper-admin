const defaultID = Symbol("widget");

/**
 * Базовый класс для создания виджетов.
 *
 * @example
 *  clickHandler = event => {
 *      console.log("element clicked!");
 *  };
 *
 *  class MyWidget extends Widget {
 *      _init(element) {
 *          element.addEventListener("click", clickHandler);
 *      }
 *
 *      _destroy(element) {
 *          element.removeEventListener("click", clickHandler);
 *      }
 *  }
 *
 *  const myWidget = new MyWidget();
 *  myWidget.bind("div[data-my-widget]");
 *  myWidget.attach();
 */
class Widget {
    constructor() {
        console.warn("Widget class is deprecated. Please use data-xclass package instead.");
        this._selectors = [];

        this._observer = new MutationObserver(mutationList => {
            for (const mutation of mutationList) {
                this.onMutate(mutation);
            }
        });

        this._observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Идентификатор, который используется виджетом для привязки к DOM-элементу.
     * Это препятствует повторной инициализации виджетов на данном элементе.
     * Если в каком-либо подклассе поле `widgetID` вернёт что-то отличное от значения
     * по умолчанию, то этот подкласс сможет применяться параллельно со всеми
     * другими виджетами.
     * @returns {symbol}
     */
    static get widgetID() {
        return defaultID;
    }

    /**
     * Получение экземпляра виджета, связанного с DOM-элементом.
     * @param {HTMLElement} element
     * @param {symbol?} widgetID
     * @returns {*}
     */
    static getInstance(element, widgetID) {
        widgetID = typeof widgetID === "symbol" ? widgetID : this.widgetID;
        return element[widgetID];
    }

    /**
     * Сохранение ссылки на экземпляр виджета в DOM-элементе.
     * @param {HTMLElement} element
     * @private
     */
    _setInstance(element) {
        element[this.constructor.widgetID] = this;
    }

    /**
     * Удаление ссылки на экземпляр виджета из DOM-элемента.
     * @param {HTMLElement} element
     * @private
     */
    _removeInstance(element) {
        delete element[this.constructor.widgetID];
    }

    /**
     * Метод инициализации виджета.
     *
     * (!) Чтобы не нарушать логику класса Widget, при назначении поведения исходный
     * DOM-элемент должен оставаться на странице и продолжать соответствовать
     * селектору, по которому он был найден.
     *
     * @param {HTMLElement} element
     * @private
     */
    _init(element) {}

    /**
     * Метод освобождения ресурсов виджета.
     * @param {HTMLElement} element
     * @private
     */
    _destroy(element) {}

    /**
     * Добавление новых записей в список CSS-селекторов, которые должен обрабатывать
     * текущий класс.
     * @param {String} selectors
     */
    bind(...selectors) {
        this._selectors = this._selectors.concat(selectors);
    }

    /**
     * Удаление записей из списка CSS-селекторов, которые должен обрабатывать текущий
     * класс. Значение каждого аргумента должно точно соответствовать значению,
     * находящемуся в списке.
     * @param {String} selectors
     */
    unbind(...selectors) {
        this._selectors = this._selectors.filter(selector => {
            return !selectors.includes(selector);
        });
    }

    /**
     * Событие изменения DOM-дерева.
     * @param {MutationRecord} mutation
     */
    onMutate(mutation) {
        if (mutation.type === "childList") {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode instanceof HTMLElement) {
                    this.attach(addedNode);
                }
            }

            for (const removedNode of mutation.removedNodes) {
                if (removedNode instanceof HTMLElement) {
                    this.detach(removedNode);
                }
            }
        }
    }

    /**
     * Привязка поведения, заданного текущим классом, к указанному DOM-элементу.
     * @param {HTMLElement} element
     */
    _attach(element) {
        const instance = this.constructor.getInstance(element);
        if (typeof instance !== "undefined") {
            console.debug(`${this.constructor.name} already initialized on this element`);
            return;
        }

        let result;

        try {
            result = this._init(element);
        } catch (e) {
            console.debug(e);
            return;
        }

        if (result !== false) {
            this._setInstance(element);
        }
    }

    /**
     * Отмена привязки поведения к указанному DOM-элементу.
     * @param {HTMLElement} element
     */
    _detach(element) {
        if (!this.constructor.getInstance(element)) {
            console.debug(`${this.constructor.name} has not been initialized on this element`);
            return;
        }

        let result;

        try {
            result = this._destroy(element);
        } catch (e) {
            console.debug(e);
            return;
        }

        if (result !== false) {
            this._removeInstance(element);
        }
    }

    /**
     * Поиск и привязка поведения к каждому элементу поддерева элемента `root`,
     * который соответствует хотя бы одному из подключенных селекторов.
     * @param {HTMLElement} root
     */
    attach(root = document.documentElement) {
        for (const selector of this._selectors) {
            if (root.matches(selector)) {
                this._attach(root);
            }

            root.querySelectorAll(selector).forEach(element => {
                this._attach(element);
            });
        }
    }

    /**
     * Поиск и отмена привязки поведения от каждого элемента поддерева элемента `root`,
     * который соответствует хотя бы одному из подключенных селекторов.
     * @param {HTMLElement} root
     */
    detach(root = document.documentElement) {
        for (const selector of this._selectors) {
            if (root.matches(selector)) {
                this._detach(root);
            }

            root.querySelectorAll(selector).forEach(element => {
                this._detach(element);
            });
        }
    }

    /**
     * @deprecated
     * @param selector
     */
    initAll(selector) {
        this.bind(selector);
        this.attach();
    }

    /**
     * @deprecated
     * @param selector
     */
    observe(selector) {}
}

export default Widget;
