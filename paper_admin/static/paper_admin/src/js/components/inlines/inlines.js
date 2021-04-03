/**
 * Класс для работы с инлайн-формами.
 * @namespace Formset
 */

import emitters from "js/components/emitters";
import {gsap} from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);


/**
 * Конструктор объектов ManagementForm
 * @param {Element} element
 * @constructor
 */
function ManagementForm(element) {
    this.element = element;
}

ManagementForm.prototype.__property = function(selector) {
    return function(value) {
        const input = this.element.querySelector(selector);
        if (typeof value === "undefined") {
            return parseInt(input.value.toString())
        } else {
            value = parseInt(value);
            if (!isNaN(value)) {
                input.value = value;
            }
        }
    }
}

ManagementForm.prototype.totalForms = ManagementForm.prototype.__property("input[name$=\"-TOTAL_FORMS\"]");
ManagementForm.prototype.minForms = ManagementForm.prototype.__property("input[name$=\"-MIN_NUM_FORMS\"]");
ManagementForm.prototype.maxForms = ManagementForm.prototype.__property("input[name$=\"-MAX_NUM_FORMS\"]");


/**
 * Конструктор объектов Formset
 *
 * @param {Element|Node} root
 * @param {Object} [options]
 * @constructor
 */
function Formset(root, options) {
    this.opts = Object.assign({
        prefix: "form",
        addButtonSelector: ".add-row",
        deleteButtonSelector: ".delete-row",
        formCssClass: "inline-related",
        emptyCssClass: "empty-form",
        animationSpeed: 300
    }, options);

    this.root = root;
    this.root._inline_formset = this;
    this.mgmt = new ManagementForm(root);

    // buttons
    this.addButton = this.root.querySelector(this.opts.addButtonSelector);
    if (!this.addButton) {
        throw new Error("addButton not found");
    }

    this.toggleAddButtonVisibility();
    this.toggleDeleteButtonVisibility();

    // events
    this.addButton.querySelector("a, button").addEventListener("click", function(event) {
        event.preventDefault();
        this.addRow();
    }.bind(this));

    const that = this;
    this.root.addEventListener("click", function(event) {
        const target = event.target;
        const button = target.closest(that.opts.deleteButtonSelector);
        if (button) {
            event.preventDefault();
            const row = target.closest("." + that.opts.formCssClass);
            that.deleteRow(row);
        }
    });
}


/**
 * Показ / скрытие кнопок удаления инлайн-форм в зависимости
 * от заданного минимального количества.
 */
Formset.prototype.toggleDeleteButtonVisibility = function() {
    const deleteButtons = this.root.querySelectorAll(this.opts.deleteButtonSelector);
    if (this.mgmt.totalForms() > this.mgmt.minForms()) {
        deleteButtons.forEach(function(button) {
            button.hidden = false;
        });
    } else {
        deleteButtons.forEach(function(button) {
            button.hidden = true;
        });
    }
}


/**
 * Показ / скрытие кнопки добавления инлайн-формы в зависимости
 * от заданного максимального количества.
 */
Formset.prototype.toggleAddButtonVisibility = function() {
    this.addButton.hidden = this.mgmt.totalForms() >= this.mgmt.maxForms();
}


/**
 * Активация / деактивация кнопок при анимации добавления / удаления форм.
 * @param {Boolean} enable
 */
Formset.prototype.toggleButtonState = function(enable) {
    this.addButton.disabled = !enable;
    this.addButton.classList.toggle("disabled", !enable);

    this.root.querySelectorAll(this.opts.deleteButtonSelector).forEach(function(button) {
        button.disabled = !enable;
        button.classList.toggle("disabled", !enable);
    });
}


/**
 * Установка порядкового номера всем элементам формы.
 * @param {Element|Node} row
 * @param {String} prefix
 * @param {Number} index
 */
function updateFormIndex(row, prefix, index) {
    const regex = new RegExp("(" + prefix + "-(\\d+|__prefix__))");
    const replacement = prefix + "-" + index;
    row.querySelectorAll("*").forEach(function(element) {
        if (element.htmlFor) {
            element.htmlFor = element.htmlFor.replace(regex, replacement);
        }
        if (element.id) {
            element.id = element.id.replace(regex, replacement);
        }
        if (element.name) {
            element.name = element.name.replace(regex, replacement);
        }
    });
    row.setAttribute("id", prefix + "-" + index);
}


/**
 * Обновление заголовка формы.
 * @param {Element|Node} row
 * @param {Number} index
 */
function updateInlineLabel(row, index) {
    const label = row.querySelector(".inline-label");
    if (label) {
        label.innerHTML = label.innerHTML.replace(/(#\d+)/g, "#" + index);
    }
}


/**
 * Получение всех форм, кроме шаблонной.
 * @returns {NodeListOf<Element>}
 */
Formset.prototype.getRows = function() {
    return this.root.querySelectorAll("." + this.opts.formCssClass + ":not(." + this.opts.emptyCssClass + ")");
}


/**
 * Обновление порядковых номеров для всех форм.
 */
Formset.prototype.updateFormIndexes = function() {
    const prefix = this.opts.prefix;
    this.getRows().forEach(function(row, index) {
        updateFormIndex(row, prefix, index);
        updateInlineLabel(row, index + 1);
    });
}


/**
 * Добавление новой формы.
 * @returns {?Node}
 */
Formset.prototype.addRow = function() {
    if (this.mgmt.totalForms() >= this.mgmt.maxForms()) {
        return null
    }

    const templateElement = this.root.querySelector("." + this.opts.emptyCssClass);
    if (!templateElement) {
        throw new Error("template form not found");
    }

    const row = templateElement.cloneNode(true);
    const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
    row.classList.remove(this.opts.emptyCssClass);
    templateElement.parentNode.insertBefore(row, templateElement);

    const formIndex = this.mgmt.totalForms()
    updateFormIndex(row, this.opts.prefix, formIndex);
    updateInlineLabel(row, formIndex + 1);

    emitters.inlines.trigger("add", [row, this.opts.prefix]);
    this.toggleButtonState(false);

    const addRowHandler = function() {
        let totalForms = this.mgmt.totalForms();
        this.mgmt.totalForms(++totalForms);

        this.toggleButtonState(true);
        this.toggleAddButtonVisibility();
        this.toggleDeleteButtonVisibility();
        this.updateFormIndexes();
        this.onRowAdded(row);
    }.bind(this);

    window.scrollTo({
        top: pageYOffset
    });

    if (row.tagName !== "TR") {
        gsap.from(row, {
            duration: this.opts.animationSpeed / 1000,
            height: 0,
            clearProps: "all",
            onComplete: addRowHandler
        });
    } else {
        addRowHandler();
    }

    return row;
}


/**
 * Событие, вызываемое после добавления новой формы.
 * @param {Element|Node} row
 */
Formset.prototype.onRowAdded = function(row) {
    emitters.dom.trigger("mutate", [row]);
    emitters.inlines.trigger("added", [row, this.opts.prefix]);

    // Django compatible
    $(document).trigger("formset:added", [$(row), this.opts.prefix]);
}


/**
 * Удаление формы.
 * @param {Element|Node} row
 */
Formset.prototype.deleteRow = function(row) {
    if (this.mgmt.totalForms() <= this.mgmt.minForms()) {
        return null
    }

    emitters.dom.trigger("release", [row]);
    emitters.inlines.trigger("remove", [row, this.opts.prefix]);
    this.toggleButtonState(false);

    const deleteRowHandler = function() {
        row.parentNode.removeChild(row);

        let totalForms = this.mgmt.totalForms();
        this.mgmt.totalForms(--totalForms);

        this.toggleButtonState(true);
        this.toggleAddButtonVisibility();
        this.toggleDeleteButtonVisibility();
        this.updateFormIndexes();
        this.onRowRemoved(row);
    }.bind(this);

    // animation
    if (row.tagName !== "TR") {
        gsap.to(row, {
            duration: this.opts.animationSpeed / 1000,
            height: 0,
            onComplete: deleteRowHandler
        });
    } else {
        deleteRowHandler();
    }
}


/**
 * Событие, вызываемое после удаления новой формы.
 * @param {Element|Node} row
 */
Formset.prototype.onRowRemoved = function(row) {
    emitters.inlines.trigger("removed", [row, this.opts.prefix]);

    // Django compatible
    $(document).trigger("formset:removed", [$(row), this.opts.prefix]);
}


export default Formset;
