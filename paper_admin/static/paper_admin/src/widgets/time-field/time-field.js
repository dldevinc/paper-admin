import "clockpicker/src/clockpicker";
import Widget from "js/utilities/widget.js";

import "clockpicker/src/clockpicker.css";
import "./time-field.scss";

class TimeWidget extends Widget {
    constructor() {
        super();

        document.addEventListener("click", event => {
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
        const input = element.querySelector("input");
        if (!input) {
            return false;
        }

        $(input).clockpicker({
            default: "now",
            autoclose: true
        });
    }

    _destroy(element) {
        const input = element.querySelector("input");
        if (input) {
            $(input).clockpicker("remove");
        }
    }
}

const widget = new TimeWidget();
widget.bind(".time-field");
widget.attach();
