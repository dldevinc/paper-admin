import { hookUnload } from "js/utilities/hook_unload";

import "./paper-form.scss";

document.querySelectorAll(".paper-form--hook").forEach(function (form) {
    hookUnload(form);
});
