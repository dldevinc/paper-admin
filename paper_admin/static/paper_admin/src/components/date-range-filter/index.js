/* global flatpickr */
import XClass from "data-xclass";
import { dateFormats, flatpickr } from "components/flatpickr/index.js";
import { BaseComponent } from "js/components/baseComponent.js";
import getPossibleLocales from "js/utilities/locale.js";

export class DateRangeFilter extends BaseComponent {
    get Defaults() {
        return {
            altInput: true,
            locale: this._getLocale(),
            dateFormat: this._getDateFormat()
        };
    }

    constructor(element, options) {
        super(options);

        this.startElement = element.querySelector("[data-range-start]");
        flatpickr(this.startElement, this.options);

        this.endElement = element.querySelector("[data-range-end]");
        flatpickr(this.endElement, this.options);

        this.on(element, "click", event => {
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

    destroy() {
        super.destroy();

        if (this.startElement._flatpickr) {
            this.startElement._flatpickr.destroy();
        }

        if (this.endElement._flatpickr) {
            this.endElement._flatpickr.destroy();
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

XClass.register("paper-date-range-filter", {
    init: function (element) {
        element._dateRangeFilter = new DateRangeFilter(element);
    },
    destroy: function (element) {
        if (element._dateRangeFilter) {
            element._dateRangeFilter.destroy();
            delete element._dateRangeFilter;
        }
    }
});
