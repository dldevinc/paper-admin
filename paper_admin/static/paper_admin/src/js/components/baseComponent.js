import deepmerge from "deepmerge";
import subscribe from "subscribe-event";

/**
 * Базовый класс компонента.
 *
 * 1) Позволяет указать опции компонента по умолчанию
 *    и объединить их с параметрами, переданными при инициализации.
 * 2) Позволяет привязывать обработчики событий к DOM-элементам,
 *    которые автоматически удаляются при вызове метода `destroy()`.
 */
export class BaseComponent {
    get Defaults() {
        return {};
    }

    /**
     * @param {Object} [options]
     */
    constructor(options) {
        this.options = deepmerge(this.Defaults, options || {}, {
            arrayMerge: (destinationArray, sourceArray) => sourceArray
        });
        this._events = new Map();
    }

    destroy() {
        for (const handleObjects of this._events.values()) {
            handleObjects.forEach(handleObj => {
                handleObj.unsubscribeFunc();
            });
        }
        this._events.clear();
    }

    /**
     * Добавление обработчика события на DOM-элемент.
     * Обработчики событий, добавленные с помощью этого метода,
     * удаляются при уничтожении текущего компонента.
     * @param {HTMLElement|Document} element - DOM-элемент
     * @param {string|Symbol} event - имя события
     * @param {Function} handler - обработчик события
     * @param {Object} [options] - параметры обработчика события
     * @returns {BaseComponent}
     */
    on(element, event, handler, options) {
        const handleObj = {
            event: event,
            handler: handler,
            unsubscribeFunc: subscribe(element, event, handler, options),
            capture: options?.capture || false,
            passive: options?.passive || false,
            once: options?.once || false
        };

        let handleObjects = this._events.get(element);
        if (typeof handleObjects === "undefined") {
            handleObjects = [];
            this._events.set(element, handleObjects);
        }
        handleObjects.push(handleObj);

        return this;
    }

    /**
     * Удаление обработчика события на DOM-элементе.
     * Обработчики с модификаторами (capture / passive / once) удаляются только
     * если передать в метод точно такие же модификаторы.
     * @param {HTMLElement|Document} element - DOM-элемент
     * @param {string|Symbol} event - имя события
     * @param {Function} [handler] - обработчик события
     * @param {Object} [options] - параметры обработчика события
     */
    off(element, event, handler, options) {
        const handlerObjects = this._events.get(element);
        if (!Array.isArray(handlerObjects)) {
            return;
        }

        if (typeof handler === "object" && typeof options === "undefined") {
            options = handler;
            handler = undefined;
        }

        let index = handlerObjects.length;
        while (index--) {
            const handleObj = handlerObjects[index];
            if (
                handleObj.event === event &&
                (!handler || handleObj.handler === handler) &&
                handleObj.capture === !!options?.capture &&
                handleObj.passive === !!options?.passive &&
                handleObj.once === !!options?.once
            ) {
                handlerObjects.splice(index, 1);
            }
        }

        return this;
    }
}
