import {isFunc, isObj} from "./utils";

/** @jsx createElement */
var RECYCLED_NODE = 1,
    TEXT_NODE = 3,
    EMPTY_OBJ = {},
    EMPTY_ARR = [],
    map = EMPTY_ARR.map,
    isArray = Array.isArray;
export const FRAGMENT_TYPE = '#document-fragment';

export const Fragment = (_, children) => {
    return createElement(FRAGMENT_TYPE, {}, children);
};

// function isCustomElement(el) {
//     if (!el.getAttribute || !el.localName) return false;
//     const isAttr = el.getAttribute('is');
//     return el.localName.includes('-') || isAttr && isAttr.includes('-');
// }

const cnObj = (obj, out) => {
    out = "";
    for (let k in obj) if (obj[k]) out += (out && " ") + k;
    return out;
};
const makeClassName = (value) => isObj(value) ? cnObj(value) : value;
const propsChanged = (a, b) => {
    for (var k in a) if (a[k] !== b[k]) return true;
    for (var k in b) if (a[k] !== b[k]) return true;
};
const merge = (a, b, out) => {
    out = {};
    for (var k in a) out[k] = a[k];
    for (var k in b) out[k] = b[k];
    return out
};
const listener = function (event) {
    this.handlers[event.type](event)
};
const patchProperty = (node, key, oldValue, newValue, isSvg) => {
    if (key === "key") {
    } else if (isFunc(newValue) && key.startsWith('on') && !(key in node)) {
        //reference stencil's set accessor in the vdom dir
        //cuz *custom events defined by the user inside webcomponents may also start with 'on' like onMyCustomEvent
        let eventType = (key.toLowerCase() in node)
            ? key.slice(2).toLowerCase()
            : key[2].toLowerCase() + key.substring(3);
        if (!((node.handlers || (node.handlers = {}))[(key = eventType)] = newValue))
            node.removeEventListener(key, listener);
        else if (!oldValue) node.addEventListener(key, listener);

    } else if (key === 'ref' && isFunc(newValue)) newValue(node);
    else if (key === 'className') node[key] = makeClassName(newValue) || "";
    else if (key === 'style' && isObj(newValue)) Object.assign(node.style, newValue);
    else if (!isSvg && key !== "list" && key in node) node[key] = newValue == null ? "" : newValue;
    else if (newValue == null || newValue === false) node.removeAttribute(key);
    else node.setAttribute(key, newValue);
};

const createNode = (vnode, isSvg) => {
    var node = vnode.type === TEXT_NODE
        ? document.createTextNode(vnode.name)
        : (isSvg = isSvg || vnode.name === "svg")
            ? document.createElementNS("http://www.w3.org/2000/svg", vnode.name)
            : vnode.name === '#document-fragment'
                ? document.createDocumentFragment()
                : document.createElement(vnode.name);
    var props = vnode.props;
    for (var k in props) patchProperty(node, k, null, props[k], isSvg);
    for (var i = 0, len = vnode.children.length; i < len; i++) {
        node.appendChild(createNode(vnode.children[i], isSvg))
    }
    return (vnode.node = node)
};

const getKey = (vnode) => vnode == null ? null : vnode.key;

const patchNode = (parent, node, oldVNode, newVNode, isSvg) => {
    if (oldVNode === newVNode) {
    } else if (
        oldVNode != null &&
        oldVNode.type === TEXT_NODE &&
        newVNode.type === TEXT_NODE
    ) {
        if (oldVNode.name !== newVNode.name) node.nodeValue = newVNode.name
    } else if (oldVNode == null || oldVNode.name !== newVNode.name) {
        node = parent.insertBefore(createNode(newVNode, isSvg), node);
        if (oldVNode != null) parent.removeChild(oldVNode.node)
    } else {
        var tmpVKid, oldVKid, oldKey, newKey,
            oldVProps = oldVNode.props,
            newVProps = newVNode.props,
            oldVKids = oldVNode.children,
            newVKids = newVNode.children,
            oldHead = 0, newHead = 0,
            oldTail = oldVKids.length - 1,
            newTail = newVKids.length - 1;

        isSvg = isSvg || newVNode.name === "svg";

        for (var i in merge(oldVProps, newVProps)) {
            let _old = oldVProps[i], _new = newVProps[i];
            if ((i === 'className' || i === 'style') && isObj(_old) && isObj(_new)) {
                if (propsChanged(_old, _new)) patchProperty(node, i, _old, _new, isSvg)
            } else if ((i === "value" || i === "selected" || i === "checked" ? node[i] : oldVProps[i]) !== newVProps[i]) {
                patchProperty(node, i, oldVProps[i], newVProps[i], isSvg)
            }
        }
        while (newHead <= newTail && oldHead <= oldTail) {
            if (
                (oldKey = getKey(oldVKids[oldHead])) == null ||
                oldKey !== getKey(newVKids[newHead])
            ) {
                break
            }

            patchNode(
                node,
                oldVKids[oldHead].node,
                oldVKids[oldHead++],
                newVKids[newHead++],
                isSvg
            )
        }
        while (newHead <= newTail && oldHead <= oldTail) {
            if ((oldKey = getKey(oldVKids[oldTail])) == null ||
                oldKey !== getKey(newVKids[newTail])
            ) {
                break
            }

            patchNode(
                node,
                oldVKids[oldTail].node,
                oldVKids[oldTail--],
                newVKids[newTail--],
                isSvg
            )
        }
        if (oldHead > oldTail) {
            while (newHead <= newTail) {
                node.insertBefore(
                    createNode(newVKids[newHead++], isSvg),
                    (oldVKid = oldVKids[oldHead]) && oldVKid.node
                )
            }
        } else if (newHead > newTail) {
            while (oldHead <= oldTail) {
                node.removeChild(oldVKids[oldHead++].node)
            }
        } else {
            for (var i = oldHead, keyed = {}, newKeyed = {}; i <= oldTail; i++) {
                if ((oldKey = oldVKids[i].key) != null) {
                    keyed[oldKey] = oldVKids[i]
                }
            }
            while (newHead <= newTail) {
                oldKey = getKey((oldVKid = oldVKids[oldHead]))
                newKey = getKey(newVKids[newHead])

                if (
                    newKeyed[oldKey] ||
                    (newKey != null && newKey === getKey(oldVKids[oldHead + 1]))
                ) {
                    if (oldKey == null) {
                        node.removeChild(oldVKid.node)
                    }
                    oldHead++
                    continue
                }
                if (newKey == null || oldVNode.type === RECYCLED_NODE) {
                    if (oldKey == null) {
                        patchNode(
                            node,
                            oldVKid && oldVKid.node,
                            oldVKid,
                            newVKids[newHead],
                            isSvg
                        )
                        newHead++
                    }
                    oldHead++
                } else {
                    if (oldKey === newKey) {
                        patchNode(node, oldVKid.node, oldVKid, newVKids[newHead], isSvg)
                        newKeyed[newKey] = true
                        oldHead++
                    } else {
                        if ((tmpVKid = keyed[newKey]) != null) {
                            patchNode(
                                node,
                                node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),
                                tmpVKid,
                                newVKids[newHead],
                                isSvg
                            )
                            newKeyed[newKey] = true
                        } else {
                            patchNode(
                                node,
                                oldVKid && oldVKid.node,
                                null,
                                newVKids[newHead],
                                isSvg
                            )
                        }
                    }
                    newHead++
                }
            }
            while (oldHead <= oldTail) {
                if (getKey((oldVKid = oldVKids[oldHead++])) == null) {
                    node.removeChild(oldVKid.node)
                }
            }
            for (var i in keyed) {
                if (newKeyed[i] == null) {
                    node.removeChild(keyed[i].node)
                }
            }
        }
    }
    return (newVNode.node = node)
};

const createVNode = function (name, props, children, node, key, type) {
    return {
        name: name,
        props: props,
        children: children,
        node: node,
        type: type,
        key: key
    }
};
const createTextVNode = function (value, node) {
    return createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, null, TEXT_NODE)
};
const recycleNode = function (node) {
    return node.nodeType === TEXT_NODE
        ? createTextVNode(node.nodeValue, node)
        : createVNode(
            node.nodeName.toLowerCase(),
            EMPTY_OBJ,
            map.call(node.childNodes, recycleNode),
            node,
            null,
            RECYCLED_NODE
        )
};
export var patch = (node, vdom) => (
    ((node = patchNode(
        node.parentNode,
        node,
        node.vdom || recycleNode(node),
        vdom
    )).vdom = vdom),
        node
);

export const createElement = function (name, props) {
    for (var vnode, rest = [], children = [], i = arguments.length; i-- > 2;) rest.push(arguments[i])
    while (rest.length > 0) {
        if (isArray((vnode = rest.pop()))) for (var i = vnode.length; i-- > 0;) rest.push(vnode[i]);
        else if (vnode === false || vnode === true || vnode == null) {
        } else children.push(typeof vnode === "object" ? vnode : createTextVNode(vnode))
    }
    props = props || EMPTY_OBJ;
    return typeof name === "function"
        ? name(props, children)
        : createVNode(name, props, children, null, props.key)
};

export default createElement;
