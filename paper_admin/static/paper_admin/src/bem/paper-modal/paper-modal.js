/* global gettext */

import allSettled from "promise.allsettled";
import Modal from "bootstrap/js/src/modal.js";
import Util from "bootstrap/js/src/util.js";
import "./paper-modal.scss";

const EVENT_KEY = ".bs.modal";

const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`;
const EVENT_SHOWN = `shown${EVENT_KEY}`;
const EVENT_CLICK_DESTROY = `click.destroy.${EVENT_KEY}`;
const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY}`;
const EVENT_AUTOFOCUS = `autofocus${EVENT_KEY}`;

const CLASS_NAME_SCROLLABLE = "modal-dialog-scrollable";
const CLASS_NAME_SUSPENDED = "modal-suspended";
const CLASS_NAME_FADE = "fade";
const CLASS_NAME_SHOW = "show";

const SELECTOR_MODAL_BODY = ".modal-body";
const SELECTOR_DATA_DESTROY = '[data-destroy="modal"]';

const _stack = [];
const Defaults = {
    title: "",
    body: "",
    modalClass: "fade",
    modalDialogClass: "",
    backdropClass: "paper-modal-backdrop",
    closeButton: true,
    buttons: [],

    templates: {
        modal: `<div class="paper-modal modal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title"></h5>
                  </div>
                  <div class="modal-body"></div>
                  <div class="modal-footer"></div>
                </div>
              </div>
            </div>`,
        closeButton: `<button type="button" class="close" aria-label="Close">
              <span class="bi-x-circle" aria-hidden="true"></span>  
            </button>`,
        button: `<button type="button" class="btn"></button>`
    },

    options: {
        backdrop: "static"
    },

    onInit: null,
    onDestroy: null,
    onClose: function () {
        this.destroy();
    }
};

const ButtonDefaults = {
    label: "",
    buttonClass: "",
    autofocus: false,
    onClick: null
}

/**
 * Модальное окно.
 *
 * Добавлен функционал стека модальных окон: когда открывается новое окно
 * (при уже других открытых), текущее окно временнно скрывается. После закрытия
 * самого нового окна будет восстановлено предыдущее.
 *
 * @example
 * new PaperModal({
 *     title: "Hello, world!",
 *     body: "<h1>Caption</h1>\n<p>Sample text</p>",
 *     modalClass: "paper-modal--warning fade",
 *     buttons: [
 *         {
 *             label: "Cancel",
 *             buttonClass: "btn-light",
 *             onClick: function(event, popup) {
 *                 popup.destroy();
 *             }
 *         },
 *         {
 *             autofocus: true,
 *             label: "OK",
 *             buttonClass: "btn-info",
 *             onClick: function(event, popup) {
 *                 console.log("Success");
 *                 popup.destroy();
 *             }
 *         }
 *     ],
 *     onInit: function() {
 *         this.show();
 *     }
 * })
 */
class PaperModal extends Modal {
    constructor(options) {
        const config = {
            ...Defaults,
            ...options
        };

        config.templates = {
            ...Defaults.templates,
            ...(options.templates || {})
        };

        document.body.insertAdjacentHTML("beforeend", config.templates.modal);
        const root = document.body.lastElementChild;
        super(root, config.options);

        this.config = config;
        this._content = this._element.querySelector(".modal-content");
        this._header = this._element.querySelector(".modal-header");
        this._body = this._element.querySelector(".modal-body");
        this._footer = this._element.querySelector(".modal-footer");
        this._suspended = false;
        this._element._modal = this;

        this.init();

        if (typeof this.config.onInit === "function") {
            this.config.onInit.call(this);
        }
    }

    static getClosestModal() {
        return _stack[_stack.length - 1] || null;
    }

    get suspended() {
        return this._suspended;
    }

    set suspended(value) {
        this._suspended = Boolean(value);
        this._element && this._element.classList.toggle(CLASS_NAME_SUSPENDED, this._suspended);
    }

    init() {
        if (this.config.modalClass) {
            this._element.classList.add.apply(this._element.classList, this.config.modalClass.trim().split(/\s+/));
        }

        if (this.config.modalDialogClass) {
            this._dialog.classList.add.apply(this._dialog.classList, this.config.modalDialogClass.trim().split(/\s+/));
        }

        if (this.config.title) {
            this._element.querySelector(".modal-title").innerText = this.config.title;
        }

        if (this.config.body) {
            this._body.innerHTML = this.config.body;
        }

        if (this.config.closeButton && this._header) {
            this._header.insertAdjacentHTML("beforeend", this.config.templates.closeButton);

            const closeButton = this._header.querySelector(".close");
            closeButton &&
                closeButton.addEventListener("click", () => {
                    if (typeof this.config.onClose === "function") {
                        this.config.onClose.call(this);
                    }
                });
        }

        if (this.config.buttons && this.config.buttons.length) {
            this.config.buttons.forEach(options => {
                const config = {
                    ...ButtonDefaults,
                    ...options
                }

                let button;
                if (this._footer) {
                    this._footer.insertAdjacentHTML("beforeend", this.config.templates.button);
                    button = this._footer.lastElementChild;
                } else {
                    this._body.insertAdjacentHTML("beforeend", this.config.templates.button);
                    button = this._body.lastElementChild;
                }

                if (config.label) {
                    button.innerText = config.label;
                }

                if (config.buttonClass) {
                    button.classList.add.apply(button.classList, config.buttonClass.trim().split(/\s+/));
                }

                if (config.autofocus) {
                    $(this._element).one(EVENT_AUTOFOCUS, () => {
                        button.focus();
                    });
                }

                if (typeof config.onClick === "function") {
                    button.addEventListener("click", event => {
                        config.onClick.call(button, event, this);
                    });
                }
            });
        }
    }

    dispose() {
        const stackIndex = _stack.indexOf(this);
        if (stackIndex >= 0) {
            _stack.splice(stackIndex, 1);
        }

        super.dispose();
        this._content = null;
        this._header = null;
        this._body = null;
        this._footer = null;
    }

    /**
     * Уничтожение модального окна без учёта состояния и анимаций.
     * Note: не вызывает событие `hidden`.
     * @private
     */
    _destroyModal() {
        if (typeof this.config.onDestroy === "function") {
            this.config.onDestroy.call(this);
        }

        if (this._element) {
            this._element.remove();
        }

        this._removeBackdrop();

        this.dispose();
    }

    /**
     * Скрытие и уничтожение окна с учетом анимаций.
     * @returns {Promise}
     */
    destroy() {
        if (this._isShown) {
            if (this._isTransitioning) {
                // Окно в процессе открытия. Ждем завершения открытия,
                // затем вызываем функцию закрытия, по окончании которой
                // окно будет удалено.
                return new Promise(resolve => {
                    $(this._element).one(EVENT_SHOWN, () => {
                        if (this._isShown) {
                            this.hide().then(() => {
                                this._destroyModal();
                                resolve();
                            });
                        } else {
                            // Ситуация, когда окно было заморожено (suspended)
                            // во время открытия.
                            this._destroyModal();
                            resolve();
                        }
                    });
                });
            } else {
                // Окно открыто. Сначала скрываем его, потом удаляем.
                return new Promise(resolve => {
                    this.hide().then(() => {
                        this._destroyModal();
                        resolve();
                    });
                });
            }
        } else {
            if (this._isTransitioning) {
                // Окно в процессе скрытия. Ждем завершения анимации и удаляем его.
                return new Promise(resolve => {
                    $(this._element).one(EVENT_HIDDEN, () => {
                        this._destroyModal();
                        resolve();
                    });
                });
            } else {
                // Окно уже скрыто. Удаляем его сразу
                this._destroyModal();
                return Promise.resolve();
            }
        }
    }

    _showBackdrop(callback) {
        super._showBackdrop(callback);

        if (this._isShown && this._backdrop && this.config.backdropClass) {
            this._backdrop.classList.add.apply(this._backdrop.classList, this.config.backdropClass.trim().split(/\s+/));
        }
    }

    _setEscapeEvent() {
        if (this._isShown) {
            $(this._element).on(EVENT_KEYDOWN_DISMISS, event => {
                if (event.code === "Escape") {
                    if (this._config.keyboard) {
                        event.preventDefault();
                        if (typeof this.config.onClose === "function") {
                            this.config.onClose.call(this);
                        }
                    } else {
                        this._triggerBackdropTransition();
                    }
                }
            });
        } else {
            $(this._element).off(EVENT_KEYDOWN_DISMISS);
        }
    }

    /**
     * Мгновенно скрывает модальное окно, независимо от того,
     * в каком состоянии оно находилось.
     */
    _suspend(event) {
        if (event) {
            event.preventDefault();
        }

        $(this._element).trigger(EVENT_HIDE);

        this._isShown = false;
        this._element.style.display = "none";
        this._element.setAttribute("aria-hidden", true);
        this._element.removeAttribute("aria-modal");
        this._element.removeAttribute("role");
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_SHOW);

        if (this._backdrop) {
            const animate = this._backdrop.classList.contains(CLASS_NAME_FADE);
            this._backdrop.classList.remove(CLASS_NAME_FADE, CLASS_NAME_SHOW);
            if (animate) {
                setTimeout(() => {
                    this._backdrop.classList.add(CLASS_NAME_FADE);
                });
            }

            $(this._backdrop).off("bsTransitionEnd");
        }

        // Должен быть вызван до события hidden, т.к. вызов destroy может
        // привести к потере доступа к this._element.
        this.suspended = true;

        $(this._element).trigger(EVENT_HIDDEN);
    }

    _resume() {
        if (!this.suspended || !this._element) {
            return;
        }

        $(this._element).trigger(EVENT_SHOW);
        this._isShown = true;
        this._element.style.display = "block";
        this._element.removeAttribute("aria-hidden");
        this._element.setAttribute("aria-modal", true);
        this._element.setAttribute("role", "dialog");
        this._isTransitioning = false;
        this._element.classList.add(CLASS_NAME_SHOW);

        $(this._element).trigger(EVENT_SHOWN);

        if (this._backdrop) {
            const animate = this._backdrop.classList.contains(CLASS_NAME_FADE);
            this._backdrop.classList.remove(CLASS_NAME_FADE);
            this._backdrop.classList.add(CLASS_NAME_SHOW);
            if (animate) {
                setTimeout(() => {
                    this._backdrop.classList.add(CLASS_NAME_FADE);
                });
            }
        }

        this.suspended = false;
    }

    show(relatedTarget) {
        if (this._isShown) {
            return Promise.reject("Modal is already open");
        }

        if (this._isTransitioning) {
            return Promise.reject("Animation in progress");
        }

        this.suspended = false;

        $(this._element).on(EVENT_CLICK_DESTROY, SELECTOR_DATA_DESTROY, () => {
            this.destroy();
        });

        const stackIndex = _stack.indexOf(this);
        if (stackIndex >= 0) {
            _stack.splice(stackIndex, 1);
        }

        // скрытие всех текущих окон
        let hasVisibleModals = false;
        _stack.forEach(modal => {
            if (modal._isShown && !modal.suspended) {
                modal._suspend();
                hasVisibleModals = true;
            }
        });

        _stack.push(this);

        const superCall = super.show.bind(this);
        if (hasVisibleModals) {
            // мгновенный показ окна, минуя анимации
            const animate = this._element.classList.contains(CLASS_NAME_FADE);
            this._element.classList.remove(CLASS_NAME_FADE);
            super.show(relatedTarget);
            if (animate) {
                this._element.classList.add(CLASS_NAME_FADE);
            }

            return Promise.resolve();
        } else {
            return new Promise(resolve => {
                $(this._element).one(EVENT_SHOWN, () => resolve());
                superCall(relatedTarget);
            });
        }
    }

    hide(event) {
        if (event) {
            event.preventDefault();
        }

        if (!this._isShown) {
            return Promise.reject("Modal is already closed");
        }

        if (this._isTransitioning) {
            return Promise.reject("Animation in progress");
        }

        this.suspended = false;

        $(this._element).off(EVENT_CLICK_DESTROY);

        const stackIndex = _stack.indexOf(this);
        if (stackIndex >= 0) {
            _stack.splice(stackIndex, 1);
        }

        const superCall = super.hide.bind(this);
        if (stackIndex === _stack.length && stackIndex > 0) {
            const previousModal = _stack[_stack.length - 1];
            if (previousModal.suspended) {
                this._removeBackdrop();
                this._suspend(event);
                previousModal._resume();
                return Promise.resolve();
            } else {
                return new Promise(resolve => {
                    $(this._element).one(EVENT_HIDDEN, () => resolve());
                    superCall(event);
                });
            }
        } else {
            return new Promise(resolve => {
                $(this._element).one(EVENT_HIDDEN, () => resolve());
                superCall(event);
            });
        }
    }

    /*
        Исправлен автофокус.
        По умолчанию, фокус безоговорочно ставится на само окно на событии shown.
        Это создает проблему автофокусировки на кнопках при наличии анимации:
        из-за задержки такой фокус спадает.

        Добавлено событие autofocus, т.к. элементы окна недоступны для фокусирования
        до тех пор, пока окно не стало видимым.
     */
    _showElement(relatedTarget) {
        const transition = $(this._element).hasClass(CLASS_NAME_FADE);
        const modalBody = this._dialog ? this._dialog.querySelector(SELECTOR_MODAL_BODY) : null;

        if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
            // Don't move modal's DOM position
            document.body.appendChild(this._element);
        }

        this._element.style.display = "block";
        this._element.removeAttribute("aria-hidden");
        this._element.setAttribute("aria-modal", true);
        this._element.setAttribute("role", "dialog");

        if ($(this._dialog).hasClass(CLASS_NAME_SCROLLABLE) && modalBody) {
            modalBody.scrollTop = 0;
        } else {
            this._element.scrollTop = 0;
        }

        if (transition) {
            Util.reflow(this._element);
        }

        $(this._element).addClass(CLASS_NAME_SHOW);

        if (this._config.focus) {
            this._enforceFocus();
        }

        const shownEvent = $.Event(EVENT_SHOWN, {
            relatedTarget
        });

        // autofocus event
        $(this._element).trigger($.Event(EVENT_AUTOFOCUS));

        const transitionComplete = () => {
            if (this._config.focus) {
                if (document.activeElement && !this._element.contains(document.activeElement)) {
                    this._element.focus();
                }
            }

            this._isTransitioning = false;
            $(this._element).trigger(shownEvent);
        };

        if (transition) {
            const transitionDuration = Util.getTransitionDurationFromElement(this._dialog);

            $(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
        } else {
            transitionComplete();
        }
    }
}

/**
 * Обертка над PaperModal для создания окна.
 * @param {Object?} options
 * @returns {PaperModal}
 */
function createModal(options) {
    return new PaperModal(options);
}

/**
 * Специализированное окно для показа ошибок формы.
 * @param {String|String[]} errors
 * @param {Object?} options
 * @returns {PaperModal}
 */
function showErrors(errors, options) {
    let title = gettext("Error");
    let message;

    if (Array.isArray(errors)) {
        if (errors.length === 1) {
            message = errors[0];
        } else {
            title = gettext("Please correct the following errors");

            const output = [`<ul class="px-4 mb-0">`];
            for (let i = 0, l = errors.length; i < l; i++) {
                output.push(`<li>${errors[i]}</li>`);
            }
            output.push(`</ul>`);
            message = output.join("\n");
        }
    } else {
        message = errors;
    }

    const modal = createModal(
        Object.assign(
            {
                modalClass: "paper-modal--danger fade",
                title: title,
                body: message,
                buttons: [
                    {
                        autofocus: true,
                        label: gettext("OK"),
                        buttonClass: "btn-success",
                        onClick: function (event, popup) {
                            popup.destroy();
                        }
                    }
                ]
            },
            options
        )
    );

    modal.show();

    return modal;
}

/**
 * Специализированное окно для показа прелоадера.
 * @param {Object?} options
 * @returns {PaperModal}
 */
function showPreloader(options) {
    const config = {
        ...{
            body: `<div class="paper-preloader">
                  <div class="paper-preloader__text">Loading</div>
                </div>`,
            modalClass: "paper-modal--preloader fade-in",
            modalDialogClass: "modal-sm",
            closeButton: false,
            templates: {
                modal: `<div class="paper-modal modal" tabindex="-1">
                      <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-body"></div>
                        </div>
                      </div>
                    </div>`
            },
            onClose: null
        },
        ...options
    };

    const modal = new PaperModal(config);
    modal.show();
    return modal;
}

/**
 * Показывает прелоадер для указанного промиса.
 *
 * Если промис разрешится ранее, чем через WAITING_TIME, прелоадер
 * показан не будет. Это предотвратит показ прелоадера для
 * очень быстрых промисов.
 *
 * Если промис будет выполняться дольше, чем WAITING_TIME, то
 * будет показан прелоадер и он закроется не ранее, чем через
 * PRELOADER_MIN_SHOWING_TIME. Это предотвратит мелькание
 * прелоадера для промисов, которые выполняются лишь немного
 * дольше, чем WAITING_TIME.
 *
 * @param {Promise} promise
 * @param {Object?} options
 * @returns {Promise}
 */
function showSmartPreloader(promise, options) {
    const WAITING_TIME = 200;
    const WAITING_TIME_PASSED = Symbol("waiting");
    const PRELOADER_MIN_SHOWING_TIME = 600;

    return Promise.race([
        promise,
        new Promise(resolve => {
            setTimeout(() => {
                resolve(WAITING_TIME_PASSED);
            }, WAITING_TIME);
        })
    ]).then(result => {
        if (result !== WAITING_TIME_PASSED) {
            return result;
        }

        const preloader = showPreloader(options);
        return allSettled([
            promise,
            new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, PRELOADER_MIN_SHOWING_TIME);
            })
        ]).then(results => {
            preloader.destroy();

            const promiseResult = results[0];
            if (promiseResult.status === "fulfilled") {
                return promiseResult.value;
            } else {
                if (promiseResult.reason instanceof Error) {
                    throw promiseResult.reason;
                } else {
                    throw new Error(promiseResult.reason);
                }
            }
        });
    });
}

/**
 * Получение экземпляра модального окна из корневого DOM-элемента.
 * @param {HTMLElement} element
 * @returns {PaperModal|null}
 */
function getModal(element) {
    return element._modal || null;
}

const modals = {
    createModal,
    getModal,
    showErrors,
    showPreloader,
    showSmartPreloader
};

export default modals;
