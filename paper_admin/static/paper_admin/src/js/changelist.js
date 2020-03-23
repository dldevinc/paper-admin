/* global gettext */

import whenDomReady from "when-dom-ready";
import SortableTable from "./components/sortable_table/SortableTable";
import "./components/actions";
import "./components/RelatedObjectLookups";
import "./components/search";


// Ctrl + Arrows navigation
window.addEventListener('keydown', function(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    if (event.ctrlKey) {
        const paperMain = document.getElementById('paper-main');
        const pagination = paperMain.querySelector('.pagination');
        if (!pagination) {
            return
        }

        switch (event.key) {
            case "Left":
            case "ArrowLeft":
                pagination.querySelector('.page-link[aria-label="Previous"]').click();
                break;
            case "Right":
            case "ArrowRight":
                pagination.querySelector('.page-link[aria-label="Next"]').click();
                break;
            default:
                // Quit when this doesn't handle the key event.
                return;
        }

        // Cancel the default action to avoid it being handled twice
        event.preventDefault();
    }
});


whenDomReady(function() {
    const table = document.getElementById('result_list');
    if (table && table.classList.contains('table-sortable')) {
        if (table.classList.contains('table-sortable-allowed')) {
            new SortableTable(table, {
                url: table.dataset.orderUrl,
                tree: table.classList.contains('table-mptt'),
                handler: '.sort-handler'
            });
        } else {
            $(table).find('.sort-handler').tooltip({
                title: gettext('Sort list by this column to enable ordering'),
                placement: 'bottom',
                trigger: 'hover',
                html: true,
                delay: {
                    show: 300,
                    hide: 100
                }
            });
        }
    }
});
