import { BaseComponent } from "js/components/baseComponent.js";

import "./paper-sidebar.scss";

export class Sidebar extends BaseComponent {
    get Defaults() {
        return {
            openClass: "sidebar-open",
            shadowClass: "sidebar-shadow",
            triggerSelector: "[data-toggle='sidebar']"
        };
    }

    get hidden() {
        return !document.documentElement.classList.contains(this.options.openClass);
    }

    constructor(options) {
        super(options);

        this.on(document, "click", event => {
            const trigger = event.target.closest(this.options.triggerSelector);
            if (trigger) {
                event.preventDefault();
                this.toggle();
            }
        });
    }

    show() {
        if (!this.hidden) {
            return;
        }

        let shadow = document.body.querySelector(`.${this.options.shadowClass}`);
        if (!shadow) {
            shadow = document.createElement("div");
            shadow.classList.add(this.options.shadowClass);
            shadow.dataset["toggle"] = "sidebar";
            document.body.appendChild(shadow);
        }

        setTimeout(() => {
            document.documentElement.classList.add(this.options.openClass);
        }, 0);
    }

    hide() {
        if (this.hidden) {
            return;
        }

        document.documentElement.classList.remove(this.options.openClass);
    }

    toggle() {
        if (this.hidden) {
            this.show();
        } else {
            this.hide();
        }
    }
}

// Изменение иконки папки в соответствии с состоянием пункта меню.
$(document)
    .on("show.bs.collapse", ".paper-sidebar", event => {
        const navList = event.target;
        const parentNavItem = navList && navList.closest(".paper-sidebar__item");
        const icon = parentNavItem && parentNavItem.querySelector(":scope > a > .paper-icon-default");
        if (icon) {
            icon.classList.remove("fa-folder-o");
            icon.classList.add("fa-folder-open-o");
        }
    })
    .on("hide.bs.collapse", ".paper-sidebar", event => {
        const navList = event.target;
        const parentNavItem = navList && navList.closest(".paper-sidebar__item");
        const icon = parentNavItem && parentNavItem.querySelector(":scope > a > .paper-icon-default");
        if (icon) {
            icon.classList.remove("fa-folder-open-o");
            icon.classList.add("fa-folder-o");
        }
    });

const sidebar = new Sidebar();
export { sidebar };
