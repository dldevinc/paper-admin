import { flatpickr, dateFormats } from "components/flatpickr";
import getPossibleLocales from "js/utilities/locale.js";
import Widget from "js/utilities/widget.js";

import "./date-field.scss";

class DateWidget extends Widget {
    constructor(options) {
        super();

        this.opts = Object.assign(
            {
                altInput: true,
                locale: this._getLocale(),
                dateFormat: this._getDateFormat()
            },
            options
        );

        document.addEventListener("click", event => {
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
        const input = element.querySelector("input");
        if (!input) {
            return false;
        }

        flatpickr(input, this.opts);
    }

    _destroy(element) {
        const input = element.querySelector("input[type=hidden]");
        if (input && input._flatpickr) {
            input._flatpickr.destroy();
        }
    }

    _getLocale() {
        for (const locale of getPossibleLocales()) {
            if (flatpickr.l10ns[locale]) {
                return locale;
            }
        }
        return "default";
    }

    _getDateFormat() {
        for (const locale of getPossibleLocales()) {
            if (dateFormats[locale]) {
                return dateFormats[locale];
            }
        }
        return "Y-m-d";
    }
}

const widget = new DateWidget();
widget.bind(".date-field");
widget.attach();
