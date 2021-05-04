/* global gettext */

import Formset from "js/components/inlines/inlines";
import SortableFormset from "js/components/inlines/sortable_inlines";
import "js/components/RelatedObjectLookups";
import "js/widgets/autosize";
import "js/widgets/clearable_file";
import "js/widgets/datetime";
import "js/widgets/email";
import "js/widgets/multiselect";
import "js/widgets/password";
import "js/widgets/url";
import "bem/paper-tabs/paper-tabs";


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
