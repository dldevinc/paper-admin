import Widget from "js/utilities/widget";
import "./patch";

// CSS
import "select2/dist/css/select2.css";
import "./select2.scss";


class Select2Widget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        let options = Object.assign({}, this.opts);
        if (options.allowClear && (typeof options.placeholder == "undefined")) {
            // Использование allowClear требует указать placeholder.
            const emptyOption = element.querySelector("option[value=\"\"]");
            if (emptyOption) {
                options.placeholder = emptyOption.textContent;
            } else {
                options.placeholder = "";
            }
        }

        $(element).select2(options);

        // вызов события change для поддержки hookUnload
        $(element).on("select2:select select2:clear", function() {
            const event = new CustomEvent("change", {
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event)
        });

        /*
         * Hacky fix for a bug in select2 with jQuery 3.6.0's new nested-focus "protection"
         * see: https://github.com/select2/select2/issues/5993
         * see: https://github.com/jquery/jquery/issues/4382
         *
         * TODO: Recheck with the select2 GH issue and remove once this is fixed on their side
         */
        $(element).on("select2:open", function() {
            const instance = $(this).data("select2");
            const searchField = instance.$dropdown.get(0).querySelector(".select2-search__field");
            searchField && searchField.focus();
        });
    }

    _destroy(element) {
        $(element).select2("destroy")
    }
}


const select2_changeform = new Select2Widget({
    width: "",
    allowClear: true
});
select2_changeform.observe(".paper-form .select-field select");
select2_changeform.initAll(".paper-form .select-field select");


const select2_changelist = new Select2Widget({
    width: "",
    theme: "sm",
    allowClear: true
});
select2_changelist.observe(".paper-table .select-field select");
select2_changelist.initAll(".paper-table .select-field select");


const select2_filters = new Select2Widget({
    width: "100%",
    theme: "sm",
    allowClear: true
});
select2_filters.observe(".paper-filter select");
select2_filters.initAll(".paper-filter select");


const select2_action = new Select2Widget({
    theme: "sm",
    allowClear: true,
    minimumResultsForSearch: Infinity
});
select2_action.observe(".paper-actions select");
select2_action.initAll(".paper-actions select");


export default Select2Widget;
