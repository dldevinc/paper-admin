/**
 * Представление списка DOM-элементов в виде дерева.
 * Каждый DOM-элемент должен иметь data-атрибуты: id, parent.
 * Каждый дочерний узел должен идти после родителя.
 * @module ListTree
 */

/**
 * @typedef {Object} module:ListTree.ListTreeNode
 * @property {Number}       pk
 * @property {Number}       parent
 * @property {HTMLElement}  element
 * @property {Number[]}     childs
 */

/**
 * Конструктор объектов ListTree.
 * @param {NodeList|Element[]} elements
 * @constructor
 */
function ListTree(elements) {
    this._buildTree(elements);
}

/**
 * Создание узла дерева.
 * @param {HTMLElement} child
 * @returns {module:ListTree.ListTreeNode}
 * @private
 */
ListTree.prototype._createNode = function(child) {
    const dataset = child.dataset;
    return {
        pk: parseInt(dataset.id),
        parent: parseInt(dataset.parent),
        element: child,
        childs: []
    };
};

/**
 * Добавление узла дерева в карту, для быстрого поиска по ID.
 * @param {module:ListTree.ListTreeNode} node
 * @returns {Boolean}
 * @private
 */
ListTree.prototype._addNode = function(node) {
    if (node && (typeof node.pk === 'number')) {
        this._nodes[node.pk] = node;
        if (isNaN(node.parent)) {
            this._roots.push(node);
        }
        return true;
    }
    return false;
};

/**
 * Получение узла по ID.
 * @param {Number} pk
 * @returns {module:ListTree.ListTreeNode}
 */
ListTree.prototype.getNode = function(pk) {
    if (this._nodes === null) {
        throw new Error('tree is empty');
    }
    if (!(pk in this._nodes)) {
        throw new Error(`node ${pk} not found`);
    }
    return this._nodes[pk];
};

/**
 * Построение дерева из элементов.
 * @param {Element[]} elements
 * @private
 */
ListTree.prototype._buildTree = function(elements) {
    const stack = [];

    this._nodes = {};
    this._roots = [];
    elements.forEach(function(elem) {
        let node = this._createNode(elem);
        this._addNode(node);

        while (stack.length) {
            let stack_node = stack[0];
            if (node.parent === stack_node.pk) {
                stack_node.childs.push(node.pk);
                stack.unshift(node);
                return
            }
            stack.shift();
        }

        stack.unshift(node);
    }.bind(this));
};

/**
 * Получение корневых элементов.
 * @returns {Element[]}
 */
ListTree.prototype.getRoots = function() {
    if (this._roots === null) {
        throw new Error('tree is empty');
    }
    return this._roots.map(function(root_node) {
        return root_node.element
    }.bind(this));
};

/**
 * Получение всех потомков узла.
 * @param {Number} pk
 * @returns {Element[]}
 */
ListTree.prototype.getDescendants = function(pk) {
    const node = this.getNode(pk);
    return node.childs.reduce(function(result, child_pk) {
        let child_node = this.getNode(child_pk);
        if (child_node) {
            result.push(child_node.element);
            result = result.concat(this.getDescendants(child_pk));
        }
        return result
    }.bind(this), []);
};


export default ListTree;
