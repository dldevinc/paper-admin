/**
 * Проверка, изменено ли поле пользователем.
 * В качестве параметра может выступать input, select или textarea.
 * @param {HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement} field
 * @returns {Boolean}
 */
function isChangedField(field) {
    switch (field.type) {
        case "checkbox":
        case "radio":
            return field.defaultChecked !== field.checked;
        case "button":
        case "image":
        case "reset":
        case "submit":
            return false;
        case "select-one":
        case "select-multiple":
            return Array.from(field.options).some(function(option) {
                return option.selected !== option.defaultSelected
            });
        default:
            return field.defaultValue !== field.value;
    }
}

/**
 * Проверка, содержит ли элемент внутри себя хотя бы одно поле,
 * измененное пользователем.
 * @param {Element} root
 * @returns {Boolean}
 */
function containsChangedField(root) {
    let fields = root.querySelectorAll("input, select, textarea");
    return Array.from(fields).some(isChangedField);
}


/**
 * Добавление ошибок к виджету поля формы.
 * @param {Element} widget
 * @param {(String|String[])=} errors
 */
function setWidgetErrors(widget, errors) {
    // возможность вызывать функцию как с виджетом, так и с полем, хранящемся в виджете
    if (!widget.classList.contains(".paper-widget")) {
        widget = widget.closest(".paper-widget");
        if (!widget) {
            throw new Error("widget not found");
        }
    }

    // очистка списка текущих ошибок
    let errorList = widget.nextElementSibling;
    if (errorList && errorList.classList.contains("paper-error-list")) {
        while (errorList.firstChild) {
            errorList.removeChild(errorList.lastChild);
        }
    } else {
        throw new Error("error list not found");
    }

    if (typeof errors === "string") {
        errors = [errors];
    }

    // оформление виджета, поля и вкладки
    if (errors && errors.length) {
        widget.classList.add("paper-widget--invalid");

        errors.forEach(function(error) {
            const errorListItem = document.createElement("li");
            errorListItem.innerText = error;
            errorList.append(errorListItem);
        });

        // form row
        let formRow = widget.closest(".paper-form__row");
        if (formRow) {
            formRow.classList.add("paper-form__row--invalid");
        }

        // tab
        let tabPane = widget.closest(".tab-pane");
        if (tabPane) {
            let tabButtonId = tabPane.getAttribute("aria-labelledby");
            let tabButton = tabButtonId && document.getElementById(tabButtonId);
            if (tabButton) {
                tabButton.classList.add("btn-outline-danger");
                tabButton.classList.remove("btn-outline-primary");
            }
        }
    } else {
        widget.classList.remove("paper-widget--invalid");

        // form row
        let formRow = widget.closest(".paper-form__row");
        if (formRow) {
            formRow.classList.remove("paper-form__row--invalid");
        }

        // tab
        let tabPane = widget.closest(".tab-pane");
        if (tabPane && !tabPane.querySelectorAll(".paper-widget--invalid").length) {
            let tabButtonId = tabPane.getAttribute("aria-labelledby");
            let tabButton = tabButtonId && document.getElementById(tabButtonId);
            if (tabButton) {
                tabButton.classList.remove("btn-outline-danger");
                tabButton.classList.add("btn-outline-primary");
            }
        }
    }
}

/**
 * Добавление ошибок к форме.
 * Может применяться к "document.body" или к ".paper-formset".
 * @param {Element} root
 * @param {String, String[]} errors
 */
function setFormErrors(root, errors) {
    // очистка списка текущих ошибок
    let errorList = root.querySelector(".paper-messages");
    if (errorList) {
        while (errorList.firstChild) {
            errorList.removeChild(errorList.lastChild);
        }
    } else {
        throw new Error("error list not found");
    }

    if (typeof errors === "string") {
        errors = [errors];
    }

    if (errors && errors.length) {
        errors.forEach(function(error) {
            const errorListItem = document.createElement("li");
            errorListItem.classList.add("paper-message", "paper-message--error");
            errorListItem.innerText = error;
            errorList.append(errorListItem);
        });
    }
}

/**
 * Удаление ошибок формы и полей.
 * @param {Element} root
 */
function cleanAllErrors(root=document.body) {
    setFormErrors(root, []);
    root.querySelectorAll(".paper-widget").forEach(function(widget) {
        setWidgetErrors(widget, []);
    });
}

/**
 * Добавление ошибок к форме из JSON.
 * Пример JSON:
 *  {
 *      "__all__": [
 *          {message: "Form invalid"}
 *      ],
 *      "name": [
 *          {message: "This field is required"},
 *          {message: "Ensure this value has at least 2 characters"},
 *      ]
 *  }
 * @param {Element} root
 * @param {object} json
 */
function setErrorsFromJSON(root, json) {
    for (let fieldName in json) {
        if (fieldName === "__all__") {
            setFormErrors(root, json[fieldName].map(record => record.message));
        } else {
            const formRow = root.querySelector(".field-" + fieldName);
            const widget = formRow && formRow.querySelector(".paper-widget");
            if (widget) {
                setWidgetErrors(widget, json[fieldName].map(record => record.message));
            }
        }
    }
}


const formUtils = {
    isChangedField,
    containsChangedField,

    setWidgetErrors,
    setFormErrors,
    cleanAllErrors,
    setErrorsFromJSON
};

export default formUtils;
