import XClass from "data-xclass";
import CheckboxTree from "paper-checkbox-tree";
import multi from "multi.js/dist/multi-es6.min.js";

// CSS
import "multi.js/src/multi.css";
import "./filtered-select-multiple.scss";

import "paper-checkbox-tree/dist/style.css";
import "./checkbox-tree.scss";

XClass.register("filtered-select-multiple", {
    init: function (element) {
        const select = element.querySelector("select");
        select &&
        multi(select, {
            hide_empty_groups: true
        });
    }
});

XClass.register("checkbox-tree", {
    init: function (element) {
        const select = element.querySelector("select");
        select && new CheckboxTree(select);
    }
});
