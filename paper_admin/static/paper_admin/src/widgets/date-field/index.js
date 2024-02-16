/* global flatpickr */
import XClass from "data-xclass";
import { flatpickr, dateFormats } from "components/flatpickr/index.js";
import { BaseComponent } from "js/components/baseComponent.js";
import getPossibleLocales from "js/utilities/locale.js";

import "./index.scss";

export class DateField extends BaseComponent {
    get Defaults() {
        return {
            allowInput: true,
            altInput: true,
            locale: this._getLocale(),
            dateFormat: this._getDateFormat(),
        };
    }

    constructor(element, options) {
        super(options);

        this.inputElement = element.querySelector("input");
        flatpickr(this.inputElement, this.options);

        this.on(element, "click", event => {
            const button = event.target.closest(".date-field__button");
            if (button) {
                this.inputElement._flatpickr.setDate("today");
            }
        });
    }

    destroy() {
        super.destroy();
        if (this.inputElement._flatpickr) {
            this.inputElement._flatpickr.destroy();
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

XClass.register("date-field", {
    init: function (element) {
        element._dateField = new DateField(element);
    },
    destroy: function (element) {
        if (element._dateField) {
            element._dateField.destroy();
            delete element._dateField;
        }
    }
});
