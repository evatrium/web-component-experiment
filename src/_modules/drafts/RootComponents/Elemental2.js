// import {observer} from "./observer";
// import {createElement, patch} from "./iosio";
//
// import {htmlDiff} from "./htmlDiff";
//
// /** @jsx createElement */
//
//
// // const Host = ({children}) => <Fragment>{children}</Fragment>;
//
// export class Elemental2 extends HTMLElement {
//     constructor() {
//         super();
//         // this.shadow = this.attachShadow({mode: 'open'});
//         this._raf = 0;
//     }
//
//     _onStateChange = (data) => {
//         if (this._raf) cancelAnimationFrame(this._raf);
//         this._raf = requestAnimationFrame(() => {
//             this._update();
//             this.onStateChange(data);
//         });
//         this._raf = 0;
//     };
//
//
//     _update = () => {
//         if (!this.render) return;
//         const root = (this.shadow || this);
//         root.appendChild(document.createElement('div'));
//         htmlDiff(root.firstChild, this.render());
//
//         this.didUpdate();
//     };
//
//     // static get observedAttributes() {
//     //     let observables = this.observables || {},
//     //         attributes = [],
//     //         proxy = (name, attr, type) => {
//     //             Object.defineProperty(this.prototype, name, {
//     //                 set(value) {
//     //                     // the attributes of the Boolean type will always be reflected in Element
//     //                     if (type === Boolean) {
//     //                         let state = this.hasAttribute(attr);
//     //                         if ((value && state) || (!value && !state)) return;
//     //                         this[value ? "setAttribute" : "removeAttribute"](attr, "");
//     //                     } else {
//     //                         this.setProperty(name, value);
//     //                     }
//     //                 },
//     //                 get() {
//     //                     return this.props[name];
//     //                 }
//     //             });
//     //         };
//     //
//     //     for (let key in observables) {
//     //         let attr = key.replace(/([A-Z])/g, "-$1").toLowerCase();
//     //         attributes.push(attr);
//     //         if (!(name in this.prototype)) proxy(key, attr, observables[key]);
//     //     }
//     //     console.log('get observed attrs', attributes);
//     //     return attributes;
//     // }
//
//     update(asdf) {
//         console.log('update', asdf)
//     }
//
//     // setProperty(name, value) {
//     //     name = name.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
//     //
//     //     let { observables } = this.constructor,
//     //         error,
//     //         type = observables[name];
//     //     try {
//     //         if (typeof value == "string") {
//     //             switch (type) {
//     //                 case Boolean:
//     //                     value = parse(value || "true") == true;
//     //                     break;
//     //                 case Number:
//     //                     value = Number(value);
//     //                     break;
//     //                 case Object:
//     //                 case Array:
//     //                     value = parse(value);
//     //                     break;
//     //                 case Function:
//     //                     value = window[value];
//     //                     break;
//     //             }
//     //         }
//     //     } catch (e) {
//     //         error = true;
//     //     }
//     //     if (
//     //         (!error && {}.toString.call(value) == `[object ${type.name}]`) ||
//     //         value == null
//     //     ) {
//     //         if (this.props[name] !== value) this.update({ [name]: value });
//     //     } else {
//     //         throw `the observable [${name}] must be of the type [${type.name}]`;
//     //     }
//     // }
//
//     _initState = () => {
//         //
//     };
//
//     connectedCallback() {
//
//         const {state} = this.constructor;
//         if (state) this._unObserve = observer(state)(this._onStateChange);
//         this._update();
//         this.didMount();
//         // // https://github.com/Polymer/lit-element/blob/master/src/lit-element.ts
//         // if (this.hasUpdated && window.ShadyCSS !== undefined) {
//         //     window.ShadyCSS.styleElement(this);
//         // }
//     }
//
//     disconnectedCallback() {
//         this.willUnmount();
//         this._unsub  && this._unsub();
//         console.log('unmounted')
//     }
//
//     didUpdate(prevProps, prevState) {
//     }
//
//     onStateChange() {
//     }
//
//     didMount() {
//     }
//
//     willUnmount() {
//     }
//
// }
//
//
// export function createClass(component) {
//     let CustomElement = class extends Elemental2 {
//     };
//     CustomElement.prototype.render = component.render;
//     CustomElement.observables = component.observables;
//     CustomElement.observables = component.observables;
//     CustomElement.state = component.state;
//     CustomElement.styles = component.styles;
//     return CustomElement;
// }
//
// /**
//  * register the component, be it a class or function
//  * @param {string} tagName
//  * @param {Function} component
//  * @return {Object} returns a jsx component
//  */
// export function element2(tagName, component) {
//     customElements.define(tagName,
//         component.prototype instanceof Elemental2
//             ? component
//             : createClass(component, tagName));
// }
//
//
//
