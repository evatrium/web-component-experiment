import {observer} from "../../finalizing/observer";
import {createElement, patch} from "../../finalizing/vdom";

/*
customElements.whenDefined('app-drawer').then(() => {
console.log('ready!');
});
 */
export const IGNORE_ATTR = Symbol();
export const PROPS = Symbol();

function formatType(value, type = String) {
    try {
        if (type == Boolean) value = [true, 1, "", "1", "true"].includes(value);
        else if (typeof value == "string") {
            value = type == Number ? Number(value)
                : type == Object || type == Array ? JSON.parse(value)
                    : type == Function ? window[value] : value;
        }
        if ({}.toString.call(value) == `[object ${type.name}]`)
            return {value, error: type == Number && Number.isNaN(value)};
    } catch (e) {
    }
    return {value, error: true};
}

export const setAttr = (node, attr, value) => {
    if (value == null) node.removeAttribute(attr);
    else node.setAttribute(attr, typeof value == "object" ? JSON.stringify(value) : value);
};
export const propToAttr = (prop) => prop.replace(/([A-Z])/g, "-$1").toLowerCase();
export const attrToProp = (attr) => attr.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());

export class Elemental extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this._raf = 0;
        this.mounted = new Promise(mount => (this.mount = mount));
        this.props = {};
        this.update = () => {
            if (!this.process) {
                this.process = this.mounted.then(() => {
                    if (this._runRenderer) {
                        if (this._raf) cancelAnimationFrame(this._raf);
                        this._raf = requestAnimationFrame(() => {
                            this._runRenderer();
                            this._raf = 0;
                        });
                    }
                    this.process = false;
                });
            }
            return this.process;
        };
        this.update();
    }

    attributeChangedCallback(name, oldValue, value) {
        if (oldValue == value) return;
        this[attrToProp(name)] = value;
    }

    static get observedAttributes() {
        let {props, prototype} = this;
        if (!props) return [];
        return Object.keys(props).map(prop => {
            let attr = propToAttr(prop);
            let schema = props[prop].name ? {type: props[prop]} : props[prop];
            if (!(prop in prototype)) {
                Object.defineProperty(prototype, prop, {
                    get: () => this.props[attr],
                    set(nextValue) {
                        let {value, error} = formatType(nextValue, schema.type);
                        if (error && value != null) throw `observable [${prop}] must be type [${schema.type.name}]`;
                        if (value == this.props[attr]) return;
                        if (schema.reflect) {// the default properties are only reflected once the web-component is mounted
                            this.mounted.then(() => {
                                this[IGNORE_ATTR] = attr; //update is prevented
                                setAttr(this, attr, schema.type == Boolean && !value ? null : value);
                                this[IGNORE_ATTR] = false; // an upcoming update is allowed
                            });
                        }
                        this.props[attr] = value;
                        this.update();
                    }
                });
            }
        })
    }

    connectedCallback() {
        this.mount();
        this.didMount && this.didMount()
        // // https://github.com/Polymer/lit-element/blob/master/src/lit-element.ts
        // if (this.hasUpdated && window.ShadyCSS !== undefined) {
        //     window.ShadyCSS.styleElement(this);
        // }
    }

    disconnectedCallback() {
        this.willUnmount && this.willUnmount();
        console.log('disconnected')
    }
}

export function createClass(component) {
    let C = class extends Component {
    };
    C.prototype.render = component.render;
    C.props = component.props;
    C.state = component.state;
    C.observe = component.observe;
    return C;
}

export function element(tagName, component) {
    customElements.define(tagName,
        component.prototype instanceof Component
            ? component : createClass(component, tagName));
    return ({props, children}) => createElement(tagName, props, ...children);
}


// _upgradeProperty(prop) {
//     if (this.hasOwnProperty(prop)) {
//         let value = this[prop];
//         delete this[prop];
//         this[prop] = value;
//     }
// }
