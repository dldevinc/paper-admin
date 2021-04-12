/* global gettext */

import hookUnload from "js/components/hook_unload";
import Formset from "js/components/inlines/inlines";
import SortableFormset from "js/components/inlines/sortable_inlines";
import "js/components/RelatedObjectLookups";
import "js/components/tabs";
import "js/widgets/autosize";
import "js/widgets/clearable_file";
import "js/widgets/datetime";
import "js/widgets/email";
import "js/widgets/multiselect";
import "js/widgets/password";
import "js/widgets/url";


// предупреждение при закрытии формы
const form = document.getElementById("changeform");
if (form) {
    hookUnload(form);
}

// динамическая подгрузка скрипта для prepopulate_fields
if (window.django_prepopulated_fields && window.django_prepopulated_fields.length) {
    import(/* webpackChunkName: "prepopulate" */ "js/components/prepopulate/prepopulate");
}

// инициализация inline-форм
document.querySelectorAll(".sortable-inline-group").forEach(function(inlineGroup) {
    new SortableFormset(inlineGroup, {
        prefix: inlineGroup.dataset.inlinePrefix
    });
});

document.querySelectorAll(".inline-group:not(.sortable-inline-group)").forEach(function(inlineGroup) {
    new Formset(inlineGroup, {
        prefix: inlineGroup.dataset.inlinePrefix
    });
});
