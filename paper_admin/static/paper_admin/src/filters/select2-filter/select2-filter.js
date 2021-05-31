import Select2Widget from "components/select2";


const widget = new Select2Widget({
    width: "100%",
    theme: "sm",
    allowClear: true
});
widget.observe(".paper-select2-filter select");
widget.initAll(".paper-select2-filter select");
