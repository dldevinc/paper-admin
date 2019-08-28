/**
 * Проверка, изменено ли поле пользователем.
 * В качестве параметра может выступать input, select или textarea.
 * @param {HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement} field
 * @returns {Boolean}
 */
function isChangedField(field) {
    switch (field.type) {
        case 'checkbox':
        case 'radio':
            return field.defaultChecked !== field.checked;
        case 'button':
        case 'image':
        case 'reset':
        case 'submit':
            return false;
        case 'select-one':
        case 'select-multiple':
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
    let fields = root.querySelectorAll('input, select, textarea');
    return Array.from(fields).some(isChangedField);
}


/**
 * Добавление ошибок к виджету поля формы.
 * @param {Element} field
 * @param {String, String[]} errors
 */
function addFieldError(field, errors) {
    let errorList = field.querySelector('.invalid-feedback ul');
    if (errorList === null) {
        errorList = document.createElement('ul');
        errorList.classList.add('list-unstyled', 'mb-0');

        const feedback = document.createElement('div');
        feedback.classList.add('invalid-feedback');
        feedback.append(errorList);
        field.append(feedback);
    }

    if (typeof errors === 'string') {
        const errorListItem = document.createElement('li');
        errorListItem.innerText = errors;
        errorList.append(errorListItem);
    } else {
        errors.forEach(function(error) {
            const errorListItem = document.createElement('li');
            errorListItem.innerText = error;
            errorList.append(errorListItem);
        });
    }
}

/**
 * Удаление ошибок поля.
 * @param {Element} field
 */
function cleanFieldErrors(field) {
    let errorList = field.querySelector('.invalid-feedback ul');
    if (errorList) {
        errorList.innerHTML = '';
    }
}


/**
 * Добавление ошибок к форме.
 * Может применяться к body или к инлайн-форме.
 * @param {Element} form
 * @param {String, String[]} errors
 */
function addFormError(form, errors) {
    let errorList = form.querySelector('.messages.list-group');
    if (errorList === null) {
        errorList = document.createElement('ul');
        errorList.classList.add('messages', 'list-group');
        form.prepend(errorList);
    }

    if (typeof errors === 'string') {
        const errorListItem = document.createElement('li');
        errorListItem.classList.add('list-group-item', 'list-group-item-danger');
        errorListItem.innerText = errors;
        errorList.append(errorListItem);
    } else {
        errors.forEach(function(error) {
            const errorListItem = document.createElement('li');
            errorListItem.classList.add('list-group-item', 'list-group-item-danger');
            errorListItem.innerText = error;
            errorList.append(errorListItem);
        });
    }
}

/**
 * Удаление ошибок формы и скрытие ошибок полей.
 * @param {Element} form
 */
function cleanFormErrors(form) {
    let errorLists = form.querySelectorAll('.messages.list-group');
    errorLists.forEach(function(errorList) {
        errorList.innerHTML = '';
    });

    form.querySelectorAll('.invalid').forEach(function(field) {
        field.classList.remove('invalid');
    });
}


/**
 * Добавление ошибок к форме из JSON.
 * Пример JSON:
 *  {
 *      'name': [
 *          {message: 'This field is required'},
 *          {message: 'Ensure this value has at least 2 characters'},
 *      ]
 *  }
 * @param {Element} form
 * @param {object} json
 */
function addFormErrorsFromJSON(form, json) {
    for (let fieldName in json) {
        if (fieldName === '__all__') {
            addFormError(form, json[fieldName].map(record => record.message))
        } else {
            const field = form.querySelector('.field-' + fieldName);
            if (field) {
                cleanFieldErrors(field);
                addFieldError(field, json[fieldName].map(record => record.message));
                field.classList.add('invalid');
            }
        }
    }
}


const formUtils = {
    isChangedField,
    containsChangedField,

    addFieldError,
    cleanFieldErrors,

    addFormError,
    cleanFormErrors,

    addFormErrorsFromJSON
};
export default formUtils;


// share plugin
window.paperAdmin = window.paperAdmin || {};
Object.assign(window.paperAdmin, {
    formUtils: formUtils,
});
