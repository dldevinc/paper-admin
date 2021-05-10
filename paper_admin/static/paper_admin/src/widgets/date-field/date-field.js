import flatpickr from "flatpickr";
import Widget from "js/utilities/widget";

import "./date-field.scss";

class DateWidget extends Widget {
    constructor() {
        super();

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
        flatpickr(element, {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d"
        });
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
