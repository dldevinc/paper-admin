import { flatpickr } from "components/flatpickr";
import Widget from "js/utilities/widget";

import "./date-field.scss";

class DateWidget extends Widget {
    constructor(options) {
        super();

        this.opts = Object.assign({
            altInput: true,
            locale: (document.documentElement.getAttribute("lang") || "en").toLowerCase()
        }, options);

        document.addEventListener("click", function(event) {
            const button = event.target.closest(".date-field__button");
            if (button) {
                const widget = button.closest(".date-field");
                const input = widget && widget.querySelector("input");
                if (input && input._flatpickr) {
                    input._flatpickr.setDate("today");
                }
            }
        });
    }

    _init(element) {
        flatpickr(element, this.opts);
    }

    _destroy(element) {
        if (element._flatpickr) {
            element._flatpickr.destroy()
        }
    }
}


const widget = new DateWidget();
widget.observe(".date-field input");
widget.initAll(".date-field input");
