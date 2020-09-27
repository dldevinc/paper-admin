/* global gettext */

import {Modal} from "bootstrap";

const modalStack = [];
const templates = {
    modal: `
        <div class="paper-modal modal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="paper-modal__body modal-body">
              </div>
            </div>
          </div>
        </div>`,
    header: `
        <div class="paper-modal__header modal-header">
          <h3 class="paper-modal__title modal-title"></h3>
        </div>`,
    footer:
        `<div class="paper-modal__footer modal-footer"></div>`,
    closeButton:
        `<button type="button" class="paper-modal__close-button close" aria-hidden="true">&times;</button>`,
    button:
        `<button type="button" class="btn btn-lg"></button>`
}


/**
 * @returns {PaperModal}
 * @constructor
 */
function PaperModal(element, config) {
    Modal.apply(this, arguments);
    this._autohidden = false;
    return this;
}
PaperModal.prototype = Object.create(Modal.prototype);
PaperModal.prototype.constructor = PaperModal;

/**
 * Скрывает все открытые модальные окна и показывает
 * текущее окно, помещая его наверх стека.
 * @returns {PaperModal}
 */
PaperModal.prototype.show = function() {
    const stackIndex = modalStack.indexOf(this);
    if (stackIndex >= 0) {
        modalStack.splice(stackIndex, 1);
    }

    modalStack.forEach(function(modal) {
        if (modal._isShown && !modal._isTransitioning) {
            modal.hide();
            modal._autohidden = true;
        }
    });

    this._autohidden = false;
    modalStack.push(this);
    Modal.prototype.show.apply(this, arguments);
    return this;
}

/**
 * Скрытие окна
 * @returns {PaperModal}
 */
PaperModal.prototype.hide = function() {
    this._autohidden = false;
    Modal.prototype.hide.apply(this, arguments);
    return this;
}

/**
 * Скрытие окна
 * @returns {PaperModal}
 */
PaperModal.prototype.forcedHide = function() {
    this._autohidden = false;
    this._isTransitioning = false;  // force
    Modal.prototype.hide.apply(this, arguments);
    return this;
}

/**
 * Уничтожение окна. Если предыдущее окно в стеке было скрыто
 * автоматически, то оно будет вновь показано.
 */
PaperModal.prototype.destroy = function() {
    const stackIndex = modalStack.indexOf(this);
    if (stackIndex >= 0) {
        modalStack.splice(stackIndex, 1);
    }

    const that = this;
    const element = this._element;
    $(element).one('hidden.bs.modal', function() {
        element.remove();

        if (that._element) {
            that.dispose();
        }

        if ((stackIndex === modalStack.length) && (stackIndex > 0)) {
            // последний элемент
            let prevModal = modalStack[stackIndex - 1];
            if (prevModal._autohidden === true) {
                prevModal.show();
            }
        }
    });

    this.forcedHide();
}


function createModal(options) {
    const opts = Object.assign({
        size: null,
        title: '',
        message: '',
        className: '',
        backdrop: 'static',
        onEscape: true,
        closeButton: true,
        scrollable: false,
        centerVertical: false,
        onShow: null,
        onShown: null,
        onHide: null,
        onHidden: null,
        buttons: []
    }, options);

    document.body.insertAdjacentHTML('beforeend', templates.modal);
    const modalElement = document.body.lastElementChild;
    const $dialog = $(modalElement);
    const modal = new PaperModal(modalElement, {
        keyboard: false,
        backdrop: opts.backdrop
    });

    if (opts.size) {
        switch (opts.size) {
            case 'small':
            case 'sm':
                modal._dialog.classList.add('modal-sm');
                break;
            case 'large':
            case 'lg':
                modal._dialog.classList.add('modal-lg');
                break;
        }
    }

    if (opts.title) {
        modalElement.querySelector('.modal-content').insertAdjacentHTML('afterbegin', templates.header);
        modalElement.querySelector('.modal-title').innerText = opts.title;
    }

    if (opts.message) {
        modalElement.querySelector('.modal-body').innerHTML = opts.message;
    }

    if (opts.className) {
        modalElement.classList.add.apply(modalElement.classList, opts.className.split(/\s+/));
    }

    if (opts.closeButton) {
        if (opts.title) {
            modalElement.querySelector('.modal-header').insertAdjacentHTML('beforeend', templates.closeButton);
        } else {
            modalElement.querySelector('.modal-body').insertAdjacentHTML('afterbegin', templates.closeButton);
        }

        $dialog.on('click', '.paper-modal__close-button', function() {
            $dialog.trigger('escape.bs.modal');
        });
    }

    if (opts.buttons && opts.buttons.length) {
        modalElement.querySelector('.modal-content').insertAdjacentHTML('beforeend', templates.footer);
        const footer = modalElement.querySelector('.modal-footer');
        opts.buttons.forEach(function(config) {
            const template = document.createElement('template');
            template.innerHTML = templates.button.trim();
            const btn = template.content.firstChild;

            if (config.label) {
                btn.innerHTML = config.label;
            }

            if (config.className) {
                btn.classList.add.apply(btn.classList, config.className.split(/\s+/));
            }

            if (config.autofocus) {
                $dialog.one('shown.bs.modal', function() {
                    setTimeout(function() {
                        btn.focus();
                    })
                })
            }

            btn.addEventListener('click', function(event) {
                let preventClose = false;
                if (config.callback && (typeof config.callback === 'function')) {
                    preventClose = config.callback.call(modal, event) === false;
                }
                if (!preventClose) {
                    modal.destroy();
                }
            });

            footer.appendChild(btn);
        });
    }

    if (opts.scrollable) {
        modal._dialog.classList.add('modal-dialog-scrollable');
    }

    if (opts.centerVertical) {
        modal._dialog.classList.add('modal-dialog-centered');
    }

    if (opts.onShow && $.isFunction(opts.onShow)) {
        $dialog.on('show.bs.modal', opts.onShow);
    }

    if (opts.onShown && $.isFunction(opts.onShown)) {
        $dialog.on('shown.bs.modal', opts.onShown);
    }

    if (opts.onHide && $.isFunction(opts.onHide)) {
        $dialog.on('hide.bs.modal', opts.onHide);
    }

    if (opts.onHidden && $.isFunction(opts.onHidden)) {
        $dialog.on('hidden.bs.modal', opts.onHidden);
    }

    if (opts.onEscape) {
        $dialog.on('keyup.bs.modal', function(e) {
            if (e.which === 27) {
                $dialog.trigger('escape.bs.modal');
            }
        });
    }

    $dialog.on('escape.bs.modal', function() {
        if (!modal._isTransitioning) {
            modal.destroy();
        }
    });

    return modal;
}


/**
 * Специализированное окно для показа ошибок формы.
 * @param errors
 * @param options
 * @returns {PaperModal}
 */
function showErrors(errors, options) {
    let message = '';
    if (Array.isArray(errors)) {
        if (errors.length === 1) {
            message = errors[0]
        } else {
            let output = [
                `Please correct the following errors:`,
                `<ul class="px-4 mb-0">`,
            ];
            for (let i=0, l=errors.length; i<l; i++) {
                output.push(`<li>${errors[i]}</li>`);
            }
            output.push(`</ul>`);
            message = output.join('\n');
        }
    } else {
        message = errors;
    }

    const opts = Object.assign({
        message: message,
        buttons: [{
            autofocus: true,
            label: gettext('OK'),
            className: 'btn-success',
            callback: function() {
                this.destroy();
            }
        }]
    }, options);
    return createModal(opts).show();
}


/**
 * /**
 * Специализированное окно для показа прелоадера.
 * @param options
 */
function showPreloader(options) {
    const opts = Object.assign({
        size: 'sm',
        onEscape: false,
        closeButton: false,
        className: 'paper-modal--preloader',
        message: `
            <div class="preloader">
              <div class="preloader__text">Loading</div>
            </div>`
    }, options);
    return createModal(opts).show();
}


const modals = {
    PaperModal,
    createModal,
    showErrors,
    showPreloader
};
export default modals;

// share plugin
window.paperAdmin = window.paperAdmin || {};
Object.assign(window.paperAdmin, {
    modals,
});
