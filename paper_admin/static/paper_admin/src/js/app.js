/* global gettext */

import * as bootstrap from "bootstrap";
import emitters from "js/utilities/emitters";
import formUtils from "js/utilities/form_utils";
import Sortable from "sortablejs";
import Widget from "js/utilities/widget";
import "js/components/cancel";
import "js/components/filedrag";
import "js/widgets/bootstrap";

// CSS
import "css/common.scss";

import "bem/paper-breadcrumbs/paper-breadcrumbs";
import "bem/paper-card/paper-card";
import "bem/paper-environment/paper-environment";
import "bem/paper-footer/paper-footer";
import "bem/paper-header/paper-header";
import "bem/paper-messages/paper-messages";
import modals from "bem/paper-modal/paper-modal";
import "bem/paper-object-list/paper-object-list";
import "bem/paper-page/paper-page";
import "bem/paper-preloader/paper-preloader";
import "bem/paper-sidebar/paper-sidebar";
import "bem/select2/select2";

import "bem/paper-form/paper-form";

// Pages
import "css/dashboard.scss";
import "css/login.scss";
import "css/changelist.scss";
import "css/changeform.scss";

// Images
import "img/default_favicon.png";


// changelist page
if (document.body.classList.contains("changelist-page")) {
    import(/* webpackChunkName: "changelist" */ "js/changelist");
}

// changeform page
if (document.body.classList.contains("changeform-page")) {
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
