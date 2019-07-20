import {observer} from "../../finalizing/observer";
import {FRAGMENT_TYPE} from "../vdom-diffing/vdom";
import {vdomRenderer} from "../../finalizing/Component";
import {htmlDiff} from "../vdom-diffing/htmlDiff";

/** @jsx createElement */

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


const noop = () => {
};


function templateRenderer() {

};


export class Derp extends HTMLElement {
    constructor() {
        super();
        this._raf = 0;
        this.props = {};
        this._unsubs = [];
        this.shadow = this.attachShadow({mode: 'open'});
        this.mounted = new Promise(mount => (this.mount = mount));
        // this._renderer = renderer.bind(this);

        this.update = () => {
            if (!this.process) this.process = this.mounted.then(this._render);
            return this.process;
        };
        this.update();
        this.rendered = false;
    }

    _renderer = () => {
        if(!this.rendered){
            this.root = (this.shadow || this);
            let tmpl = document.createElement('template');
            tmpl.innerHTML = this.render(this.pros, this.state);
            this.root.appendChild(tmpl.content.cloneNode(true));
            this.rendered = true;
            this.didMount && this.didMount()
        }else{
            htmlDiff(this.root.firstChild, this.render(this.props, this.state))
        }

    return 'asdf'
    }


    _render = () => {
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = requestAnimationFrame(() => {
            this._renderer();
            this._raf = 0;
            this.process = false;
        });
        this.didMount && this.didMount()
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
        });
    };

    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, {detail, bubbles: true, composed: true}));
    }

    watchObservables = (observables) => {
        if (Array.isArray(observables)) {
            observables.forEach(obs => this._unsubs.push(obs.$onChange(this.update)))
        } else this._unsubs.push(observables.$onChange(this.update))
    };

    connectedCallback() {
        if (this.state) this._unsubs.push(observer(this.state)(this.update));
        let observables = this.constructor.observe || this.observe;
        observables && this.watchObservables(observables);
        this.mount()
    }

    disconnectedCallback() {
        this.willUnmount && this.willUnmount();
        this._unsubs.forEach(fn => fn());
        console.log('disconnected')
    }
}


export const composeElementFactory = ({Extends, renderer, typeName}) => {


    const type = {};

    function createClass(component) {
        console.log('created class out of component', component)
        let C = class extends Derp {
        };
        if (typeof component === 'function') {
            C.prototype.render = component;
        }else{
            C.prototype.render = component.render;
            C.props = component.props;
            C.state = component.state;
            C.observe = component.observe;
        }
        return C;
    }

    return function (tagName, component) {
        customElements.define(tagName,
            component.prototype instanceof Derp
                ? component : createClass(component, tagName));
    }

};


// // https://github.com/Polymer/lit-element/blob/master/src/lit-element.ts
// if (this.hasUpdated && window.ShadyCSS !== undefined) {
//     window.ShadyCSS.styleElement(this);
// }
// _upgradeProperty(prop) {
//     if (this.hasOwnProperty(prop)) {
//         let value = this[prop];
//         delete this[prop];
//         this[prop] = value;
//     }
// }
