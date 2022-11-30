import SortableTable from "js/components/sortable_table/SortableTable.js";
import { Select2Widget } from "components/select2";
import "bem/paper-actions/paper-actions.js";
import "bem/paper-filter/paper-filter.js";
import "bem/paper-pagination/paper-pagination.js";
import "bem/paper-search-form/paper-search-form.js";

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
select2_changelist.bind(".paper-table .select-field select");
select2_changelist.attach();

const select2_action = new Select2Widget({
    allowClear: true,
    containerCssClass: "select2-container--small",
    minimumResultsForSearch: Infinity
});
select2_action.bind(".paper-actions__action select");
select2_action.attach();

// Сортируемые таблицы
const table = document.getElementById("result_list");
if (table && table.classList.contains("paper-table--sortable")) {
    new SortableTable(table, {
        url: table.dataset.orderUrl,
        tree: table.classList.contains("paper-table--tree"),
        handler: ".paper-table__sort-handler"
    });
}
