import whenDomReady from "when-dom-ready";
import formUtils from "../form_utils";
import SortButtons from "./SortButtons";


whenDomReady(function() {
    const inlineGroups = document.querySelectorAll('.sortable-inline-group');
    inlineGroups.forEach(function(inlineGroup) {
        const sortButtonsObj = new SortButtons(inlineGroup, {
            speed: inlineGroup.dataset.inlineType === 'tabular' ? 0.25 : 0.5,
            items: '.sortable-item',
            moveUpBtn: '.sortable-move-up',
            moveDownBtn: '.sortable-move-down',
            ignore: '.empty-form'
        });

        inlineGroup.addEventListener('row-added', function() {
            sortButtonsObj.updateBounds();
        });
    });
});


/**
 * Установка значения сортировки инлайн-формам.
 * @param {Element} inlineGroup
 */
function fillInlineOrder(inlineGroup) {
    let currentOrder = 0;
    const inlineForms = inlineGroup.querySelectorAll('.sortable-item:not(.empty-form)');
    inlineForms.forEach(function(inlineForm) {
        if (inlineForm.classList.contains('has_original')
            || formUtils.containsChangedField(inlineForm)) {
            const input = inlineForm.querySelector('.sortable-input');
            if (input) {
                input.value = currentOrder++;
            }
        }
    });
}


/**
 * Замена индекса формы на порядковый, чтобы бэкенд Django отображал
 * формы в правильном порядке при ошибках валидации.
 * @param {Element} row
 * @param {String} prefix
 * @param {Number} index
 */
function replaceFormIndex(row, prefix, index) {
    const regex = new RegExp("(" + prefix + "-(\\d+))");
    const replacement = prefix + "-" + index;
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
    row.setAttribute('id', prefix + '-' + index);
}


document.addEventListener('submit', function(event) {
    const form = event.target;
    const inlineGroups = form.querySelectorAll('.sortable-inline-group');
    inlineGroups.forEach(function(inlineGroup) {
        fillInlineOrder(inlineGroup);

        const inlineFormset = inlineGroup._inline_formset;
        const selector = '.' + inlineFormset.opts.formCssClass + ':not(.' + inlineFormset.opts.emptyCssClass + ')';
        inlineGroup.querySelectorAll(selector).forEach(function(form, index) {
            replaceFormIndex(form, inlineFormset.opts.prefix, index);
        });
    });
});
