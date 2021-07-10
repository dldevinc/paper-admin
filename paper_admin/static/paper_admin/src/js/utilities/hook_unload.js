/* global gettext */

/**
 * Инициализация отслеживания изменения формы и вывод
 * предупреждения при попытке закрыть страницу без сохранения.
 *
 * Для предотвращения изменения в какой-либо части формы,
 * добавьте аттрибут data-hook-unload="prevent".
 */
export function hookUnload(form) {
    let submit = false;
    let formHasChanged = false;

    form.addEventListener("submit", function() {
        submit = true;
    });

    const message = gettext("You have unsaved changes");
    window.addEventListener("beforeunload", function(evt) {
        if (!submit && formHasChanged) {
            evt.preventDefault();
            evt.returnValue = message;
            return message;
        }
    });

    // начинаем отслеживать изменения после первого действия
    // пользователя, чтобы игнорировать последствия инициализации
    window.addEventListener("load", userActionHandler);
    document.addEventListener("keydown", userActionHandler);
    document.addEventListener("mousedown", userActionHandler);
    function userActionHandler() {
        window.removeEventListener("load", userActionHandler);
        document.removeEventListener("keydown", userActionHandler);
        document.removeEventListener("mousedown", userActionHandler);

        function changeHandler(event) {
            form.removeEventListener("input", changeHandler);
            form.removeEventListener("change", changeHandler);

            const target = event.target;
            const widget = target.closest(".paper-widget");
            const prevent_hook = target.closest("[data-hook-unload=\"prevent\"]") !== null;
            if (!prevent_hook && widget && form.contains(widget)) {
                formHasChanged = true;
            }
        }

        form.addEventListener("input", changeHandler);
        form.addEventListener("change", changeHandler);
    }
}
