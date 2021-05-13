import * as bootstrap from "bootstrap";
import emitters from "js/utilities/emitters";
import formUtils from "js/utilities/form_utils";
import Sortable from "sortablejs";
import Widget from "js/utilities/widget";
import "js/components/cancel";
import "js/components/filedrag";
import "js/widgets/bootstrap";

// ---------------
//  CSS
// ---------------
import "css/common.scss";

// ---------------
//  Components
// ---------------
import "components/prepopulate";
import "components/related-object-lookups";
import "components/select2";

// ---------------
//  Widgets
// ---------------
import "widgets/clearable-file-field/clearable-file-field";
import "widgets/date-field/date-field";
import "widgets/ip-field/ip-field";
import "widgets/email-field/email-field";
import "widgets/file-field/file-field";
import "widgets/fk-raw-field/fk-raw-field";
import "widgets/number-field/number-field";
import "widgets/password-field/password-field";
import "widgets/select-field/select-field";
import "widgets/select-date-field/select-date-field";  // must be below select-field
import "widgets/select-multiple-field/select-multiple-field";
import "widgets/split-datetime-field/split-datetime-field";
import "widgets/text-field/text-field";
import "widgets/time-field/time-field";
import "widgets/url-field/url-field";
import "widgets/uuid-field/uuid-field";

// ---------------
//  BEM
// ---------------
import "bem/paper-breadcrumbs/paper-breadcrumbs";
import "bem/paper-card/paper-card";
import "bem/paper-environment/paper-environment";
import "bem/paper-error-list/paper-error-list";
import "bem/paper-footer/paper-footer";
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
import "css/changelist.scss";

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


export const paperAdmin = {
    bootstrap,
    emitters,
    formUtils,
    modals,
    Sortable,
    Widget
}

window.django = window.django || {};
window.django.jQuery = jQuery;
