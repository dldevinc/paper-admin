/* global gettext */
import formUtils from "js/utilities/form_utils.js";
import { Select2Widget } from "components/select2";
import { InlineFormset } from "bem/paper-formset/paper-formset.js";
import "bem/scroll-top-button/scroll-top-button.js";

// Select2 для выпадающих списков
const select2_changeform = new Select2Widget({
    width: "",
    allowClear: true
});
select2_changeform.observe(".select-field select");
select2_changeform.initAll(".select-field select");

// Инициализация inline-форм
let formsets = [];
document.querySelectorAll(".paper-formset").forEach(element => {
    const formset = new InlineFormset(element);
    formset.updateButtonsState();
    formsets.push(formset);
});

// Предотвращение повторного сохранения
let submitted = false;
const form = document.querySelector(".paper-form");
form.addEventListener("submit", event => {
    event.preventDefault();
    if (submitted) {
        const answer = window.confirm(gettext("You have already submitted this form. Are you sure you want to submit it again?"));
        if (!answer) {
            return;
        }
    }
    event.target.submit();
    submitted = true;
});

// Установка значения поля сортировки перед сохранением.
// Назначить сортировку сразу нельзя из-за того, что extra-формы не должны меняться.
document.addEventListener("submit", () => {
    formsets.forEach(formset => {
        let index = 0;
        formset.getForms().forEach(form => {
            if (form.classList.contains("has_original") || formUtils.containsChangedField(form)) {
                formset.setFormOrder(form, index++);
            }
        });
    });
});
