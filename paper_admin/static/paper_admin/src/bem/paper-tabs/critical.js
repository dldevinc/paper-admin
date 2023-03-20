window._paperTabs = {
    getTabFromHash: function () {
        const tabName = window.location.hash.substring(1);
        return document.getElementById(`${tabName}-tab`);
    },
    getPanelFor: function (tab) {
        return document.getElementById(tab.hash.substring(1));
    },
    setUnderline: function (tab) {
        const tabRoot = tab.closest(".paper-tabs");
        const underline = tabRoot.querySelector(".paper-tabs__underline");
        const computedStyle = getComputedStyle(tab);
        const lineWidth = tab.clientWidth - parseInt(computedStyle.paddingLeft) - parseInt(computedStyle.paddingRight);
        const lineLeft = tab.offsetLeft + parseInt(computedStyle.paddingLeft);
        const lineTop = tab.offsetTop + tab.offsetHeight - parseInt(computedStyle.paddingBottom);
        underline.style.width = `${lineWidth}px`;
        underline.style.left = `${lineLeft}px`;
        underline.style.top = `${lineTop}px`;
    },
    updateUnderlines: function () {
        const paperTabRoots = document.querySelectorAll(".paper-tabs");
        Array.from(paperTabRoots).forEach(tabRoot => {
            const activeTab = tabRoot.querySelector(".nav-link.active");
            this.setUnderline(activeTab);
        });
    },
    init: function () {
        const paperTabRoots = document.querySelectorAll(".paper-tabs");
        Array.from(paperTabRoots).forEach(tabRoot => {
            let activeTab = this.getTabFromHash();
            if (!activeTab || !tabRoot.contains(activeTab)) {
                activeTab = tabRoot.querySelector(".nav-link");
            }

            const tabs = tabRoot.querySelectorAll("[role='tab']");
            Array.from(tabs).forEach(tab => {
                tab.classList.toggle("active", tab === activeTab);

                const panel = this.getPanelFor(tab);
                panel.classList.toggle("active", tab === activeTab);
            });

            document.addEventListener("DOMContentLoaded", () => {
                this.setUnderline(activeTab);
            });
        });
    }
};
