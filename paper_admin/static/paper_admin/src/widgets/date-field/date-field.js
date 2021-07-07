import { flatpickr, dateFormats } from "components/flatpickr";
import getPossibleLocales from "js/utilities/locale";
import Widget from "js/utilities/widget";

import "./date-field.scss";

class DateWidget extends Widget {
    constructor(options) {
        super();

        this.opts = Object.assign({
            altInput: true,
            locale: this._getLocale(),
            dateFormat: this._getDateFormat()
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

    _getLocale() {
        for(let locale of getPossibleLocales()) {
            if (flatpickr.l10ns[locale]) {
                return locale
            }
        }
        return "default"
    }

    _getDateFormat() {
        for(let locale of getPossibleLocales()) {
            if (dateFormats[locale]) {
                return dateFormats[locale]
            }
        }
        return "Y-m-d";
    }
}


const widget = new DateWidget();
widget.observe(".date-field input");
widget.initAll(".date-field input");
