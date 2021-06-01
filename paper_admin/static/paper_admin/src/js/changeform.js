import formUtils from "js/utilities/form_utils";
import {Select2Widget} from "components/select2";
import {InlineFormset} from "bem/paper-formset/paper-formset";

// Select2 для выпадающих списков
const select2_changeform = new Select2Widget({
    width: "",
    allowClear: true
});
select2_changeform.observe(".select-field select");
select2_changeform.initAll(".select-field select");

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
