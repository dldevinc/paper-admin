/* global gettext */

import * as bootstrap from "bootstrap";
import emitters from "js/utilities/emitters";
import formUtils from "js/utilities/form_utils";
import modals from "js/components/modals";
import Sortable from "sortablejs";
import Widget from "js/utilities/widget";
import "js/components/cancel";
import "js/components/filedrag";
import "js/widgets/bootstrap";
import "js/widgets/select2";

// CSS
import "css/fonts.scss";
import "css/common.scss";

import "bem/paper-header/paper-header";
import "bem/paper-sidebar/paper-sidebar";

// Pages
import "css/dashboard.scss";
import "css/app_index.scss";
import "css/history.scss";
import "css/login.scss";
import "css/delete.scss";
import "css/changelist.scss";
import "css/changeform.scss";

// Images
import "img/favicon.png";


// changelist page
if (document.body.classList.contains("changelist-page")) {
    import(/* webpackChunkName: "changelist" */ "js/changelist");
}

// changeform page
if (document.body.classList.contains("changeform-page")) {
    import(/* webpackChunkName: "changeform" */ "js/changeform");
}

// passwordform page
if (document.body.classList.contains("passwordform-page")) {
    import(/* webpackChunkName: "passwordform" */ "js/passwordform");
}


export const django = {
    jQuery
}

export {
    bootstrap,
    emitters,
    formUtils,
    modals,
    Sortable,
    Widget
};
