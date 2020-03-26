/* global gettext */

import * as bootstrap from "bootstrap";
import Sortable from "sortablejs";
import bootbox from "./vendor/bootbox";
import whenDomReady from "when-dom-ready";
import Sidebar from "./components/Sidebar";
import PerfectScrollbar from "perfect-scrollbar";
import ScrollTopButton from "./components/ScrollTopButton";
import "./components/bootstrap";
import "./components/cancel";
import "./components/filedrag";
import "./components/form_utils";
import "./components/menu";
import "./components/preloader";

// CSS
import "../css/fonts.scss";
import "../css/common.scss";
import "../css/dashboard.scss";
import "../css/app_index.scss";
import "../css/login.scss";
import "../css/delete.scss";
import "../css/changelist.scss";
import "../css/changeform.scss";

// Images
import "../img/favicon.png";
import "../img/menu_bg.jpg";


// Set django.jQuery for compatibility
window.django = {};
window.django.jQuery = jQuery;

whenDomReady(function() {
    bootbox.setDefaults({
        animate: false
    });

    // кнопка скролла к вверху страницы
    new ScrollTopButton();

    // сайдбар
    const sidebar_root = document.getElementById('paper-sidebar');
    if (sidebar_root) {
        new Sidebar(sidebar_root);

        const scrollbar = sidebar_root.querySelector('.sidebar-scroll');
        scrollbar && new PerfectScrollbar(scrollbar);
    }

    // changelist page
    if (document.body.classList.contains('changelist-page')) {
        import(/* webpackChunkName: "changelist" */ './changelist');
    }

    // changeform page
    if (document.body.classList.contains('changeform-page')) {
        import(/* webpackChunkName: "changeform" */ './changeform');
    }

    // passwordform page
    if (document.body.classList.contains('passwordform-page')) {
        import(/* webpackChunkName: "passwordform" */ './passwordform');
    }
});


// Shared API
window.paperAdmin = window.paperAdmin || {};
Object.assign(window.paperAdmin, {
    whenDomReady,
    bootstrap,
    bootbox,
    Sortable,
    PerfectScrollbar,
});
