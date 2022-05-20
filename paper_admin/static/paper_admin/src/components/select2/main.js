import Widget from "js/utilities/widget";
import "select2/dist/js/select2.full";
import "./patches";

// CSS
import "select2/dist/css/select2.css";
import "./patches.scss";
import "./small.scss";

class Select2Widget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        const options = Object.assign({}, this.opts);
        if (options.allowClear && typeof options.placeholder == "undefined") {
            // Использование allowClear требует указать placeholder.
            const emptyOption = element.querySelector('option[value=""]');
            if (emptyOption) {
                options.placeholder = emptyOption.textContent;
            } else {
                options.placeholder = "";
            }
        }

        $(element).select2(options);

        // вызов события change для поддержки hookUnload
        $(element).on("select2:select select2:clear", function () {
            const event = new CustomEvent("change", {
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        });

        /*
         * Hacky fix for a bug in select2 with jQuery 3.6.0's new nested-focus "protection"
         * see: https://github.com/select2/select2/issues/5993
         * see: https://github.com/jquery/jquery/issues/4382
         *
         * TODO: Recheck with the select2 GH issue and remove once this is fixed on their side
         */
        $(element).on("select2:open", function () {
            const instance = $(this).data("select2");
            const searchField = instance.$dropdown.get(0).querySelector(".select2-search__field");
            searchField && searchField.focus();
        });
    }

    _destroy(element) {
        $(element).select2("destroy");
    }
}

export { Select2Widget };
