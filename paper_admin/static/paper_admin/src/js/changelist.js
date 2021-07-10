import SortableTable from "js/components/sortable_table/SortableTable";
import {Select2Widget} from "components/select2";
import "bem/paper-actions/paper-actions";
import "bem/paper-filter/paper-filter";
import "bem/paper-pagination/paper-pagination";
import "bem/paper-search-form/paper-search-form";

// -----------------
//  Filters
// -----------------
import "filters/date-range-filter";
import "filters/select2-filter";

// -----------------
//  CSS
// -----------------
import "css/changelist.scss";


// Select2 для выпадающих списков
const select2_changelist = new Select2Widget({
    width: "",
    allowClear: true,
    containerCssClass: "select2-container--small"
});
select2_changelist.observe(".paper-table .select-field select");
select2_changelist.initAll(".paper-table .select-field select");


const select2_action = new Select2Widget({
    allowClear: true,
    containerCssClass: "select2-container--small",
    minimumResultsForSearch: Infinity
});
select2_action.observe(".paper-actions select");
select2_action.initAll(".paper-actions select");

// Сортируемые таблицы
const table = document.getElementById("result_list");
if (table && table.classList.contains("paper-table--sortable")) {
    new SortableTable(table, {
        url: table.dataset.orderUrl,
        tree: table.classList.contains("paper-table--mptt"),
        handler: ".paper-table__sort-handler"
    });
}
