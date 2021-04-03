import emitters from "js/components/emitters";
import formUtils from "js/components/form_utils";
import Formset from "js/components/inlines/inlines";
import SortButtons from "js/components/inlines/SortButtons";


/**
 * Конструктор объектов SortableFormset.
 *
 * @param {Element|Node} root
 * @param {Object} [options]
 * @constructor
 */
function SortableFormset(root, options) {
    Formset.call(this, root, options);

    this.sortButtons = new SortButtons(root, {
        speed: root.dataset.inlineType === "tabular" ? 0.25 : 0.5,
        items: ".sortable-item",
        moveUpBtn: ".sortable-move-up",
        moveDownBtn: ".sortable-move-down",
        ignore: ".empty-form"
    });

    const that = this;
    emitters.inlines.on("added", function() {
        that.sortButtons.updateBounds();
    });

    emitters.inlines.on("removed", function() {
        that.sortButtons.updateBounds();
    });

    // установка значения поля сортировки перед сохранением
    document.addEventListener("submit", function() {
        that.updateFormIndexes();

        let currentOrder = 0;
        that.sortButtons.getItems().forEach(function(item) {
            if (item.classList.contains("has_original")
                || formUtils.containsChangedField(item)) {
                const input = item.querySelector(".sortable-input");
                if (input) {
                    input.value = currentOrder++;
                }
            }
        });
    });
}

SortableFormset.prototype = Object.create(Formset.prototype);


SortableFormset.prototype.toggleButtonState = function(enable) {
    Formset.prototype.toggleButtonState.apply(this, arguments);

    this.root.querySelectorAll(this.sortButtons.opts.moveUpBtn).forEach(function(button) {
        button.disabled = !enable;
        button.classList.toggle("disabled", !enable);
    });

    this.root.querySelectorAll(this.sortButtons.opts.moveDownBtn).forEach(function(button) {
        button.disabled = !enable;
        button.classList.toggle("disabled", !enable);
    });
}


export default SortableFormset;
