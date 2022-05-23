import * as bootstrap from "bootstrap";
import Sortable from "sortablejs";
import emitters from "js/utilities/emitters.js";
import formUtils from "js/utilities/form_utils.js";
import Widget from "js/utilities/widget.js";
import "js/components/bootstrap.js";
import "js/components/filedrag.js";

// -----------------
//  CSS vendors
// -----------------
import "css/vendors/bootstrap.scss";
import "css/vendors/font-awesome.scss";
import "css/common.scss";

// -----------------
//  JS Components
// -----------------
import "components/back-button";
import "components/flatpickr";
import "components/prepopulate";
import "components/related-object-lookups";
import "components/select2";

// -----------------
//  Django Widgets
// -----------------
import "widgets/clearable-file-field";
import "widgets/date-field";
import "widgets/email-field";
import "widgets/file-field";
import "widgets/fk-raw-field";
import "widgets/ip-field";
import "widgets/number-field";
import "widgets/password-field";
import "widgets/related-widget-wrapper";
import "widgets/select-field";
import "widgets/select-date-field"; // must be below select-field
import "widgets/select-multiple-field";
import "widgets/split-datetime-field";
import "widgets/text-field";
import "widgets/time-field";
import "widgets/url-field";
import "widgets/uuid-field";

// -----------------
//  BEM
// -----------------
import "bem/btn-square/btn-square.js";
import "bem/btn-square-group/btn-square-group.js";
import "bem/delete-inline/delete-inline.js";
import "bem/dotted-underline/dotted-underline.js";
import "bem/paper-breadcrumbs/paper-breadcrumbs.js";
import "bem/paper-card/paper-card.js";
import "bem/paper-environment/paper-environment.js";
import "bem/paper-error-list/paper-error-list.js";
import "bem/paper-form/paper-form.js";
import "bem/paper-header/paper-header.js";
import "bem/paper-input-group/paper-input-group.js";
import "bem/paper-messages/paper-messages.js";
import modals from "bem/paper-modal/paper-modal.js";
import "bem/paper-object-list/paper-object-list.js";
import "bem/paper-page/paper-page.js";
import "bem/paper-preloader/paper-preloader.js";
import "bem/paper-sidebar/paper-sidebar.js";
import "bem/paper-table/paper-table.js";
import "bem/paper-tabs/paper-tabs.js";
import "bem/paper-toolbar/paper-toolbar.js";
import "bem/paper-widget/paper-widget.js";

// -----------------
//  CSS for pages
// -----------------
import "css/login.scss";

// -----------------
//  Images
// -----------------
import "img/default_favicon.png";

// -----------------
//  Import & Export
// -----------------

// changelist page
if (document.body.classList.contains("change-list")) {
    import(/* webpackChunkName: "changelist" */ "js/changelist.js");
}

// changeform page
if (document.body.classList.contains("change-form")) {
    import(/* webpackChunkName: "changeform" */ "js/changeform.js");
}

// popup page
if (window.location.search.indexOf("&_popup=1") !== -1) {
    import(/* webpackChunkName: "popup" */ "js/popup.js");
}

window.django = window.django || {};
window.django.jQuery = jQuery;

export const paperAdmin = {
    bootstrap,
    emitters,
    formUtils,
    modals,
    Sortable,
    Widget
};
