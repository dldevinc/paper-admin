/* global gettext */
import formUtils from "js/utilities/form_utils.js";
import { InlineFormset } from "bem/paper-formset/paper-formset.js";

// -----------------
//  BEM
// -----------------
import "bem/paper-tabs/paper-tabs.js";
import "bem/scroll-top-button/scroll-top-button.js";

// -----------------
//  Styles
// -----------------
import "css/changeform.scss";

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
form &&
    form.addEventListener("submit", event => {
        if (!submitted) {
            submitted = true;
            return;
        }

        event.preventDefault();
        const answer = window.confirm(
            gettext("You have already submitted this form. Are you sure you want to submit it again?")
        );
        if (!answer) {
            return;
        }
        event.target.submit();
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
