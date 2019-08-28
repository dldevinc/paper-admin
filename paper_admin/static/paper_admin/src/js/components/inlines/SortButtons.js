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
        this._swap(next, item);
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
        this._swap(item, prev);
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
 * Перемещение элемента elem1 перед elem2 и обмен значений сортировки в input-полях.
 * @param {HTMLElement} elem1
 * @param {HTMLElement} elem2
 * @private
 */
SortButtons.prototype._swap = function(elem1, elem2) {
    const rect1 = this._getPosition(elem1);
    const rect2 = this._getPosition(elem2);
    const style1 = window.getComputedStyle(elem1);
    const style2 = window.getComputedStyle(elem2);
    const cssText1 = elem1.style.cssText;
    const cssText2 = elem2.style.cssText;

    // замеситель 1
    const holder1 = document.createElement(elem1.tagName);
    holder1.classList.add('sortable-placeholder');
    holder1.style.marginTop = style1.marginTop;
    holder1.style.marginBottom = style1.marginBottom;
    holder1.style.width = rect1.width + 'px';
    holder1.style.height = rect1.height + 'px';

    // замеситель 2
    const holder2 = document.createElement(elem2.tagName);
    holder2.classList.add('sortable-placeholder');
    holder2.style.marginTop = style2.marginTop;
    holder2.style.marginBottom = style2.marginBottom;
    holder2.style.width = rect2.width + 'px';
    holder2.style.height = rect2.height + 'px';

    // swap
    elem1.after(elem2);

    if (elem1.tagName === 'TR') {
        const td = document.createElement('TD');
        td.colSpan = elem1.cells.length;
        holder1.appendChild(td);

        // freeze <td> width
        Array.from(elem1.children).forEach(function(child) {
            child.style.width = child.offsetWidth + 'px';
        });
    }

    if (elem2.tagName === 'TR') {
        const td = document.createElement('TD');
        td.colSpan = elem2.cells.length;
        holder2.appendChild(td);

        // freeze <td> width
        Array.from(elem2.children).forEach(function(child) {
            child.style.width = child.offsetWidth + 'px';
        });
    }

    elem1.before(holder2);
    elem1.style.position = 'absolute';
    elem1.style.left = rect1.left + 'px';
    elem1.style.top = rect1.top + 'px';
    elem1.style.width = rect1.width + 'px';
    elem1.style.height = rect1.height + 'px';

    elem2.before(holder1);
    elem2.style.position = 'absolute';
    elem2.style.left = rect2.left + 'px';
    elem2.style.top = rect2.top + 'px';
    elem2.style.width = rect2.width + 'px';
    elem2.style.height = rect2.height + 'px';

    // разница высот влияет на положение нижнего элемента
    const diff_y = rect1.height - rect2.height;
    this.disableItemButtons(elem1);
    this.disableItemButtons(elem2);

    const _this = this;
    const tl = new TimelineLite({
        onComplete: function() {
            elem1.style.cssText = cssText1;
            elem2.style.cssText = cssText2;

            Array.from(elem1.children).forEach(function(child) {
                child.style.width = '';
            });

            Array.from(elem2.children).forEach(function(child) {
                child.style.width = '';
            });

            holder1.remove();
            holder2.remove();
            _this.updateBounds();
        }
    });
    tl.to(elem1, this.opts.speed, {top: rect2.top});
    tl.to(elem2, this.opts.speed, {top: rect1.top + diff_y}, 0);

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
