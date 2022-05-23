import emitters from "js/utilities/emitters.js";

/**
 * Базовый класс для создания виджетов.
 * По умолчанию слушает события `mutate` и `release` из EventEmitter
 * и вызывает для каждого DOM-элемента, удовлетворяющего селектору,
 * метод `init` или `destroy` соответственно.
 *
 * Для метода `destroy` используется тот же селектор, что и для инициализации.
 * Поэтому, для корректного освобождения ресурсов виджета, исходный элемент
 * должен остаться в DOM-дереве и продолжать удовлетворять исходному селектору.
 *
 * @example
 *  class MyWidget extends Widget {
 *      ...
 *  }
 *
 *  const myWidget = new MyWidget();
 *  myWidget.observe("div[data-my-widget]");
 *  myWidget.initAll("div[data-my-widget]");
 */
class Widget {
    constructor() {
        this._event_handlers = {};
    }

    /**
     * Добавление нового обработчика события в реестр.
     * Обработчик события сохраняется в реестре, что позволяет позже удалить
     * его с помощью removeListener() или подобной функции.
     *
     * Для формирования ключа реестра используется два значения: имя события
     * и CSS-селектор элементов, для которых он предназначен. Это позволяет
     * реализовать разную реакцию виджета на одно событие.
     *
     * @param {String} name
     * @param {String|Function} selector
     * @param {Function=} handler
     * @returns {Function}
     */
    addEventHandler(name, selector, handler) {
        let event_name;

        if (typeof selector === "function") {
            handler = selector;
            event_name = name;
        } else {
            event_name = `${name}(${selector})`;
        }

        if (typeof this._event_handlers[event_name] !== "undefined") {
            throw new Error(`Event "${event_name}" already registered`);
        }

        return (this._event_handlers[event_name] = handler);
    }

    /**
     * Получение функции-обработчика события из реестра по имени и селектору.
     * @param {String} name
     * @param {String=} selector
     * @returns {Function}
     */
    getEventHandler(name, selector) {
        let event_name;

        if (typeof selector === "undefined") {
            event_name = name;
        } else {
            event_name = `${name}(${selector})`;
        }

        if (typeof this._event_handlers[event_name] === "undefined") {
            throw new Error(`Event "${selector}" is not registered`);
        }

        return this._event_handlers[event_name];
    }

    /**
     * Сохранение в DOM-элементе ссылки на объект виджета
     * для предотвращения повторной инициализации.
     * @param {HTMLElement} element
     * @private
     */
    _setWidget(element) {
        if (typeof element._widgets === "undefined") {
            element._widgets = {};
        }
        element._widgets[this.constructor.name] = this;
    }

    /**
     * Получение объекта виджета из DOM-элемента.
     * @param {HTMLElement} element
     * @returns {*}
     */
    getWidget(element) {
        if (typeof element._widgets === "object") {
            return element._widgets[this.constructor.name];
        }
    }

    /**
     * Удаление ссылки на объект виджета из DOM-элемента.
     * @param {HTMLElement} element
     * @private
     */
    _removeWidget(element) {
        if (typeof element._widgets === "object") {
            delete element._widgets[this.constructor.name];
        }
    }

    /**
     * Инициализация виджета на указанном DOM-элементе.
     * НЕ СЛЕДУЕТ ПЕРЕОПРЕДЕЛЯТЬ ЭТОТ МЕТОД!
     * Для создания собственной функции инициализации виджета
     * переопределите метод "_init".
     * @param {HTMLElement} element
     */
    init(element) {
        if (this.getWidget(element)) {
            console.debug(`The widget is already inialized on this element`);
            return;
        }
        this._setWidget(element);
        this._init(element);
    }

    /**
     * Метод инициализации виджета.
     * Виджет защищает DOM-элемент от повторной инициализации.
     * @param {HTMLElement} element
     * @private
     */
    _init(element) {}

    /**
     * Освобождение ресурсов виджета для указанного DOM-элемента.
     * НЕ СЛЕДУЕТ ПЕРЕОПРЕДЕЛЯТЬ ЭТОТ МЕТОД!
     * Для создания собственной функции освобождения ресурсов виджета
     * переопределите метод "_destroy".
     * @param {HTMLElement} element
     */
    destroy(element) {
        if (!this.getWidget(element)) {
            return;
        }
        this._removeWidget(element);
        this._destroy(element);
    }

    /**
     * Метод освобождения ресурсов виджета.
     * Виджет защищает DOM-элемент от повторного вызова.
     * @param {HTMLElement} element
     * @private
     */
    _destroy(element) {}

    /**
     * Вызывает функцию инициализации для каждого DOM-элемента,
     * удовлетворяющего селектору `selector` в пределах элемента `root`.
     * @param {String} selector
     * @param {HTMLElement} root
     */
    initAll(selector, root = document.body) {
        const _this = this;

        if (root.matches(selector)) {
            _this.init(root);
        }

        root.querySelectorAll(selector).forEach(function (element) {
            _this.init(element);
        });
    }

    /**
     * Вызывает функцию освобождения ресурсов для каждого DOM-элемента,
     * удовлетворяющего селектору `selector` в пределах элемента `root`.
     * @param {String} selector
     * @param {HTMLElement} root
     */
    destroyAll(selector, root = document.body) {
        const _this = this;

        if (root.matches(selector)) {
            _this.destroy(root);
        }

        root.querySelectorAll(selector).forEach(function (element) {
            _this.destroy(element);
        });
    }

    /**
     * Отслеживание событий изменения DOM-дерева.
     * На каждое изменение вызывается функция инициализации виджета.
     * @param {String} selector
     */
    observe(selector) {
        const onmutate = this.addEventHandler(
            "dom_mutate",
            selector,
            function (root) {
                this.initAll(selector, root);
            }.bind(this)
        );
        emitters.dom.on("mutate", onmutate);

        const onrelease = this.addEventHandler(
            "dom_release",
            selector,
            function (root) {
                this.destroyAll(selector, root);
            }.bind(this)
        );
        emitters.dom.on("release", onrelease);
    }

    /**
     * Отключение всех привязанных событий для указанного селектора.
     * @param {String} selector
     */
    unobserve(selector) {
        emitters.dom.off("mutate", this.getEventHandler("dom_mutate", selector));
        emitters.dom.off("release", this.getEventHandler("dom_release", selector));
    }
}

export default Widget;
