import "clockpicker/src/clockpicker";
import Widget from "js/utilities/widget.js";

import "clockpicker/src/clockpicker.css";
import "./time-field.scss";

class TimeWidget extends Widget {
    constructor() {
        super();

        document.addEventListener("click", function (event) {
            const button = event.target.closest(".time-field__button");
            if (button) {
                const widget = button.closest(".time-field");
                const input = widget && widget.querySelector("input");
                if (input) {
                    const today = new Date();
                    input.value =
                        today.getHours().toString().padStart(2, "0") +
                        ":" +
                        today.getMinutes().toString().padStart(2, "0");
                }
            }
        });
    }

    _init(element) {
        $(element).clockpicker({
            default: "now",
            autoclose: true
        });
    }

    _destroy(element) {
        $(element).clockpicker("remove");
    }
}

const widget = new TimeWidget();
widget.observe(".time-field input");
widget.initAll(".time-field input");
