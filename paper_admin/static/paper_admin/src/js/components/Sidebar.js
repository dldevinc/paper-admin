import Hammer from "hammerjs";
import EventEmitter from "wolfy87-eventemitter";


/**
 * Сайдбар с меню.
 * @param {HTMLElement} root
 * @param options
 * @constructor
 */
function Sidebar(root, options) {
    this.opts = Object.assign({
        hook: '.sidebar-hook',
        togglers: '.sidebar-toggle',
        mediaMaxWidth: 1199
    }, options);

    /**
     * @type {HTMLElement}
     */
    this.root = root;
    if (!this.root) {
        throw new Error('root element not found');
    }

    this.hook = this.root.querySelector(this.opts.hook);
    if (this.hook) {
        this.hook.addEventListener('click', function() {
            if (this.isShown()) {
                this.hide();
            }
        }.bind(this));
    }

    // отслеживание свайпа
    this.hammer = new Hammer.Manager(this.root);
    this.hammer.add([
        new Hammer.Pan({
            direction: Hammer.DIRECTION_HORIZONTAL,
            threshold: 0
        })
    ]);

    // отслеживание ширины экрана
    this._mql = window.matchMedia('(max-width: ' + this.opts.mediaMaxWidth + 'px)');
    this._mql.addEventListener('change', resizeWindow.bind(this));
    resizeWindow.bind(this)(this._mql);

    // нажатие на переключатель меню
    document.addEventListener('click', function(evt) {
        const toggler = evt.target.closest(this.opts.togglers);
        if (toggler) {
            evt.preventDefault();
            this.toggle();
        }
    }.bind(this));
}

Sidebar.prototype = Object.create(EventEmitter.prototype);


Sidebar.prototype.isShown = function() {
    return document.documentElement.classList.contains('nav-open');
};

Sidebar.prototype.show = function() {
    if (!this.isShown()) {
        this._initialOffset = 0;
        document.documentElement.classList.add('nav-open');

        const shadow = document.createElement('div');
        shadow.classList.add('sidebar-shadow');
        document.body.appendChild(shadow);

        this.trigger('show');
    }
};

Sidebar.prototype.hide = function() {
    if (this.isShown()) {
        this._initialOffset = -this._offsetWidth;
        document.documentElement.classList.remove('nav-open');

        const shadow = document.body.querySelector('.sidebar-shadow');
        shadow && shadow.remove();

        this.trigger('hide');
    }
};

Sidebar.prototype.toggle = function() {
    if (this.isShown()) {
        this.hide();
    } else {
        this.show();
    }
};

Sidebar.prototype._onTouchStart = function() {
    this._rafPending = false;
    this._lastEvent = null;
    this._offsetWidth = this.root.offsetWidth;
    this._initialOffset = this._initialOffset == null ? -this._offsetWidth : this._initialOffset;
};

Sidebar.prototype._onTouchMove = function(event) {
    this._lastEvent = event;
    if (this._rafPending) {
        return
    }
    this._rafPending = true;

    const _this = this;
    window.requestAnimationFrame(function() {
        if (!_this._rafPending) {
            return;
        }

        const offset = Math.max(-_this._offsetWidth, Math.min(_this._initialOffset + _this._lastEvent.deltaX, 0));
        if (!_this._lastEvent.isFinal) {
            _this.root.style.transition = 'none';
            _this.root.style.transform = `translate(${offset}px, 0)`;
        } else {
            _this.root.style.transition = '';
            _this.root.style.transform = '';

            // prevent future raf
            _this._rafPending = false;

            if (_this._lastEvent.eventType !== Hammer.INPUT_CANCEL) {
                if (_this._lastEvent.deltaX >= 0) {
                    // moved to right
                    if (offset > -_this._offsetWidth * 0.66) {
                        _this.show();
                    } else {
                        _this.hide();
                    }
                } else {
                    // moved to left
                    if (offset < -_this._offsetWidth * 0.33) {
                        _this.hide();
                    } else {
                        _this.show();
                    }
                }
            }
        }

        // release animation
        _this._rafPending = false;
        _this._lastEvent = null;
    });
};

// =========================

function resizeWindow(mql) {
    if (mql.matches) {
        this.hammer.on('hammer.input', this._onTouchStart.bind(this));
        this.hammer.on('pan', this._onTouchMove.bind(this));
    } else {
        this.hammer.off('hammer.input');
        this.hammer.off('pan');
    }
}

export default Sidebar;
