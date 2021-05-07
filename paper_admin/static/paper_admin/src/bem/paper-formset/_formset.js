import ManagementForm from "./_management-form";


/**
 * Базовый класс для Django-формсетов.
 *
 * Основные приципы работы:
 * 1) Желательно задать корневому элементу форсета уникальный ID, чтобы иметь
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

        // TODO: для тестов и дебага
        this.root._formset = this;

        this._initAddFormButtons();
        this._initDeleteFormButtons();
        this._initSortFormButtons();

        // this.updateFormIndexes();    // Django-индексы ставятся автоматически
        this.updateFormOrder();
        this.updateButtonsState();
    }

    get prefix() {
        const prefix = this.root.dataset.formsetPrefix;
        if (!prefix) {
            throw new Error("formset prefix required");
        }

        return prefix;
    }

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

    get formSelector() {
        const formSelector = this.root.dataset.formsetFormSelector;
        if (!formSelector) {
            throw new Error("form selector required");
        }

        return formSelector;
    }

    get templateId() {
        const templateId = this.root.dataset.formsetFormTemplate;
        if (!templateId) {
            throw new Error("form template ID required");
        }

        return templateId;
    }

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
        let buttons = [];

        document.querySelectorAll("[data-formset-toggle=\"add\"]").forEach(function(button) {
            if (this.root.id && (button.dataset.formset === this.root.id)) {
                buttons.push(button);
            } else if (this.root.contains(button) && !button.dataset.formset) {
                buttons.push(button);
            }
        }.bind(this));

        return buttons;
    }

    /**
     * Возвращает массив кнопок удаления форм.
     * @returns {HTMLElement[]}
     */
    getDeleteFormButtons() {
        let buttons = [];

        this.getForms().forEach(function(form) {
            let deleteFormButtons = form.querySelectorAll("[data-formset-toggle=\"delete\"]");
            if (deleteFormButtons.length) {
                buttons = buttons.concat(Array.from(deleteFormButtons));
            }
        }.bind(this));

        return buttons;
    }

    /**
     * Возвращает массив кнопок сортировки форм.
     * @returns {HTMLElement[]}
     */
    getSortFormButtons() {
        let buttons = [];

        this.getForms().forEach(function(form) {
            let moveUpButtons = form.querySelectorAll("[data-formset-toggle=\"up\"]");
            if (moveUpButtons.length) {
                buttons = buttons.concat(Array.from(moveUpButtons));
            }

            let moveDownButtons = form.querySelectorAll("[data-formset-toggle=\"down\"]");
            if (moveDownButtons.length) {
                buttons = buttons.concat(Array.from(moveDownButtons));
            }
        }.bind(this));

        return buttons;
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
        document.addEventListener("click", function(event) {
            let button = event.target.closest("[data-formset-toggle=\"add\"]");
            if (button) {
                if (this.root.id && (button.dataset.formset === this.root.id)) {
                    this.addForm();
                } else if (this.root.contains(button) && !button.dataset.formset) {
                    this.addForm();
                }
            }
        }.bind(this));
    }

    _initDeleteFormButtons() {
        document.addEventListener("click", function(event) {
            let button = event.target.closest("[data-formset-toggle=\"delete\"]");
            if (button && this.root.contains(button)) {
                let form = button.closest(this.formSelector);
                if (form) {
                    this.deleteForm(form);
                }
            }
        }.bind(this));
    }

    _initSortFormButtons() {
        document.addEventListener("click", function(event) {
            let moveUpButton = event.target.closest("[data-formset-toggle=\"up\"]");
            let moveDownButton = event.target.closest("[data-formset-toggle=\"down\"]");

            if (moveUpButton && this.root.contains(moveUpButton)) {
                let form = moveUpButton.closest(this.formSelector);
                if (form) {
                    this.moveFormUp(form);
                }
            } else if (moveDownButton && this.root.contains(moveDownButton)) {
                let form = moveDownButton.closest(this.formSelector);
                if (form) {
                    this.moveFormDown(form);
                }
            }
        }.bind(this));
    }

    addForm() {
        if (this.management_form.totalForms >= this.management_form.maxForms) {
            throw new Error("Maximum number of forms is reached");
        }

        let formFragment = this.formTemplate.content.cloneNode(true);
        let form = formFragment.children[0];

        this.formContainer.appendChild(formFragment);

        this.management_form.totalForms++;

        this.updateFormIndexes();
        this.updateFormOrder();
        this.updateButtonsState();

        return form;
    }

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
     * Установка Django-индекса для всех форм в соответствии с их порядком в DOM.
     * Можно указать форму, которую следует пропустить при обходе. Это позволит
     * указать корректные Django-индексы при удалении, не дожидаясь физического
     * удаления формы из DOM.
     * @param {HTMLElement} skip
     */
    updateFormIndexes(skip = null) {
        let index = 0;
        this.getForms().forEach(function(form) {
            if (form !== skip) {
                this.setFormIndex(form, index++);
            }
        }.bind(this));
    }

    /**
     * Установка Django-индекса формы для всех элементов в пределах формы.
     * @param {HTMLElement} form
     * @param {Number} index
     */
    setFormIndex(form, index) {
        this._setElementIndex(form, index);
        form.querySelectorAll("*").forEach(function(element) {
            this._setElementIndex(element, index);
        }.bind(this));
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
        this.getForms().forEach(function(form) {
            if (form !== skip) {
                this.setFormOrder(form, index++);
            }
        }.bind(this));
    }

    /**
     * Установка значения в поле сортровки формы.
     * @param {HTMLElement} form
     * @param {Number} value
     */
    setFormOrder(form, value) {

    }

    /**
     * Обновление стостояния всех кнопок формсета.
     */
    updateButtonsState() {
        const disableAdd = this.management_form.totalForms >= this.management_form.maxForms;
        this.getAddFormButtons().forEach(function(button) {
            this.setAddFormButtonState(button, !disableAdd);
        }.bind(this));

        const disableDelete = this.management_form.totalForms <= this.management_form.minForms;
        this.getDeleteFormButtons().forEach(function(button) {
            this.setDeleteFormButtonState(button, !disableDelete);
        }.bind(this));

        const formCount = this.getForms().length;
        this.getSortFormButtons().forEach(function(button) {
            const form = button.closest(this.formSelector);
            const formIndex = this.getFormIndex(form);
            const direction = button.dataset.formsetToggle;
            let state = true;

            if ((formIndex === 0) && (direction === "up")) {
                state = false;
            }

            if ((formIndex === (formCount - 1)) && (direction === "down")) {
                state = false;
            }

            this.setSortFormButtonState(button, state);
        }.bind(this));
    }
}

export default Formset;
