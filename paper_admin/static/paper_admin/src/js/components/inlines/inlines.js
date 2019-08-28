/**
 * Класс для работы с инлайн-формами.
 * @namespace Formset
 */

import whenDomReady from "when-dom-ready";
import emitters from "../emitters";


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
        if (typeof value === 'undefined') {
            return parseInt(input.value.toString())
        } else {
            value = parseInt(value);
            if (!isNaN(value)) {
                input.value = value;
            }
        }
    }
};

ManagementForm.prototype.totalForms = ManagementForm.prototype.__property('input[name$="-TOTAL_FORMS"]');
ManagementForm.prototype.maxForms = ManagementForm.prototype.__property('input[name$="-MAX_NUM_FORMS"]');


/**
 * Конструктор объектов Formset
 *
 * @param {Element|Node} root
 * @param {Object} [options]
 * @constructor
 */
function Formset(root, options) {
    this.opts = Object.assign({
        prefix: 'form',
        addButtonSelector: '.add-row',
        deleteButtonSelector: '.delete-row',
        formCssClass: 'inline-related',
        emptyCssClass: 'empty-form',
        onAdded: null,
        onRemove: null
    }, options);

    this.root = root;
    this.mgmt = new ManagementForm(root);

    this.addButton = this.root.querySelector(this.opts.addButtonSelector);
    if (!this.addButton) {
        throw new Error('addButton not found');
    }
    this.addButton.hidden = this.mgmt.totalForms() >= this.mgmt.maxForms();
    this.addButton.querySelector('a, button').addEventListener('click', function(event) {
        event.preventDefault();
        this.addRow();
    }.bind(this));

    const that = this;
    this.root.addEventListener('click', function(event) {
        const target = event.target;
        const button = target.closest(that.opts.deleteButtonSelector);
        if (button) {
            event.preventDefault();
            const row = target.closest('.' + that.opts.formCssClass);
            that.deleteRow(row);
        }
    });
}


/**
 * Получение всех форм.
 * @returns {NodeListOf<Element>}
 */
Formset.prototype.getRows = function() {
    return this.root.querySelectorAll('.' + this.opts.formCssClass);
};


/**
 * Добавление новой формы.
 * @returns {?Node}
 */
Formset.prototype.addRow = function() {
    let totalForms = this.mgmt.totalForms();
    const maxForms = this.mgmt.maxForms();
    if (totalForms >= maxForms) {
        return null
    }

    const templateElement = this.root.querySelector('.' + this.opts.emptyCssClass);
    if (!templateElement) {
        throw new Error('template form not found');
    }

    const row = templateElement.cloneNode(true);
    row.classList.remove(this.opts.emptyCssClass);
    templateElement.parentNode.insertBefore(row, templateElement);

    this.mgmt.totalForms(++totalForms);

    // addButton
    this.addButton.hidden = totalForms >= maxForms;

    // deleteButton
    const deleteButton = row.querySelector(this.opts.deleteButtonSelector);
    if (deleteButton) {
        deleteButton.hidden = false;
    }

    // event
    if (this.opts.onAdded) {
        this.opts.onAdded.call(this, row, this.opts.prefix, totalForms);
    }
    emitters.dom.trigger('mutate', [row]);
    emitters.inlines.trigger('added', [row, this.opts.prefix]);

    // Django compatible
    $(document).trigger('formset:added', [$(row), this.opts.prefix]);

    return row;
};


/**
 * Удаление формы.
 * @param {Element|Node} row
 */
Formset.prototype.deleteRow = function(row) {
    let totalForms = this.mgmt.totalForms();

    const rows = Array.from(this.getRows());
    const row_index = rows.indexOf(row);
    if (this.opts.onRemove) {
        for (let i=row_index+1; i<rows.length; i++) {
            this.opts.onRemove.call(this, rows[i], this.opts.prefix, i);
        }
    }

    // event
    emitters.dom.trigger('release', [row]);
    emitters.inlines.trigger('remove', [row, this.opts.prefix]);

    row.parentNode.removeChild(row);

    // event
    emitters.inlines.trigger('removed', [row, this.opts.prefix]);

    // Django compatible
    $(document).trigger('formset:removed', [$(row), this.opts.prefix]);

    this.mgmt.totalForms(--totalForms);

    // addButton
    this.addButton.hidden = totalForms >= this.mgmt.maxForms();
};


/**
 * Установка порядкового номера всем элементам формы.
 * @param {Element|Node} row
 * @param {String} prefix
 * @param {Number} index
 */
function updateFormIndex(row, prefix, index) {
    const regex = new RegExp("(" + prefix + "-(\\d+|__prefix__))");
    const replacement = prefix + "-" + (index - 1);
    row.querySelectorAll('*').forEach(function(element) {
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
    row.setAttribute('id', prefix + '-' + (index - 1));
}


/**
 * Обновление заголовка формы.
 * @param {Element|Node} row
 * @param {Number} index
 */
function updateInlineLabel(row, index) {
    const label = row.querySelector('.inline-label');
    if (label) {
        label.innerHTML = label.innerHTML.replace(/(#\d+)/g, "#" + index);
    }
}


function initInlineGroups(root = document.body) {
    root.querySelectorAll('.inline-group').forEach(function(inlineGroup) {
        switch(inlineGroup.dataset.inlineType) {
            case "stacked":
                new Formset(inlineGroup, {
                    prefix: inlineGroup.dataset.inlinePrefix,
                    onAdded: function(row, prefix, index) {
                        updateFormIndex(row, prefix, index);
                        updateInlineLabel(row, index);
                    },
                    onRemove: function(row, prefix, index) {
                        updateFormIndex(row, prefix, index);
                        updateInlineLabel(row, index);
                    }
                });
                break;
            case "tabular":
                new Formset(inlineGroup, {
                    prefix: inlineGroup.dataset.inlinePrefix,
                    onAdded: function(row, prefix, index) {
                        updateFormIndex(row, prefix, index);
                    },
                    onRemove: function(row, prefix, index) {
                        updateFormIndex(row, prefix, index);
                    }
                });
                break;
        }
    });
}


whenDomReady(initInlineGroups);
