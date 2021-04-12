/* global gettext */

import hookUnload from "./components/hook_unload";
import Formset from "./components/inlines/inlines";
import SortableFormset from "./components/inlines/sortable_inlines";
import "./components/RelatedObjectLookups";
import "./components/autosize";
import "./components/tabs";
import "./widgets/autocomplete";
import "./widgets/clearable_file";
import "./widgets/datetime";
import "./widgets/email";
import "./widgets/multiselect";
import "./widgets/password";
import "./widgets/url";


// предупреждение при закрытии формы
const form = document.getElementById('changeform');
if (form) {
    hookUnload(form);
}

// динамическая подгрузка скрипта для prepopulate_fields
if (window.django_prepopulated_fields && window.django_prepopulated_fields.length) {
    import(/* webpackChunkName: "prepopulate" */ './components/prepopulate/prepopulate');
}

// инициализация inline-форм
document.querySelectorAll('.sortable-inline-group').forEach(function(inlineGroup) {
    new SortableFormset(inlineGroup, {
        prefix: inlineGroup.dataset.inlinePrefix
    });
});

document.querySelectorAll('.inline-group:not(.sortable-inline-group)').forEach(function(inlineGroup) {
    new Formset(inlineGroup, {
        prefix: inlineGroup.dataset.inlinePrefix
    });
});
