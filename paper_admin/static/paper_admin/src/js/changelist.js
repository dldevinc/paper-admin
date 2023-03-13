import XClass from "data-xclass";
import SortableTable from "js/components/sortable_table/SortableTable.js";
import { Select2Component } from "components/select2";
import "bem/paper-actions/paper-actions.js";
import "bem/paper-filter/paper-filter.js";
import "bem/paper-pagination/paper-pagination.js";
import "bem/paper-search-form/paper-search-form.js";

// -----------------
//  Filters
// -----------------
import "components/date-range-filter";
import "components/select2-filter";

// -----------------
//  CSS
// -----------------
import "css/changelist.scss";

// Select2 для выпадающего списка действий над списком
XClass.register("paper-actions", {
    init: function (element) {
        element._paperActions = new Select2Component(element, {
            allowClear: true,
            containerCssClass: "select2-container--small",
            minimumResultsForSearch: Infinity
        });
    },
    destroy: function (element) {
        if (element._paperActions) {
            element._paperActions.destroy();
            delete element._paperActions;
        }
    }
});

// Сортируемые таблицы
const table = document.getElementById("result_list");
if (table && table.classList.contains("paper-table--sortable")) {
    new SortableTable(table, {
        url: table.dataset.orderUrl,
        tree: table.classList.contains("paper-table--tree"),
        handler: ".paper-table__sort-handler"
    });
}
