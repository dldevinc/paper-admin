import flatpickr from "flatpickr";
import Widget from "js/utilities/widget";

// CSS
import "flatpickr/dist/flatpickr.css";
import "css/widgets/datetime.scss";


class FlatPickerWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign({}, options);
    }

    _init(element) {
        if (!element.closest(".empty-form")) {
            flatpickr(element, this.opts);
        }
    }

    _destroy(element) {
        if (element._flatpickr) {
            element._flatpickr.destroy()
        }
    }
}


/**
 * Симуляция нажатия стрелок при прокрутке колеса мыши на полях выбора времени.
 */
document.addEventListener("wheel", function(event) {
    const target = event.target;
    const widget = target.closest(".numInputWrapper");
    const input = widget && widget.querySelector("input");
    if (input) {
        event.preventDefault();
        const fake_event = new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            keyCode: event.deltaY > 0 ? 40 : 38
        });
        input.dispatchEvent(fake_event);
    }
}, {passive: false});


/**
 * Клик на иконку календаря
 */
document.addEventListener("click", function(event) {
    const target = event.target;
    const button = target.closest(".vDateFieldTrigger");
    const widget = button && button.closest(".input-group");
    const input = widget && widget.querySelector(".vDateInput");
    if (input && input._flatpickr) {
        setTimeout(function() {
            input._flatpickr.open();
        }, 0)
    }
});


const datePicker = new FlatPickerWidget({
    altInput: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d"
});
datePicker.observe(".vDatePicker");
datePicker.initAll(".vDatePicker");


const timePicker = new FlatPickerWidget({
    allowInput: true,
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
});
timePicker.observe(".vTimePicker");
timePicker.initAll(".vTimePicker");
