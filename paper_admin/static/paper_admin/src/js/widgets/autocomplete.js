import "js/helpers/select2";
import Widget from "js/utilities/widget";

// CSS
import "select2/dist/css/select2.min.css";
import "css/widgets/autocomplete.css";


class Select2Widget extends Widget {
    constructor(options) {
        super();

        this.opts = options;
    }

    _init(element) {
        if (!element.closest(".empty-form")) {
            $(element).select2(this.opts);
        }
    }

    _destroy(element) {
        $(element).select2("destroy")
    }
}


const select2 = new Select2Widget({
    ajax: {
        data: function(params) {
            return {
                term: params.term,
                page: params.page
            };
        }
    }
});
select2.observe(".admin-autocomplete");
select2.initAll(".admin-autocomplete");
