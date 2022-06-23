import ManagementForm from "./_management-form.js";

/**
 * Базовый класс для Django-формсетов.
 *
 * Основные приципы работы:
 * 1) Желательно задать корневому элементу формсета уникальный ID, чтобы иметь
 *    возможность указать зависимым элементам, с каким именно формсетом они будут работать.
 *
 * 2) Префикс формсета задается через атрибут "data-formset-prefix".
 *
 * 3) Контейнер для форм задается атрибутом "data-formset-form-container".
 *
 * 4) Селектор форм формсета задается атрибутом "data-formset-form-selector".
 *
 * 5) Шаблонный элемент для новых форм задается через атрибут "data-formset-form-template".
 *
 *      <div id="example-formset"
 *           data-formset-prefix="example"
 *           data-formset-form-container=".example-forms"
 *           data-formset-form-selector=".example-form"
 *           data-formset-form-template="example-form-template">
 *        <div class="example-forms">
 *          ...
 *        </div>
 *      </div>
 *
 *      <template id="example-form-template">
 *        <div class="example-form">
 *          ...
 *        </div>
 *      </template>
 *
 * 6) Кнопки добавления формы должна иметь атрибут data-formset-toggle="add".
 *    Если кнопка находится за пределами корневого элемента формсета, необходимо
 *    добавить атрибут "data-formset" с ID формсета.
 *
 *      <button data-formset-toggle="add" data-formset="example-formset">
 *        Add form
 *      </button>
 *
 * 7) Кнопка удаления ещё не сохраненной формы должна иметь атрибут
 *    data-formset-toggle="delete" и располагаться в пределах формы.
 *
 *      <button data-formset-toggle="delete">
 *        Delete this form
 *      </button>
 *
 * 8) Кнопки сортировки форм должны иметь атрибут "data-formset-toggle" со
 *    значениями "up" либо "down" и располагаться в пределах формы.
 *
 */
class Formset {
    constructor(root) {
        this.root = root;
        this.management_form = new ManagementForm(root);

        this._initAddFormButtons();
        this._initDeleteFormButtons();
        this._initSortFormButtons();

        // Обновление начальных индексов, т.к. формы могут быть изначально перемешаны
        // при первоначальном отображении страницы из-за ошибки валидации.
        this.updateFormIndexes();
    }

    /**
     * @return {string}
     */
    get prefix() {
        const prefix = this.root.dataset.formsetPrefix;
        if (!prefix) {
            throw new Error("formset prefix required");
        }

        return prefix;
    }

    /**
     * @return {HTMLElement}
     */
    get formContainer() {
        const selector = this.root.dataset.formsetFormContainer;
        if (!selector) {
            throw new Error("container selector required");
        }

        const container = this.root.querySelector(selector);
        if (!container) {
            throw new Error("container not found");
        }

        return container;
    }

    /**
     * @return {string}
     */
    get formSelector() {
        const formSelector = this.root.dataset.formsetFormSelector;
        if (!formSelector) {
            throw new Error("form selector required");
        }

        return formSelector;
    }

    /**
     * @return {string}
     */
    get templateId() {
        const templateId = this.root.dataset.formsetFormTemplate;
        if (!templateId) {
            throw new Error("form template ID required");
        }

        return templateId;
    }

    /**
     * @return {HTMLElement}
     */
    get formTemplate() {
        const templateElement = document.getElementById(this.templateId);
        if (!templateElement) {
            throw new Error("form template element not found");
        }

        return templateElement;
    }

    /**
     * Возвращает текущие формы формсета.
     * @returns {NodeListOf<HTMLElement>}
     */
    getForms() {
        return this.formContainer.querySelectorAll(this.formSelector);
    }

    /**
     * Возвращает порядковый номер формы в формсете.
     * !! Внимание !! Это не тот же индекс, что передается в setFormIndex !!
     * @param {HTMLElement} form
     * @returns {number}
     */
    getFormIndex(form) {
        return Array.from(this.getForms()).indexOf(form);
    }

    /**
     * Возвращает массив кнопок добавления формы в формсет.
     * @returns {HTMLElement[]}
     */
    getAddFormButtons() {
        const buttons = [];

        document.querySelectorAll('[data-formset-toggle="add"]').forEach(button => {
            if (this.root.id && button.dataset.formset === this.root.id) {
                buttons.push(button);
            } else if (this.root.contains(button) && !button.dataset.formset) {
                buttons.push(button);
            }
        });

        return buttons;
    }

    /**
     * Возвращает массив кнопок удаления форм.
     * @returns {HTMLElement[]}
     */
    getDeleteFormButtons() {
        let buttons = [];

        this.getForms().forEach(form => {
            const deleteFormButtons = form.querySelectorAll('[data-formset-toggle="delete"]');
            if (deleteFormButtons.length) {
                buttons = buttons.concat(Array.from(deleteFormButtons));
            }
        });

        return buttons;
    }

    /**
     * Возвращает массив кнопок сортировки форм.
     * @returns {HTMLElement[]}
     */
    getSortFormButtons() {
        let buttons = [];

        this.getForms().forEach(form => {
            const moveUpButtons = form.querySelectorAll('[data-formset-toggle="up"]');
            if (moveUpButtons.length) {
                buttons = buttons.concat(Array.from(moveUpButtons));
            }

            const moveDownButtons = form.querySelectorAll('[data-formset-toggle="down"]');
            if (moveDownButtons.length) {
                buttons = buttons.concat(Array.from(moveDownButtons));
            }
        });

        return buttons;
    }

    /**
     * Возвращает True, если с формой связан существующий экземпляр модели.
     * @param {HTMLElement} form
     * @returns {boolean}
     */
    hasOriginal(form) {
        return form.classList.contains("has_original");
    }

    /**
     * Включение/выключение кнопки добавления формы.
     * @param {HTMLElement} button
     * @param {Boolean} state
     */
    setAddFormButtonState(button, state) {
        button.disabled = !state;
    }

    /**
     * Включение/выключение кнопки удаления формы.
     * @param {HTMLElement} button
     * @param {Boolean} state
     */
    setDeleteFormButtonState(button, state) {
        button.disabled = !state;
    }

    /**
     * Включение/выключение кнопки сортировки форм.
     * @param {HTMLElement} button
     * @param {Boolean} state
     */
    setSortFormButtonState(button, state) {
        button.disabled = !state;
    }

    _initAddFormButtons() {
        document.addEventListener("click", event => {
            const button = event.target.closest('[data-formset-toggle="add"]');
            if (button) {
                if (this.root.id && button.dataset.formset === this.root.id) {
                    this.addForm();
                } else if (this.root.contains(button) && !button.dataset.formset) {
                    this.addForm();
                }
            }
        });
    }

    _initDeleteFormButtons() {
        document.addEventListener("click", event => {
            const button = event.target.closest('[data-formset-toggle="delete"]');
            if (button && this.root.contains(button)) {
                const form = button.closest(this.formSelector);
                if (form) {
                    this.deleteForm(form);
                }
            }
        });
    }

    _initSortFormButtons() {
        document.addEventListener("click", event => {
            const moveUpButton = event.target.closest('[data-formset-toggle="up"]');
            const moveDownButton = event.target.closest('[data-formset-toggle="down"]');

            if (moveUpButton && this.root.contains(moveUpButton)) {
                const form = moveUpButton.closest(this.formSelector);
                if (form) {
                    this.moveFormUp(form);
                }
            } else if (moveDownButton && this.root.contains(moveDownButton)) {
                const form = moveDownButton.closest(this.formSelector);
                if (form) {
                    this.moveFormDown(form);
                }
            }
        });
    }

    /**
     * Добавление новой формы из шаблона.
     * @return {HTMLElement}
     */
    addForm() {
        if (this.management_form.totalForms >= this.management_form.maxForms) {
            throw new Error("Maximum number of forms is reached");
        }

        const formFragment = this.formTemplate.content.cloneNode(true);
        const form = formFragment.children[0];

        this.formContainer.appendChild(formFragment);

        this.management_form.totalForms++;

        this.updateFormIndexes();
        this.updateFormOrder();
        this.updateButtonsState();

        return form;
    }

    /**
     * Удаление формы из формсета.
     * @param {HTMLElement} form
     */
    deleteForm(form) {
        if (this.management_form.totalForms <= this.management_form.minForms) {
            throw new Error("Minimum number of forms is reached");
        }

        this.management_form.totalForms--;

        form.remove();

        this.updateFormIndexes();
        this.updateFormOrder();
        this.updateButtonsState();
    }

    /**
     * Перемещение формы на одну позицию выше в списке форм.
     * @param {HTMLElement} form
     */
    moveFormUp(form) {
        const formIndex = this.getFormIndex(form);
        if (formIndex === 0) {
            throw new Error("form is already first");
        }

        const previousForm = this.getForms()[formIndex - 1];
        form.after(previousForm);

        this.updateFormIndexes();
        this.updateFormOrder();
        this.updateButtonsState();
    }

    /**
     * Перемещение формы на одну позицию ниже в списке форм.
     * @param {HTMLElement} form
     */
    moveFormDown(form) {
        const formCount = this.getForms().length;
        const formIndex = this.getFormIndex(form);
        if (formIndex === formCount - 1) {
            throw new Error("form is already last");
        }

        const nextForm = this.getForms()[formIndex + 1];
        form.before(nextForm);

        this.updateFormIndexes();
        this.updateFormOrder();
        this.updateButtonsState();
    }

    /**
     * Установка Django-индекса для всех форм с учётом наличия связи с экземпляром
     * модели и порядком в DOM.
     * Можно указать форму, которую следует пропустить при обходе. Это позволит
     * указать корректные Django-индексы при удалении, не дожидаясь физического
     * удаления формы из DOM.
     * @param {HTMLElement} skip
     */
    updateFormIndexes(skip = null) {
        let index = 0;

        // Формы, связанные с экземплярами, индексируем в первую очередь,
        // чтобы на бэкенде всё работало корректно.
        this.getForms().forEach(form => {
            if ((form !== skip) && this.hasOriginal(form)) {
                this.setFormIndex(form, index++);
            }
        });

        this.getForms().forEach(form => {
            if ((form !== skip) && !this.hasOriginal(form)) {
                this.setFormIndex(form, index++);
            }
        });
    }

    /**
     * Установка Django-индекса формы для всех элементов в пределах формы.
     * @param {HTMLElement} form
     * @param {Number} index
     */
    setFormIndex(form, index) {
        this._setElementIndex(form, index);
        form.querySelectorAll("*").forEach(element => {
            this._setElementIndex(element, index);
        });
    }

    /**
     * Установка Django-индекса формы в атрибутах указанного элемента.
     * @param {HTMLElement} element
     * @param {Number} index
     * @private
     */
    _setElementIndex(element, index) {
        const regex = new RegExp("(" + this.prefix + "-(\\d+|__prefix__))");
        const replacement = this.prefix + "-" + index;

        if (element.htmlFor) {
            element.htmlFor = element.htmlFor.replace(regex, replacement);
        }

        if (element.id) {
            element.id = element.id.replace(regex, replacement);
        }

        if (element.name) {
            element.name = element.name.replace(regex, replacement);
        }
    }

    /**
     * Установка поля сортировки для всех форм в соответствии с их порядком в DOM.
     * Можно указать форму, которую следует пропустить при обходе. Это позволит
     * указать корректную сортировку при удалении, не дожидаясь физического
     * удаления формы из DOM.
     * @param {HTMLElement} skip
     */
    updateFormOrder(skip = null) {
        let index = 0;
        this.getForms().forEach(form => {
            if (form !== skip) {
                this.setFormOrder(form, index++);
            }
        });
    }

    /**
     * Установка значения в поле сортровки формы.
     * @param {HTMLElement} form
     * @param {Number} value
     */
    setFormOrder(form, value) {}

    /**
     * Обновление стостояния всех кнопок формсета.
     */
    updateButtonsState() {
        const disableAdd = this.management_form.totalForms >= this.management_form.maxForms;
        this.getAddFormButtons().forEach(button => {
            this.setAddFormButtonState(button, !disableAdd);
        });

        const disableDelete = this.management_form.totalForms <= this.management_form.minForms;
        this.getDeleteFormButtons().forEach(button => {
            this.setDeleteFormButtonState(button, !disableDelete);
        });

        const formCount = this.getForms().length;
        this.getSortFormButtons().forEach(button => {
            const form = button.closest(this.formSelector);
            const formIndex = this.getFormIndex(form);
            const direction = button.dataset.formsetToggle;
            let state = true;

            if (formIndex === 0 && direction === "up") {
                state = false;
            }

            if (formIndex === formCount - 1 && direction === "down") {
                state = false;
            }

            this.setSortFormButtonState(button, state);
        });
    }
}

export default Formset;
