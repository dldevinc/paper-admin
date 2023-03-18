import anime from "animejs";

/**
 * Плавный скролл к указанной Y-координате.
 * @param {Element} element
 * @param {Number} viewportPosition - between 0 and 1
 * @param {Object} options
 */
export function scrollTo(element, viewportPosition = 0.3, options = {}) {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top;
    const offset = viewportPosition * document.documentElement.clientHeight;
    const isVisible = elementTop > offset && elementTop < document.documentElement.clientHeight - offset;
    if (!isVisible) {
        anime(Object.assign({
            targets: document.documentElement,
            scrollTop: Math.max(0, elementTop - offset),
            easing: "easeOutExpo",
            delay: 50,
            duration: 500
        }, options))
    }
}