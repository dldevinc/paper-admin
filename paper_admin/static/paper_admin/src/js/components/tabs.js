import "gsap/ScrollToPlugin";
import {TweenLite} from "gsap";
import whenDomReady from "when-dom-ready";

const ERROR_MIN_VISIBILITY = 50;


whenDomReady(function() {
    const errorContainers = document.querySelectorAll('.invalid, .formset-errors, .formset-form-errors');
    const firstErrorContainer = Array.from(errorContainers).find(function(errorContainer) {
        return errorContainer.innerHTML !== '';
    });

    if (firstErrorContainer) {
        // скролл к ошибке
        const errorRect = firstErrorContainer.getBoundingClientRect();
        const errorTop = errorRect.top;
        const isVisible = (errorTop > ERROR_MIN_VISIBILITY) && (errorTop < document.documentElement.clientHeight - ERROR_MIN_VISIBILITY);
        if (!isVisible) {
            setTimeout(function() {
                TweenLite.to(window, 0.5, {
                    scrollTo: {
                        y: errorTop - Math.floor(document.documentElement.clientHeight / 2),
                        offsetY: -25
                    }
                });
            });
        }
    } else {
        const hash = location.hash.substr(1).replace(/-panel$/i, '-tab');
        const current_tab = hash && document.querySelector(`#${hash}`);
        if (current_tab) {
            $(current_tab).tab('show');
        }
    }
});


$(document).on('shown.bs.tab', function(event) {
    const tab_name = event.target.getAttribute('aria-controls');
    if (tab_name) {
        history.replaceState(null, '', `#${tab_name}`);

        const form = document.getElementById('changeform');
        if (form) {
            const action = new URL(form.action);
            action.hash = tab_name;
            form.action = action.toString();
        }
    }
});
