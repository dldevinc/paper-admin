import * as bootstrap from "bootstrap";
import emitters from "js/utilities/emitters";
import formUtils from "js/utilities/form_utils";
import Sortable from "sortablejs";
import Widget from "js/utilities/widget";
import "js/components/bootstrap";
import "js/components/filedrag";

// ---------------
//  CSS
// ---------------
import "css/vendors/bootstrap.scss";
import "css/vendors/font-awesome.scss";
import "css/common.scss";

// ---------------
//  Components
// ---------------
import "components/back-button";
import "components/flatpickr";
import "components/prepopulate";
import "components/related-object-lookups";
import "components/select2";

// ---------------
//  Widgets
// ---------------
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
import "widgets/select-date-field";  // must be below select-field
import "widgets/select-multiple-field";
import "widgets/split-datetime-field";
import "widgets/text-field";
import "widgets/time-field";
import "widgets/url-field";
import "widgets/uuid-field";

// ---------------
//  BEM
// ---------------
import "bem/btn-square/btn-square";
import "bem/btn-square-group/btn-square-group";
import "bem/delete-inline/delete-inline";
import "bem/dotted-underline/dotted-underline";
import "bem/paper-breadcrumbs/paper-breadcrumbs";
import "bem/paper-card/paper-card";
import "bem/paper-environment/paper-environment";
import "bem/paper-error-list/paper-error-list";
import "bem/paper-header/paper-header";
import "bem/paper-messages/paper-messages";
import modals from "bem/paper-modal/paper-modal";
import "bem/paper-object-list/paper-object-list";
import "bem/paper-page/paper-page";
import "bem/paper-preloader/paper-preloader";
import "bem/paper-sidebar/paper-sidebar";
import "bem/paper-tabs/paper-tabs";
import "bem/paper-toolbar/paper-toolbar";
import "bem/paper-widget/paper-widget";

import "bem/paper-table/paper-table";
import "bem/paper-form/paper-form";

// ---------------
//  Pages
// ---------------
import "css/dashboard.scss";
import "css/login.scss";

// ---------------
//  Images
// ---------------
import "img/default_favicon.png";


// changelist page
if (document.body.classList.contains("change-list")) {
    import(/* webpackChunkName: "changelist" */ "js/changelist");
}

// changeform page
if (document.body.classList.contains("change-form")) {
    import(/* webpackChunkName: "changeform" */ "js/changeform");
}

// popup page
if (window.location.search.indexOf("&_popup=1") !== -1) {
    import(/* webpackChunkName: "popup" */ "js/popup");
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
}
