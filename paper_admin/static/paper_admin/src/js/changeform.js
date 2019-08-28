/* global gettext */

import whenDomReady from "when-dom-ready";
import hookUnload from "./components/hook_unload";
import "./components/inlines/inlines";
import "./components/inlines/sortable";
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


whenDomReady(function() {
    // предупреждение при закрытии формы
    const form = document.getElementById('changeform');
    if (form) {
        hookUnload(form);
    }

    // динамическая подгрузка скрипта для prepopulate_fields
    if (window.django_prepopulated_fields && window.django_prepopulated_fields.length) {
        import(/* webpackChunkName: "prepopulate" */ './components/prepopulate/prepopulate');
    }
});
