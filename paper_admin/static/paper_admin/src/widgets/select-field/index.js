import XClass from "data-xclass";
import { Select2Component } from "components/select2";
import "./index.scss";

XClass.register("select-field", {
    init: function (element) {
        const options = {
            width: "",
            allowClear: true
        };

        // TODO: костыль. Маленький размер для таблицы changelist
        if (element.closest("#changelist-form")) {
            options.containerCssClass = "select2-container--small";
        }

        element._selectField = new Select2Component(element, options);
    },
    destroy: function (element) {
        if (element._selectField) {
            element._selectField.destroy();
            delete element._selectField;
        }
    }
});
