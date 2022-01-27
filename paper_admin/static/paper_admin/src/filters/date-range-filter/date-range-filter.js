import {dateFormats, flatpickr} from "components/flatpickr";
import getPossibleLocales from "js/utilities/locale";
import Widget from "js/utilities/widget";


class DateRangeFilter extends Widget {
    constructor(options) {
        super();

        this.opts = Object.assign({
            altInput: true,
            locale: this._getLocale(),
            dateFormat: this._getDateFormat()
        }, options);
    }

    _init(element) {
        const dateStart = element.querySelector("[data-range-start]");
        const dateStartConfig = Object.assign({}, this.opts);
        flatpickr(dateStart, dateStartConfig);

        const dateEnd = element.querySelector("[data-range-end]");
        const dateEndConfig = Object.assign({}, this.opts);
        flatpickr(dateEnd, dateEndConfig);

        element.addEventListener("click", function(event) {
            const button = event.target.closest("[data-today]");
            if (button) {
                const inputGroup = button.closest(".input-group");
                const input = inputGroup && inputGroup.querySelector("input");
                if (input && input._flatpickr) {
                    input._flatpickr.setDate("today");
                }
            }
        });
    }

    _destroy(element) {
        const dateStart = element.querySelector("[data-range-start]");
        if (dateStart._flatpickr) {
            dateStart._flatpickr.destroy()
        }

        const dateEnd = element.querySelector("[data-range-end]");
        if (dateEnd._flatpickr) {
            dateEnd._flatpickr.destroy()
        }
    }

    _getLocale() {
        for(const locale of getPossibleLocales()) {
            if (flatpickr.l10ns[locale]) {
                return locale
            }
        }
        return "default"
    }

    _getDateFormat() {
        for(const locale of getPossibleLocales()) {
            if (dateFormats[locale]) {
                return dateFormats[locale]
            }
        }
        return "Y-m-d";
    }
}


const widget = new DateRangeFilter();
widget.observe(".paper-date-range-filter");
widget.initAll(".paper-date-range-filter");
