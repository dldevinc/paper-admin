import "select2";
import whenDomReady from "when-dom-ready";
import emitters from "../components/emitters";

// CSS
import "select2/dist/css/select2.min.css";
import "../../css/widgets/autocomplete.css";


function initWidget(options, element) {
    if (!element.closest('.empty-form')) {
        $(element).select2(options);
    }
}


/**
 * Инициализация Autocomplete виджетов
 * @param {Element} [root]
 */
function initWidgets(root = document.body) {
    let selector = '.admin-autocomplete';
    let options = {
        ajax: {
            data: function(params) {
                return {
                    term: params.term,
                    page: params.page
                };
            }
        }
    };
    root.matches(selector) && initWidget(options, root);
    root.querySelectorAll(selector).forEach(initWidget.bind(null, options));
}


whenDomReady(initWidgets);
emitters.dom.on('mutate', initWidgets);
