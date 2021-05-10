import "multiselect";
import Widget from "js/utilities/widget";

// CSS
import "css/widgets/multiselect.scss";


class MutliSelectWidget extends Widget {
    _init(element) {
        $(element).multiSelect();
    }

    _destroy(element) {
        $(element).multiSelect("destroy");
    }
}


const multiSelect = new MutliSelectWidget();
multiSelect.observe(".vMultiSelect");
multiSelect.initAll(".vMultiSelect");
