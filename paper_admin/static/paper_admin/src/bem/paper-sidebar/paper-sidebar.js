import Widget from "js/utilities/widget.js";
import "./paper-sidebar.scss";

class SidebarWidget extends Widget {
    constructor(options) {
        super();
        this.opts = Object.assign(
            {
                openClass: "sidebar-open",
                shadowClass: "sidebar-shadow",
                triggerSelector: "[data-toggle='sidebar']"
            },
            options
        );

        document.addEventListener(
            "click",
            function (event) {
                const trigger = event.target.closest(this.opts.triggerSelector);
                if (trigger) {
                    event.preventDefault();
                    this.toggle();
                }
            }.bind(this)
        );
    }

    get hidden() {
        return !document.documentElement.classList.contains(this.opts.openClass);
    }

    show() {
        if (!this.hidden) {
            return;
        }

        let shadow = document.body.querySelector(`.${this.opts.shadowClass}`);
        if (!shadow) {
            shadow = document.createElement("div");
            shadow.classList.add(this.opts.shadowClass);
            shadow.dataset["toggle"] = "sidebar";
            document.body.appendChild(shadow);
        }

        setTimeout(
            function () {
                document.documentElement.classList.add(this.opts.openClass);
            }.bind(this),
            0
        );
    }

    hide() {
        if (this.hidden) {
            return;
        }

        document.documentElement.classList.remove(this.opts.openClass);
    }

    toggle() {
        if (this.hidden) {
            this.show();
        } else {
            this.hide();
        }
    }
}

const sidebar = new SidebarWidget();
sidebar.observe(".paper-sidebar");
sidebar.initAll(".paper-sidebar");

/**
 * Изменение иконки папки в соответсвии с состоянием пункта меню.
 */
$(document)
    .on("show.bs.collapse", ".paper-sidebar", function (event) {
        const navList = event.target;
        const parentNavItem = navList && navList.closest(".paper-sidebar__item");
        const icon = parentNavItem && parentNavItem.querySelector(":scope > a > .paper-icon-default");
        if (icon) {
            icon.classList.remove("fa-folder-o");
            icon.classList.add("fa-folder-open-o");
        }
    })
    .on("hide.bs.collapse", ".paper-sidebar", function (event) {
        const navList = event.target;
        const parentNavItem = navList && navList.closest(".paper-sidebar__item");
        const icon = parentNavItem && parentNavItem.querySelector(":scope > a > .paper-icon-default");
        if (icon) {
            icon.classList.remove("fa-folder-open-o");
            icon.classList.add("fa-folder-o");
        }
    });
