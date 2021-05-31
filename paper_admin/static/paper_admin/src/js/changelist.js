import SortableTable from "js/components/sortable_table/SortableTable";
import "bem/paper-actions/paper-actions";
import "bem/paper-filter/paper-filter";
import "bem/paper-pagination/paper-pagination";
import "bem/paper-search-form/paper-search-form";

// -----------------
//  Filters
// -----------------
import "filters/select2-filter";

// -----------------
//  CSS
// -----------------
import "css/changelist.scss";


// Сортируемые таблицы
const table = document.getElementById("result_list");
if (table && table.classList.contains("paper-table--sortable")) {
    new SortableTable(table, {
        url: table.dataset.orderUrl,
        tree: table.classList.contains("paper-table--mptt"),
        handler: ".paper-table__sort-handler"
    });
}
