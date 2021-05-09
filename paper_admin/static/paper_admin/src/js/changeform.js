/* global gettext */

import "js/widgets/autosize";
import "js/widgets/clearable_file";
import "js/widgets/datetime";
import "js/widgets/email";
import "js/widgets/multiselect";
import "js/widgets/password";
import "js/widgets/url";
import "js/components/RelatedObjectLookups";
import "js/components/prepopulate/prepopulate";
import "bem/object-tools/object-tools";
import {InlineFormset} from "bem/paper-formset/paper-formset";

// инициализация inline-форм
document.querySelectorAll(".paper-formset").forEach(function(formset) {
    new InlineFormset(formset);
});
