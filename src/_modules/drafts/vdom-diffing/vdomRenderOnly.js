import {isFunc, isNum, isObj, isString} from "../../finalizing/utils";
import {FRAGMENT_TYPE} from "./vdom2.2";

let d = document,
    handlers = '__iosioHandlers',
    trackKey = '__iosioKey';


const makeClassName = (value) => isObj(value) ? cnObj(value) : value;
const setAttribute = (dom, key, value) => {
    if (isFunc(value) && key.startsWith('on') && !(key in dom)) {
        let eventType;
        dom[handlers] = dom[handlers] || {};
        // reference stencils set accessor
        //*cuz custom web component events defined by the user may also start with on
        eventType = (key.toLowerCase() in dom)
            ? key.slice(2).toLowerCase()
            : key[2].toLowerCase() + key.substring(3);
        dom.removeEventListener(eventType, dom[handlers][eventType]);
        dom[handlers][eventType] = value;
        dom.addEventListener(eventType, dom[handlers][eventType]);
    }
    else if (['checked', 'value'].includes(key)) dom[key] = value;
    else if (key === 'className') dom[key] = makeClassName(value)
    else if (key === 'style' && isObj(value)) Object.assign(dom.style, value);
    else if (key === 'ref' && isFunc(value)) value(dom);
    else if (key === 'key') dom[trackKey] = value;
    else if (!isObj(value) && !isFunc(value)) dom.setAttribute(key, value);
};

const assignProps = (vdom) => ({...vdom.props, children: vdom.children});
const cat = (arr) => [].concat(...arr);

export function render(vdom, parent) {
    const mount = (el) => parent ? parent.appendChild(el) : el;
    if (isString(vdom) || isNum(vdom)) return mount(d.createTextNode(vdom));
    if (typeof vdom == 'boolean' || vdom === null) return mount(d.createTextNode(''));
    if (isObj(vdom) && isFunc(vdom.type)) return render(vdom.type(assignProps(vdom)), parent);
    let dom, elem = vdom.type === FRAGMENT_TYPE ? d.createDocumentFragment() : d.createElement(vdom.type);
    dom = mount(elem);
    cat(vdom.children).forEach((vChild) => dom.appendChild(render(vChild)));
    if (dom.setAttribute) for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
    if (vdom.type === FRAGMENT_TYPE) mount(dom);
    return dom;
}

// constructor() {
//     super();
//     this.handleClick = this.handleClick.bind(this);
// ...
//     const internalRootEl = shadowRootEl.getElementById('root');
//     this.flowerEl = shadowRootEl.getElementById('root__flower');
//     this.blockEls = internalRootEl.getElementsByClassName('block');
//     for (let i = 0; i < this.blockEls.length; i += 1) {
//         const blockEl = this.blockEls[i];
//         blockEl.addEventListener('click', this.handleClick);
//     }
// }
// disconnectedCallback() {
//     for (let i = 0; i < this.blockEls.length; i += 1) {
//         const blockEl = this.blockEls[i];
//         blockEl.removeEventListener('click', this.handleClick);
//     }
// }
// handleClick(e) {
//     this.flowerEl.innerHTML = e.target.dataset.flower;
// }