/* global gettext */

import SortableTable from "js/components/sortable_table/SortableTable";
import "js/components/RelatedObjectLookups";
import "bem/object-tools/object-tools";
import "bem/paper-actions/paper-actions";
import "bem/paper-filter/paper-filter";
import "bem/paper-pagination/paper-pagination";
import "bem/paper-search-form/paper-search-form";


const table = document.getElementById("result_list");
if (table && table.classList.contains("table-sortable")) {
    if (table.classList.contains("table-sortable-allowed")) {
        new SortableTable(table, {
            url: table.dataset.orderUrl,
            tree: table.classList.contains("table-mptt"),
            handler: ".sort-handler"
        });
    } else {
        $(table).find(".sort-handler").tooltip({
            title: gettext("Sort list by this column to enable ordering"),
            placement: "bottom",
            trigger: "hover",
            html: true,
            delay: {
                show: 300,
                hide: 100
            }
        });
    }
}
