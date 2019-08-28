import flatpickr from "flatpickr";
import whenDomReady from "when-dom-ready";
import emitters from "../components/emitters";

// CSS
import "flatpickr/dist/flatpickr.min.css";
import "../../css/widgets/datetime.scss";


function initWidget(options, element) {
    if (!element.closest('.empty-form')) {
        flatpickr(element, options);
    }
}


/**
 * Инициализация DateTime виджетов
 * @param {Element} [root]
 */
function initWidgets(root = document.body) {
    let date_selector = '.vDatePicker';
    let date_options = {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d"
    };
    root.matches(date_selector) && initWidget(date_options, root);
    root.querySelectorAll(date_selector).forEach(initWidget.bind(null, date_options));

    let time_selector = '.vTimePicker';
    let time_options = {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true
    };
    root.matches(time_selector) && initWidget(time_options, root);
    root.querySelectorAll(time_selector).forEach(initWidget.bind(null, time_options));
}


whenDomReady(initWidgets);
emitters.dom.on('mutate', initWidgets);


/**
 * Симуляция нажатия стрелок при прокрутке колеса мыши на полях выбора времени.
 */
document.addEventListener('wheel', function(event) {
    const target = event.target;
    const widget = target.closest('.numInputWrapper');
    const input = widget && widget.querySelector('input');
    if (input) {
        event.preventDefault();
        const fake_event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyCode: event.deltaY > 0 ? 40 : 38
        });
        input.dispatchEvent(fake_event);
    }
});


/**
 * Клик на иконку календаря
 */
document.addEventListener('click', function(event) {
    const target = event.target;
    const button = target.closest('.vDateFieldTrigger');
    const widget = button && button.closest('.input-group');
    const input = widget && widget.querySelector('.vDateInput');
    if (input && input._flatpickr) {
        event.preventDefault();
        input._flatpickr.open();
    }
});
