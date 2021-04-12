import hookUnload from "js/components/hook_unload";
import "js/widgets/password";


// предупреждение при закрытии формы
const form = document.getElementById("passwordform");
if (form) {
    hookUnload(form);
}
