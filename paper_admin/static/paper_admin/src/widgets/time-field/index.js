import XClass from "data-xclass";
import { BaseComponent } from "js/components/baseComponent.js";
import "clockpicker/src/clockpicker";

import "clockpicker/src/clockpicker.css";
import "./index.scss";

export class TimeField extends BaseComponent {
    get Defaults() {
        return {
            default: "now",
            autoclose: true
        };
    }

    constructor(element, options) {
        super(options);

        this.inputElement = element.querySelector("input");
        $(this.inputElement).clockpicker(this.options);

        this.on(element, "click", event => {
            const button = event.target.closest(".time-field__button");
            if (button) {
                const today = new Date();
                this.inputElement.value =
                    today.getHours().toString().padStart(2, "0") + ":" + today.getMinutes().toString().padStart(2, "0");
            }
        });
    }

    destroy() {
        super.destroy();
        $(this.inputElement).clockpicker("remove");
    }
}

XClass.register("time-field", {
    init: function (element) {
        element._timeField = new TimeField(element);
    },
    destroy: function (element) {
        if (element._timeField) {
            element._timeField.destroy();
            delete element._timeField;
        }
    }
});
