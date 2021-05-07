/* global gettext */

import "js/components/RelatedObjectLookups";
import "js/widgets/autosize";
import "js/widgets/clearable_file";
import "js/widgets/datetime";
import "js/widgets/email";
import "js/widgets/multiselect";
import "js/widgets/password";
import "js/widgets/url";
import "bem/object-tools/object-tools";
import {InlineFormset} from "bem/paper-formset/paper-formset";
import "bem/paper-tabs/paper-tabs";


// динамическая подгрузка скрипта для prepopulate_fields
if (window.django_prepopulated_fields && window.django_prepopulated_fields.length) {
    import(/* webpackChunkName: "prepopulate" */ "js/components/prepopulate/prepopulate");
}

// инициализация inline-форм
document.querySelectorAll(".paper-formset").forEach(function(formset) {
    new InlineFormset(formset);
});
