import { hookUnload } from "js/utilities/hook_unload.js";

import "./paper-form.scss";

document.querySelectorAll(".paper-form--hook").forEach(form => {
    hookUnload(form);
});
