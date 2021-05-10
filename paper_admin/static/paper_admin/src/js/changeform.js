import formUtils from "js/utilities/form_utils";
import "js/widgets/clearable_file";
import "js/widgets/multiselect";
import "js/components/RelatedObjectLookups";
import "js/components/prepopulate/prepopulate";
import {InlineFormset} from "bem/paper-formset/paper-formset";

// Инициализация inline-форм
let formsets = [];
document.querySelectorAll(".paper-formset").forEach(function(element) {
    let formset = new InlineFormset(element);
    formset.updateButtonsState();
    formsets.push(formset);
});

// Установка значения поля сортировки перед сохранением.
// Назначить сортировку сразу нельзя из-за того, что extra-формы не должны меняться.
document.addEventListener("submit", function() {
    formsets.forEach(function(formset) {
        let index = 0;
        formset.getForms().forEach(function(form) {
            if (form.classList.contains("has_original") || formUtils.containsChangedField(form)) {
                this.setFormOrder(form, index++);
            }
        }.bind(formset));
    });
});
