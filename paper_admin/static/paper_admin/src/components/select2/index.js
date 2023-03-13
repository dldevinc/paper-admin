import { BaseComponent } from "js/components/baseComponent.js";
import "select2/dist/js/select2.full.js";
import "./patches.js";

// CSS
import "select2/dist/css/select2.css";
import "./patches.scss";
import "./small.scss";

export class Select2Component extends BaseComponent {
    constructor(element, options) {
        super(options);

        if (element.tagName !== "SELECT") {
            this.selectElement = element.querySelector("select");
            if (!this.selectElement) {
                throw new Error("select tag not found");
            }
        } else {
            this.selectElement = element;
        }

        this._initSelect2();
    }

    destroy() {
        super.destroy();
        this._destroySelect2();
    }

    _initSelect2() {
        if (this.options.allowClear && typeof this.options.placeholder == "undefined") {
            // Использование allowClear требует указать placeholder.
            const emptyOption = this.selectElement.querySelector('option[value=""]');
            if (emptyOption) {
                this.options.placeholder = emptyOption.textContent;
            } else {
                this.options.placeholder = "";
            }
        }

        $(this.selectElement).select2(this.options);

        // вызов события change для поддержки hookUnload
        $(this.selectElement).on("select2:select select2:clear", () => {
            const event = new CustomEvent("change", {
                bubbles: true,
                cancelable: true
            });
            this.selectElement.dispatchEvent(event);
        });

        /*
         * Hacky fix for a bug in select2 with jQuery 3.6.0's new nested-focus "protection"
         * see: https://github.com/select2/select2/issues/5993
         * see: https://github.com/jquery/jquery/issues/4382
         *
         * TODO: Recheck with the select2 GH issue and remove once this is fixed on their side
         */
        $(this.selectElement).on("select2:open", function () {
            const instance = $(this).data("select2");
            const searchField = instance.$dropdown.get(0).querySelector(".select2-search__field");
            searchField && searchField.focus();
        });
    }

    _destroySelect2() {
        $(this.selectElement).select2("destroy");
    }
}
