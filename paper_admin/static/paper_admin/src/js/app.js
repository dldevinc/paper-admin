/* global gettext */

import * as bootstrap from "bootstrap";
import Sortable from "sortablejs";
import Sidebar from "js/components/Sidebar";
import PerfectScrollbar from "perfect-scrollbar";
import ScrollTopButton from "js/components/ScrollTopButton";
import emitters from "js/utilities/emitters";
import modals from "js/components/modals";
import formUtils from "js/components/form_utils";
import "js/components/bootstrap";
import "js/components/cancel";
import "js/components/filedrag";
import "js/components/menu";

// CSS
import "css/fonts.scss";
import "css/common.scss";
import "css/dashboard.scss";
import "css/app_index.scss";
import "css/history.scss";
import "css/login.scss";
import "css/delete.scss";
import "css/changelist.scss";
import "css/changeform.scss";

// Images
import "img/favicon.png";
import "img/menu_bg.jpg";


// кнопка скролла к вверху страницы
new ScrollTopButton();

// сайдбар
const sidebar_root = document.getElementById("paper-sidebar");
if (sidebar_root) {
    new Sidebar(sidebar_root);

    const scrollbar = sidebar_root.querySelector(".sidebar-scroll");
    scrollbar && new PerfectScrollbar(scrollbar);
}

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
    Sortable,
    PerfectScrollbar,
    emitters,
    formUtils,
    modals,
};
