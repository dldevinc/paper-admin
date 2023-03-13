import XClass from "data-xclass";
import multi from "multi.js/dist/multi-es6.min.js";

// CSS
import "multi.js/src/multi.css";
import "./index.scss";

XClass.register("select-multiple-field", {
    init: function (element) {
        const select = element.querySelector("select");
        select &&
            multi(select, {
                hide_empty_groups: true
            });
    }
});
