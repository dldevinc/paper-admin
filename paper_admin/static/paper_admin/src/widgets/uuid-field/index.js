import { v4 as uuidv4 } from 'uuid';

import "./index.scss";

document.addEventListener("click", event => {
    const button = event.target.closest(".uuid-field__link");
    if (button) {
        const widget = button.closest(".uuid-field");
        if (widget) {
            const input = widget.querySelector("input");
            if (input) {
                input.value = uuidv4();
            }
        }
    }
});
