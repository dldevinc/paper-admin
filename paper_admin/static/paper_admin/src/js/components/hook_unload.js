/* global gettext */

/**
 * Инициализация отслеживания изменения формы и вывод
 * предупреждения при попытке закрыть страницу без сохранения.
 *
 * Для предотвращения изменения в какой-либо части формы,
 * добавьте аттрибут data-hook-unload="prevent".
 */
export default function hookUnload(form) {
    let submit = false;
    let formHasChanged = false;

    form.addEventListener('submit', function() {
        submit = true;
    });

    const message = gettext('You have unsaved changes');
    window.addEventListener('beforeunload', function(evt) {
        if (!submit && formHasChanged) {
            evt.returnValue = message;
            return message;
        }
    });

    // начинаем отслеживать изменения после первого действия
    // пользователя, чтобы игнорировать последствия инициализации
    document.addEventListener('keydown', userActionHandler);
    document.addEventListener('mousedown', userActionHandler);
    function userActionHandler() {
        document.removeEventListener('keydown', userActionHandler);
        document.removeEventListener('mousedown', userActionHandler);
        form.addEventListener('change', function changeHandler(event) {
            form.removeEventListener('change', changeHandler);

            const target = event.target;
            const widget = target.closest('.form-widget');
            const prevent_hook = target.closest('[data-hook-unload="prevent"]') !== null;
            if (!prevent_hook && widget && form.contains(widget)) {
                formHasChanged = true;
            }
        });
    }
}
