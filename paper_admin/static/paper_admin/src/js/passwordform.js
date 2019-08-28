import whenDomReady from "when-dom-ready";
import hookUnload from "./components/hook_unload";
import "./widgets/password";


whenDomReady(function() {
    // предупреждение при закрытии формы
    const form = document.getElementById('passwordform');
    if (form) {
        hookUnload(form);
    }
});
