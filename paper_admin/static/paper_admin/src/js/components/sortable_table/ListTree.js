/**
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
 * Представление списка DOM-элементов в виде дерева.
 * Каждый DOM-элемент должен иметь data-атрибуты "id" и "parent".
 * Каждый дочерний узел должен идти после родителя.
 */
export default class ListTree {
    /**
     * @param {NodeList|Element[]} elements
     */
    constructor(elements) {
        this._buildTree(elements);
    }

    /**
     * Создание структуры узла дерева.
     * @param {HTMLElement} child
     * @returns {module:ListTree.ListTreeNode}
     * @private
     */
    _createNode(child) {
        const dataset = child.dataset;
        return {
            pk: parseInt(dataset.id),
            parent: parseInt(dataset.parent),
            element: child,
            childs: []
        };
    }

    /**
     * Добавление узла дерева в карту, для быстрого поиска по ID.
     * @param {module:ListTree.ListTreeNode} node
     * @private
     */
    _addNode(node) {
        if (node && typeof node.pk === "number") {
            this._nodes[node.pk] = node;
            if (isNaN(node.parent)) {
                this._roots.push(node);
            }
        }
    }

    /**
     * Построение дерева из DOM-элементов.
     * @param {NodeList|Element[]} elements
     * @private
     */
    _buildTree(elements) {
        const stack = [];

        this._nodes = {};
        this._roots = [];
        elements.forEach(elem => {
            const node = this._createNode(elem);
            this._addNode(node);

            while (stack.length) {
                const stackNode = stack[0];
                if (node.parent === stackNode.pk) {
                    stackNode.childs.push(node.pk);
                    stack.unshift(node);
                    return;
                }
                stack.shift();
            }

            stack.unshift(node);
        });
    }

    /**
     * Получение узла по ID.
     * @param {Number} pk
     * @returns {module:ListTree.ListTreeNode}
     */
    getNode(pk) {
        if (!(pk in this._nodes)) {
            throw new Error(`node ${pk} not found`);
        }

        return this._nodes[pk];
    }

    /**
     * Получение корневых элементов.
     * @returns {Element[]}
     */
    getRoots() {
        return this._roots.map(rootNode => {
            return rootNode.element;
        });
    }

    /**
     * Получение всех потомков узла.
     * @param {Number} pk
     * @returns {Element[]}
     */
    getDescendants(pk) {
        const node = this.getNode(pk);
        return node.childs.reduce((result, childId) => {
            const childNode = this.getNode(childId);
            if (childNode) {
                result.push(childNode.element);
                result = result.concat(this.getDescendants(childId));
            }
            return result;
        }, []);
    }
}
