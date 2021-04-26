/* global gettext */

import Modal from "bootstrap/js/src/modal";
import $ from "jquery";
import "./paper-modal.scss";

const EVENT_KEY = '.bs.modal';
const ESCAPE_KEYCODE = 27;

const EVENT_HIDE = `hide${EVENT_KEY}`;
const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_CLICK_DESTROY = `click.destroy.${EVENT_KEY}`;
const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY}`

const CLASS_NAME_SUSPENDED = 'modal-suspended';
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';

const SELECTOR_DATA_DESTROY = '[data-destroy="modal"]';


const _stack = [];
const Default = {
    title: "",
    body: "",
    modalClass: "fade",
    modalDialogClass: "",
    backdropClass: "paper-modal-backdrop",
    closeButton: true,
    buttons: [],

    templates: {
        modal:
            `<div class="paper-modal modal" tabindex="-1">
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
        closeButton:
            `<button type="button" class="close" data-destroy="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>  
            </button>`,
        button:
            `<button type="button" class="btn"></button>`
    },
    options: {
        backdrop: "static"
    }
}


/**
 * Модальное окно со стеком
 */
class PaperModal extends Modal {
    constructor(options) {
        let config = {
            ...Default,
            ...options
        };

        config.templates = {
            ...Default.templates,
            ...(options.templates || {})
        }

        document.body.insertAdjacentHTML("beforeend", config.templates.modal);
        const root = document.body.lastElementChild;
        super(root, config.options);

        this.config = config;
        this._content = this._element.querySelector(".modal-content");
        this._header = this._element.querySelector(".modal-header");
        this._body = this._element.querySelector(".modal-body");
        this._footer = this._element.querySelector(".modal-footer");

        this.init();
    }

    get suspended() {
        return this._element.classList.contains(CLASS_NAME_SUSPENDED);
    }

    set suspended(value) {
        return this._element.classList.toggle(CLASS_NAME_SUSPENDED, Boolean(value));
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

        if (this.config.closeButton) {
            this._header.insertAdjacentHTML("beforeend", this.config.templates.closeButton);
        }

        if (this.config.buttons && this.config.buttons.length) {
            this.config.buttons.forEach((options) => {
                let button;
                if (this._footer) {
                    this._footer.insertAdjacentHTML("beforeend", this.config.templates.button);
                    button = this._footer.lastElementChild;
                } else {
                    this._body.insertAdjacentHTML("beforeend", this.config.templates.button);
                    button = this._body.lastElementChild;
                }

                if (options.label) {
                    button.innerText = options.label;
                }

                if (options.buttonClass) {
                    button.classList.add.apply(button.classList, options.buttonClass.trim().split(/\s+/));
                }

                if (options.autofocus) {
                    $(this._element).one(EVENT_SHOWN, function() {
                        setTimeout(function() {
                            button.focus();
                        });
                    });
                }

                if (options.onClick && (typeof options.onClick === "function")) {
                    button.addEventListener("click", options.onClick.bind(this));
                }
            });
        }
    }

    dispose() {
        super.dispose();
        this._content = null;
        this._header = null;
        this._body = null;
        this._footer = null;
    }

    destroy() {
        const transitionComplete = function() {
            if (this._element) {
                this._element.remove();
            }
            this.dispose();
        }.bind(this);

        if (this._isShown) {
            if (this._isTransitioning) {
                // Окно в процессе открытия. Ждем завершения открытия,
                // затем вызываем функцию закрытия, по окончании которой
                // окно будет удалено.
                $(this._element).one(EVENT_SHOWN, () => {
                    $(this._element).one(EVENT_HIDDEN, transitionComplete);
                    this.hide();
                });
            } else {
                // Окно открыто. Сначала скрываем его, потом удаляем.
                $(this._element).one(EVENT_HIDDEN, transitionComplete);
                this.hide();
            }
        } else {
            if (this._isTransitioning) {
                // Окно в процессе скрытия. Ждем завершения анимации и удаляем его.
                $(this._element).one(EVENT_HIDDEN, transitionComplete);
            } else {
                // Окно уже скрыто. Удаляем его сразу
                transitionComplete();
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
                if (this._config.keyboard && event.which === ESCAPE_KEYCODE) {
                    event.preventDefault();
                    this.destroy();
                } else if (!this._config.keyboard && event.which === ESCAPE_KEYCODE) {
                    this._triggerBackdropTransition();
                }
            })
        } else if (!this._isShown) {
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
                }, 0);
            }

            $(this._backdrop).off("bsTransitionEnd");
        }

        // Должен быть вызван до события hidden, т.к. вызов destroy может
        // привести к потере доступа к this._element.
        this.suspended = true;

        $(this._element).trigger(EVENT_HIDDEN);
    }

    resume() {
        if (!this.suspended) {
            return
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
                }, 0);
            }
        }

        this.suspended = false;
    }

    show(relatedTarget) {
        if (this._isShown || this._isTransitioning) {
            return
        }

        this.suspended = false;

        $(this._element).on(
            EVENT_CLICK_DESTROY,
            SELECTOR_DATA_DESTROY,
            () => {
                this.destroy();
            }
        );

        const stackIndex = _stack.indexOf(this);
        if (stackIndex >= 0) {
            _stack.splice(stackIndex, 1);
        }

        // скрытие всех текущих окон
        let hasVisibleModals = false;
        _stack.forEach(function(modal) {
            if (modal._isShown && !modal.suspended) {
                modal._suspend();
                hasVisibleModals = true;
            }
        });

        _stack.push(this);

        if (hasVisibleModals) {
            // мгновенный показ окна, минуя анимации
            const animate = this._element.classList.contains(CLASS_NAME_FADE);
            this._element.classList.remove(CLASS_NAME_FADE);
            super.show(relatedTarget);
            if (animate) {
                this._element.classList.add(CLASS_NAME_FADE);
            }
        } else {
            super.show(relatedTarget);
        }
    }

    hide(event) {
        if (event) {
            event.preventDefault()
        }

        if (!this._isShown || this._isTransitioning) {
            return
        }

        this.suspended = false;

        $(this._element).off(EVENT_CLICK_DESTROY);

        const stackIndex = _stack.indexOf(this);
        if (stackIndex >= 0) {
            _stack.splice(stackIndex, 1);
        }

        if ((stackIndex === _stack.length) && (stackIndex > 0)) {
            let previousModal = _stack[_stack.length - 1];
            if (previousModal.suspended) {
                this._removeBackdrop();
                this._suspend(event);
                previousModal.resume();
            } else {
                super.hide(event);
            }
        } else {
            super.hide(event);
        }
    }
}


/**
 * Специализированное окно для показа прелоадера.
 * @param {Object?} options
 * @returns {PaperModal}
 */
function showPreloader(options) {
    const config = {
        ...{
            body:
                `<div class="paper-preloader">
                  <div class="paper-preloader__text">Loading</div>
                </div>`,
            modalClass: "paper-modal--preloader fade-in",
            modalDialogClass: "modal-sm",
            closeButton: false,
            templates: {
                modal:
                    `<div class="paper-modal modal" tabindex="-1">
                      <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-body"></div>
                        </div>
                      </div>
                    </div>`,
            }
        },
        ...options
    }

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
        new Promise((resolve) => {
            setTimeout(() => {
                resolve(WAITING_TIME_PASSED);
            }, WAITING_TIME);
        }),
    ]).then(function(result) {
        if (result !== WAITING_TIME_PASSED) {
            return result;
        }

        const preloader = showPreloader(options);
        return Promise.allSettled([
            promise,
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, PRELOADER_MIN_SHOWING_TIME);
            })
        ]).then(function(results) {
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


const modals = {
    PaperModal,
    showPreloader,
    showSmartPreloader
};

export default modals;
