import { Select2Widget } from "components/select2";

const widget = new Select2Widget({
    width: "100%",
    allowClear: true,
    containerCssClass: "select2-container--small"
});
widget.bind(".paper-select2-filter select");
widget.attach();
