import $ from "expose-loader?exposes=$,jQuery!jquery"; // noqa: expose jQuery
import * as bootstrap from "bootstrap";
import anime from "animejs";
import Sortable from "sortablejs";
import XClass from "data-xclass";
import emitters from "js/utilities/emitters.js";
import dragUtils from "js/utilities/drag_utils.js";
import formUtils from "js/utilities/form_utils.js";
import popupUtils from "js/utilities/popup_utils.js";
import Widget from "js/utilities/widget.js"; // TODO: deprecated

// -----------------
//  Common Styles
// -----------------
import "css/vendors/bootstrap.scss";
import "css/vendors/font-awesome.scss";
import "css/common.scss";

// -----------------
//  JS Components
// -----------------
import "components/back-button/index.js";
import "components/bootstrap/index.js";
import "components/filedrag/index.js";
import "components/flatpickr/index.js";
import "components/prepopulate/index.js";
import "components/related-object-lookups/index.js";
import "components/select2/index.js";

// -----------------
//  Django Widgets
// -----------------
import "widgets/clearable-file-field/index.js";
import "widgets/date-field/index.js";
import "widgets/email-field/index.js";
import "widgets/file-field/index.js";
import "widgets/fk-raw-field/index.js";
import "widgets/ip-field/index.js";
import "widgets/number-field/index.js";
import "widgets/password-field/index.js";
import "widgets/related-widget-wrapper/index.js";
import "widgets/select-field/index.js";
import "widgets/select-date-field/index.js"; // must be below select-field
import "widgets/select-multiple-field/index.js";
import "widgets/split-datetime-field/index.js";
import "widgets/text-field/index.js";
import "widgets/time-field/index.js";
import "widgets/url-field/index.js";
import "widgets/uuid-field/index.js";

// -----------------
//  BEM
// -----------------
import "bem/btn-square/btn-square.js";
import "bem/btn-square-group/btn-square-group.js";
import "bem/delete-inline/delete-inline.js";
import "bem/dotted-underline/dotted-underline.js";
import "bem/paper-breadcrumbs/paper-breadcrumbs.js";
import "bem/paper-card/paper-card.js";
import "bem/paper-dropzone/paper-dropzone.js";
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
import "bem/paper-toolbar/paper-toolbar.js";
import "bem/paper-widget/paper-widget.js";

// -----------------
//  Page Styles
// -----------------
import "css/login.scss";

// -----------------
//  Images
// -----------------
import "img/default_favicon.png";

// changelist page
if (document.body.classList.contains("change-list")) {
    import(/* webpackChunkName: "changelist" */ "js/changelist.js").then(() => {
        XClass.initTree();
    });
}

// changeform page
if (document.body.classList.contains("change-form")) {
    import(/* webpackChunkName: "changeform" */ "js/changeform.js").then(() => {
        XClass.initTree();
    });
}

// popup page
const params = new URLSearchParams(window.location.search);
if (params.has("_popup")) {
    import(/* webpackChunkName: "popup" */ "js/popup.js").then(() => {
        XClass.initTree();
    });
}

// Django compability
window.django = window.django || {};
window.django.jQuery = jQuery;

// XClass initialization
document.addEventListener("DOMContentLoaded", () => {
    XClass.start();
});

export default {
    anime,
    Sortable,
    XClass,
    paperAdmin: {
        bootstrap,
        emitters,
        dragUtils,
        formUtils,
        popupUtils,
        modals,
        Widget // TODO: deprecated
    }
};
