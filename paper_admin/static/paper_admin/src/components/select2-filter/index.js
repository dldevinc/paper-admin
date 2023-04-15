import XClass from "data-xclass";
import { Select2Component } from "components/select2/index.js";

XClass.register("paper-select2-filter", {
    init: function (element) {
        element._select2Instance = new Select2Component(element, {
            width: "100%",
            allowClear: true,
            containerCssClass: "select2-container--small"
        });
    },
    destroy: function (element) {
        if (element._select2Instance) {
            element._select2Instance.destroy();
            delete element._select2Instance;
        }
    }
});
