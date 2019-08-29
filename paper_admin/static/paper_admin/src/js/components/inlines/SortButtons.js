/**
 * Сортировка DOM-элементов с помощью кнопок.
 * @module SortButtons
 */

/**
 * @typedef {Object} module:SortButtons.SortButtonsOptions
 * @property {Number}    speed
 * @property {String}    [items]
 * @property {String}    [moveUpBtn]
 * @property {String}    [moveDownBtn]
 * @property {String}    [disabledClass]
 * @property {?String}   [ignore]
 * @property {?Function} [onChange]
 */

import {TimelineLite} from "gsap";

/**
 * Конструктор объектов SortButtons.
 * @param {Element} root
 * @param {module:SortButtons.SortButtonsOptions} [options]
 * @constructor
 */
function SortButtons(root, options) {
    /** @type module:SortButtons.SortButtonsOptions */
    this.opts = Object.assign({
        speed: 1,
        items: '.item',
        moveUpBtn: '.move-up',
        moveDownBtn: '.move-down',
        disabledClass: 'disabled',
        ignore: null,
        onChange: null
    }, options);

    /** @type {Element} */
    this.root = root;

    root.addEventListener('click', this._onClick.bind(this));
    root.addEventListener('update:sortbuttons', this.updateBounds.bind(this));
    this.updateBounds();
}

/**
 * Обработчик события клика в пределах корневого элемента.
 * @param {MouseEvent} event
 * @private
 */
SortButtons.prototype._onClick = function(event) {
    const target = event.target;

    const moveUpButton = target.closest(this.opts.moveUpBtn);
    if (moveUpButton && this.root.contains(moveUpButton)) {
        if (moveUpButton.classList.contains(this.opts.disabledClass)) {
            return
        }

        const item = moveUpButton.closest(this.opts.items);
        if (item) {
            event.preventDefault();
            event.stopPropagation();
            this.moveUp(item);
        }
        return
    }

    const moveDownButton = target.closest(this.opts.moveDownBtn);
    if (moveDownButton && this.root.contains(moveDownButton)) {
        if (moveDownButton.classList.contains(this.opts.disabledClass)) {
            return
        }

        const item = moveDownButton.closest(this.opts.items);
        if (item) {
            event.preventDefault();
            event.stopPropagation();
            this.moveDown(item);
        }
    }
};

/**
 * Поиск ближайшего элемента, начиная с elem и ниже.
 * @param {Element} elem
 * @returns {Element}
 * @private
 */
SortButtons.prototype._findNextSince = function(elem) {
    while (elem && (!elem.matches(this.opts.items) || (this.opts.ignore && elem.matches(this.opts.ignore)))) {
        elem = elem.nextElementSibling;
    }
    return elem;
};

/**
 * Перемещение элемента вниз.
 * @param {Element} item
 */
SortButtons.prototype.moveDown = function(item) {
    const next = this._findNextSince(item.nextElementSibling);
    if (next) {
        this._swap(item, next);
    }
};

/**
 * Поиск ближайшего элемента, начиная с elem и выше.
 * @param {Element} elem
 * @returns {Element}
 * @private
 */
SortButtons.prototype._findPreviousSince = function(elem) {
    while (elem && (!elem.matches(this.opts.items) || (this.opts.ignore && elem.matches(this.opts.ignore)))) {
        elem = elem.previousElementSibling;
    }
    return elem;
};

/**
 * Перемещение элемента наверх.
 * @param {Element} item
 */
SortButtons.prototype.moveUp = function(item) {
    const prev = this._findPreviousSince(item.previousElementSibling);
    if (prev) {
        this._swap(prev, item, true);
    }
};

/**
 * Получение размера и положения элемента относительно ближайшего
 * элемента, чей position не равен static.
 * @param elem
 * @returns {{top: Number, left: Number, width: Number, height: Number}}
 * @private
 */
SortButtons.prototype._getPosition = function(elem) {
    const elemRect = elem.getBoundingClientRect();
    const elemStyles = window.getComputedStyle(elem);

    let offsetParent = elem.offsetParent || document.documentElement;
    const parentStyles = window.getComputedStyle(offsetParent);

    return {
        top: elem.offsetTop - parseInt(parentStyles.borderTopWidth) - parseInt(elemStyles.marginTop),
        left: elem.offsetLeft - parseInt(parentStyles.borderLeftWidth) - parseInt(elemStyles.marginLeft),
        width: elemRect.width,
        height: elemRect.height,
    }
};

/**
 * Меняет местами два соседних элемента elem1 и elem2 с анимацией.
 * @param {Element} elem1
 * @param {Element} elem2
 * @param {boolean} highlightSecond
 * @private
 */
SortButtons.prototype._swap = function(elem1, elem2, highlightSecond=false) {
    //   Initial state:
    //
    //  |-------------|
    //  |    elem1    |
    //  |             |
    //  |-------------|
    //
    //  |-------------|
    //  |    elem2    |
    //  |-------------|
    //

    const rect1 = this._getPosition(elem1);
    const rect2 = this._getPosition(elem2);
    const initialCSSText1 = elem1.style.cssText;
    const initialCSSText2 = elem2.style.cssText;

    this.disableItemButtons(elem1);
    this.disableItemButtons(elem2);
    elem2.after(elem1);

    // имитация начального расположения
    const spaceY = rect2.top - rect1.top - rect1.height;
    elem1.style.transform = `translate3d(0, ${-rect2.height - spaceY}px, ${highlightSecond ? 0 : 1}px)`;
    elem2.style.transform = `translate3d(0, ${rect2.top - rect1.top}px, ${highlightSecond ? 1 : 0}px)`;

    new TimelineLite({
        onComplete: function() {
            elem1.style.cssText = initialCSSText1;
            elem2.style.cssText = initialCSSText2;
            this.updateBounds();
        }.bind(this)
    })
    .to(elem1, this.opts.speed, {y: 0, clearProps: 'all'})
    .to(elem2, this.opts.speed, {y: 0, clearProps: 'all'}, 0);

    // callback
    if (typeof this.opts.onChange === 'function') {
        this.opts.onChange.call(this, elem1, elem2);
    }
};

/**
 * Отключение кнопок сортировки.
 * @param {Element} item
 */
SortButtons.prototype.disableItemButtons = function(item) {
    const upBtn = item.querySelector(this.opts.moveUpBtn);
    const downBtn = item.querySelector(this.opts.moveDownBtn);
    upBtn.classList.add(this.opts.disabledClass);
    downBtn.classList.add(this.opts.disabledClass);
};

/**
 * Отключение у граничных элементов кнопок, которые не имеют смысла.
 */
SortButtons.prototype.updateBounds = function() {
    const items = this.root.querySelectorAll(this.opts.items);
    if (!items.length) {
        return
    }

    items.forEach(function(item) {
        const upBtn = item.querySelector(this.opts.moveUpBtn);
        const downBtn = item.querySelector(this.opts.moveDownBtn);
        upBtn.classList.remove(this.opts.disabledClass);
        downBtn.classList.remove(this.opts.disabledClass);
    }.bind(this));

    const firstItem = this._findNextSince(items[0]);
    if (firstItem) {
        const firstItemBtn = firstItem.querySelector(this.opts.moveUpBtn);
        if (firstItemBtn) {
            firstItemBtn.classList.add(this.opts.disabledClass);
        }
    }

    const lastItem = this._findPreviousSince(items[items.length - 1]);
    if (lastItem) {
        const lastItemBtn = lastItem.querySelector(this.opts.moveDownBtn);
        if (lastItemBtn) {
            lastItemBtn.classList.add(this.opts.disabledClass);
        }
    }
};


export default SortButtons;
