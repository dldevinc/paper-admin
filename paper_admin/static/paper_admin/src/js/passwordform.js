import hookUnload from "./components/hook_unload";
import "./widgets/password";


// предупреждение при закрытии формы
const form = document.getElementById('passwordform');
if (form) {
    hookUnload(form);
}
