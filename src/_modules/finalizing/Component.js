import {observer} from "./observer";
import {createElement, patch} from "./vdom";
import {FRAGMENT_TYPE} from "./vdom";

/** @jsx createElement */

/*
customElements.whenDefined('app-drawer').then(() => {
console.log('ready!');
});
 */
let IGNORE_ATTR = Symbol(),
    formatType = (value, type = String) => {
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
    },
    setAttr = (node, attr, value) => {
        if (value == null) node.removeAttribute(attr);
        else node.setAttribute(attr, typeof value == "object" ? JSON.stringify(value) : value);
    },
    propToAttr = (prop) => prop.replace(/([A-Z])/g, "-$1").toLowerCase(),
    attrToProp = (attr) => attr.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());

/*
    props example

    static props = {
        ['box-color']: String,
        size: Number,
        isBig: {
            type: String,
            reflect: true,
            value: true
        }
    };


 */

export class Component extends HTMLElement {
    constructor() {
        super();
        this._raf = 0;
        this.props = {};
        this._unsubs = [];
        this.shadow = this.attachShadow({mode: 'open'});
        this.mounted = new Promise(mount => (this.mount = mount));
        if (this.render) this.render = this.render.bind(this);
        this.update = () => {
            if (!this.proc) this.proc = this.mounted.then(this._performRender);
            return this.proc;
        };
        this.update();
    }

    _performRender = () => {
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = requestAnimationFrame(() => {
            if (!this.render) return;
            if (!this._base) {
                this.root = (this.shadow || this);
                const rendered = this.render({props:this.props, state:this.state});
                this.hostFrag = rendered.name === FRAGMENT_TYPE;
                this.root.appendChild(document.createElement('div'));
                this._base = patch(this.root.firstChild, rendered);
                this.didMount && this.didMount()
            } else {
                patch(
                    this.hostFrag ? this.root : this._base,
                    this.render({props:this.props, state:this.state})
                );
                this.didUpdate && this.didUpdate();
            }
            this._raf = 0;
            this.proc = false;
        });
    };

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
                        if (error && value != null)
                            throw `observable [${prop}] must be type [${schema.type.name}]`;
                        if (value == this.props[attr]) return;
                        if (schema.reflect) {// the default properties are only reflected once the web-component is mounted
                            this.mounted.then(() => {
                                this[IGNORE_ATTR] = attr; //update is prevented
                                setAttr(this,
                                    attr,
                                    schema.type == Boolean && !value
                                        ? null : value
                                );
                                this[IGNORE_ATTR] = false; // an upcoming update is allowed
                            });
                        }
                        this.props[attr] = value;
                        this.update();
                    }
                });
            }
        });
    };

    //
    // emit(name, detail, from) {
    //     from = from || window;
    //     from.dispatchEvent(new CustomEvent(name, {detail, bubbles: true, composed: true}));
    // }

    watchObservables = (observables) => {
        if (Array.isArray(observables)) {
            observables.forEach(obs => this._unsubs.push(obs.$onChange(this.update)))
        } else this._unsubs.push(observables.$onChange(this.update))
    };

    connectedCallback() {
        //if a class is used, and state is defined as a class member, then it can be retrieved from the constructor
        //else if an object is passed in the second argument of element('tag-name',{}), then just this.state
        this.state = this.constructor.state || this.state;
        this.state && this._unsubs.push(observer(this.state)(this.update));
        let observables = this.constructor.observe || this.observe;
        observables && this.watchObservables(observables);
        this.mount();
    }

    disconnectedCallback() {
        this.willUnmount && this.willUnmount();
        this._unsubs.forEach(fn => fn());
    }
}


export function createClass(component, tagname) {
    let C = class extends Component {
    };
    if (typeof component === 'function') {
        C.prototype.render = component;
    } else {
        C.prototype.render = component.render;
        C.props = component.props;
        C.state = component.state;
        C.observe = component.observe;
    }
    return C;
}

export function element(tagName, component) {
    customElements.define(tagName,
        component.prototype instanceof Component
            ? component : createClass(component, tagName));
    return ({props, children}) => createElement(tagName, props, ...children);
}

/*
class TestElement extends HTMLElement {
    constructor(obj) {
        super();
        obj && Object.assign(this, obj);
    }
}

 */
// _upgradeProperty(prop) {
//     if (this.hasOwnProperty(prop)) {
//         let value = this[prop];
//         delete this[prop];
//         this[prop] = value;
//     }
// }
// // https://github.com/Polymer/lit-element/blob/master/src/lit-element.ts
// if (this.hasUpdated && window.ShadyCSS !== undefined) {
//     window.ShadyCSS.styleElement(this);
// }