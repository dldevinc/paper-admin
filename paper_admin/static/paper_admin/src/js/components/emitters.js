import EventEmitter from "wolfy87-eventemitter";


const emitters = {
    /**
     * События DOM:
     *  `mutate`    - после добавленя/изменения элемента в дерове DOM.
     *                Используется, например, для инициализации виджетов.
     *                Первым аргументом передаётся самый верхний элемент, добавленный/измененный в DOM.
     *                  emitters.dom.trigger('mutate', [elem]);
     *
     *  `release`   - перед удалением элемента из DOM.
     *                Используется, например, для освобождения ресурсов.
     *                Первым аргументом передаётся самый верхний элемент, удаляемый из DOM.
     *                  emitters.dom.trigger('release', [elem]);
     */
    dom: new EventEmitter(),

    /**
     * События Inline-форм:
     *  `added`     - Новая форма добавлена.
     *                Аргументы:
     *                  1) DOM-элемент добавленной формы
     *                  2) Префикс формсета
     *
     *  `remove`    - Перед удалением динамически добавленной формы.
     *                Аргументы:
     *                  1) DOM-элемент удаляемой формы
     *                  2) Префикс формсета
     *
     *  `removed`   - После удаления динамически добавленной формы.
     *                Аргументы:
     *                  1) DOM-элемент удалённой формы
     *                  2) Префикс формсета
     */
    inlines: new EventEmitter(),
};
export default emitters;

// share plugin
window.paperAdmin = window.paperAdmin || {};
Object.assign(window.paperAdmin, {
    EventEmitter,
    emitters,
});
