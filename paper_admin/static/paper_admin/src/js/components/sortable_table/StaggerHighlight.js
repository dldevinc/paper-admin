/**
 * Прелоадер для списков / таблиц.
 * Последовательно добавляет класс DOM-элементам и удаляет этот класс,
 * когда выполняется последнее событие из:
 * a) всем элементам был добавлен класс
 * b) вызван метод release()
 * @module StaggerHighlight
 */

/**
 * @typedef {Object} module:StaggerHighlight.StaggerHighlightOptions
 * @property {String} className
 * @property {Number} staggerMin
 * @property {Number} staggerMax
 */

/**
 * Конструктор объектов StaggerHighlight.
 * @param {Element[]} elements
 * @param {module:StaggerHighlight.StaggerHighlightOptions} [options]
 * @constructor
 */
function StaggerHighlight(elements, options) {
    /** @type module:StaggerHighlight.StaggerHighlightOptions */
    this.opts = Object.assign({
        className: 'highlight',
        staggerMin: 12,
        staggerMax: 50
    }, options);

    /**
     * @type {Element[]}
     * @private
     */
    this._elements = elements;

    /**
     * @type {Boolean}
     * @private
     */
    this._isReleased = false;

    /**
     * @type {?Number}
     * @private
     */
    this._timer = this._createTimer();
}

/**
 * Создание таймера, выделяюего элементы один за другим.
 * @returns {Number}
 * @private
 */
StaggerHighlight.prototype._createTimer = function() {
    let i = 0;
    const count = this._elements.length;
    const speed = Math.max(this.opts.staggerMin, this.staggerMax * 2 / count);
    return setInterval(function() {
        if (i < count) {
            this._elements[i].classList.add(this.opts.className);
            i++;
        } else {
            this._destroyTimer();
            if (this._isReleased) {
                this._removeClass();
            }
        }
    }.bind(this), speed);
};

/**
 * Уничтожение таймера.
 * @private
 */
StaggerHighlight.prototype._destroyTimer = function() {
    if (this._timer !== null) {
        clearInterval(this._timer);
        this._timer = null;
    }
};

/**
 * Немедленное удаление класса со всех элементов.
 * @private
 */
StaggerHighlight.prototype._removeClass = function() {
    this._elements.forEach(function(node) {
        node.classList.remove(this.opts.className);
    }.bind(this));
};

/**
 * Сигнал завершения операции.
 */
StaggerHighlight.prototype.release = function() {
    this._isReleased = true;
    if (this._timer === null) {
        this._removeClass();
    }
};


export default StaggerHighlight;
