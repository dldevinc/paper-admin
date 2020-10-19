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
import {gsap, TimelineLite} from "gsap";
import {ScrollToPlugin} from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);


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
        scrollWindow: true,
        scrollMargin: {
            top: 300,
            bottom: 350
        },
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
 * Поиск ближайшего перемещаемого элемента справа, начиная с element.
 * @param {Element} element
 * @returns {Element}
 * @private
 */
SortButtons.prototype._findNextItem = function(element) {
    let nextItem = element;
    while (nextItem) {
        if (this.opts.ignore && nextItem.matches(this.opts.ignore)) {
            nextItem = nextItem.nextElementSibling;
        } else if (!nextItem.matches(this.opts.items)) {
            nextItem = nextItem.nextElementSibling;
        } else {
            break
        }
    }
    return nextItem;
};

/**
 * Поиск ближайшего перемещаемого элемента слева, начиная с element.
 * @param {Element} element
 * @returns {Element}
 * @private
 */
SortButtons.prototype._findPreviousItem = function(element) {
    let prevItem = element;
    while (prevItem) {
        if (this.opts.ignore && prevItem.matches(this.opts.ignore)) {
            prevItem = prevItem.previousElementSibling;
        } else if (!prevItem.matches(this.opts.items)) {
            prevItem = prevItem.previousElementSibling;
        } else {
            break
        }
    }
    return prevItem;
};

/**
 * Перемещение элемента вниз.
 * @param {Element} item
 */
SortButtons.prototype.moveDown = function(item) {
    const nextItem = this._findNextItem(item.nextElementSibling);
    if (nextItem) {
        this._swap(item, nextItem);
    }
};

/**
 * Перемещение элемента наверх.
 * @param {Element} item
 */
SortButtons.prototype.moveUp = function(item) {
    const prevItem = this._findPreviousItem(item.previousElementSibling);
    if (prevItem) {
        this._swap(prevItem, item, true);
    }
};

/**
 * Меняет местами два соседних элемента elem1 и elem2 с анимацией.
 * @param {Element} elem1
 * @param {Element} elem2
 * @param {boolean} reversed - True, если elem2 считается активным
 * @private
 */
SortButtons.prototype._swap = function(elem1, elem2, reversed=false) {
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

    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();
    const initialCSSText1 = elem1.style.cssText;
    const initialCSSText2 = elem2.style.cssText;

    this.disableItemButtons(elem1);
    this.disableItemButtons(elem2);
    elem2.after(elem1);

    // имитация начального расположения
    const spaceY = rect2.top - rect1.top - rect1.height;
    elem1.style.transform = `translate3d(0, ${-rect2.height - spaceY}px, ${reversed ? 0 : 1}px)`;
    elem2.style.transform = `translate3d(0, ${rect2.top - rect1.top}px, ${reversed ? 1 : 0}px)`;

    const tl = new TimelineLite({
        onComplete: function() {
            elem1.style.cssText = initialCSSText1;
            elem2.style.cssText = initialCSSText2;
            this.updateBounds();
        }.bind(this)
    })
    .to(elem1, {duration: this.opts.speed, y: 0, clearProps: 'all'})
    .to(elem2, {duration: this.opts.speed, y: 0, clearProps: 'all'}, 0);

    if (this.opts.scrollWindow) {
        const pageYOffset = window.pageYOffset || document.documentElement.scrollTop;
        const newYOffset = pageYOffset + (reversed ? rect1.top - rect2.top : rect2.top - rect1.top);
        const topBound = this.opts.scrollMargin.top;
        const bottomBound = window.innerHeight - this.opts.scrollMargin.bottom;

        let needScrollWindow = true;
        if (reversed) {
            needScrollWindow &= !((rect1.top > bottomBound) && (rect2.top > bottomBound));
        } else {
            needScrollWindow &= !((rect1.top < topBound) && (rect2.top < topBound));
        }

        if (needScrollWindow) {
            tl.to(window, {
                duration: this.opts.speed,
                scrollTo: {
                    y: Math.max(0, newYOffset)
                }
            }, 0)
        }
    }

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

    const firstItem = this._findNextItem(items[0]);
    if (firstItem) {
        const firstItemBtn = firstItem.querySelector(this.opts.moveUpBtn);
        if (firstItemBtn) {
            firstItemBtn.classList.add(this.opts.disabledClass);
        }
    }

    const lastItem = this._findPreviousItem(items[items.length - 1]);
    if (lastItem) {
        const lastItemBtn = lastItem.querySelector(this.opts.moveDownBtn);
        if (lastItemBtn) {
            lastItemBtn.classList.add(this.opts.disabledClass);
        }
    }
};


export default SortButtons;
