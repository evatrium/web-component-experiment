/** @jsx createElement */
import {createElement} from '../../finalizing/vdom';
import {isArray, isObj, isFunc, isString, isNum} from "../../finalizing/utils";

let d = document,
    handlers = '__iosioHandlers',
    trackKey = '__iosioKey';
export const FRAGMENT_TYPE = '#document-fragment';


export const Fragment = ({children}) => createElement(FRAGMENT_TYPE, {}, ...children);
var merge = function (a, b, out) {
    out = {};
    for (let k in a) out[k] = a[k];
    for (let k in b) out[k] = b[k];
    return out
};

// Check for <super-button> and <button is="super-button">.
function isCustomElement(el) {
    if (!el.getAttribute || !el.localName) return false;
    const isAttr = el.getAttribute('is');
    return el.localName.includes('-') || isAttr && isAttr.includes('-');
}

const cnObj = (obj, out) => {
    out = "";
    for (const k in obj) if (obj[k]) out += (out && " ") + k;
    return out;
};
const makeClassName = (value) => isObj(value) ? cnObj(value) : value;
const parseClassList = (value) => (!value) ? [] : value.split(' ');

const setAttribute = (dom, key, value) => {
    if (isFunc(value) && key.startsWith('on') && !(key in dom)) {
        let eventType;
        dom[handlers] = dom[handlers] || {};
        // reference stencils set accessor
        //*cuz custom events defined by the user may also start with on
        eventType = (key.toLowerCase() in dom)
            ? key.slice(2).toLowerCase()
            : key[2].toLowerCase() + key.substring(3);
        dom.removeEventListener(eventType, dom[handlers][eventType]);
        dom[handlers][eventType] = value;
        dom.addEventListener(eventType, dom[handlers][eventType]);
    } else if (key === 'inputValue') dom.value = value;
    else if (['checked', 'value'].includes(key) && !isCustomElement(dom)) dom[key] = value;
    else if (key === 'className') dom[key] = makeClassName(value)
    else if (key === 'style' && isObj(value)) Object.assign(dom.style, value);
    else if (key === 'ref' && isFunc(value)) value(dom);
    else if (key === 'key') dom[trackKey] = value;
    else if (!isObj(value) && !isFunc(value)) dom.setAttribute(key, value);
};

const assignProps = (vdom) => ({...vdom.props, children: vdom.children});
const cat = (arr) => [].concat(...arr);

export const render = (vdom, parent) => {
    parent = parent || null;
    const append = (el)=>{
        console.log('appending in render');
        return parent.appendChild(el)
    };
    const noAppend = (el)=>{
        console.log('no append in render')
        return el;
    };
    const mount = parent ? append : noAppend;
    if (isString(vdom) || isNum(vdom)){
        console.log('mountng a text node', vdom)
        return mount(d.createTextNode(vdom));
    }
    if (typeof vdom == 'boolean' || vdom === null){
        console.log('mounting a text node', vdom)
        return mount(d.createTextNode(''));
    }
    if (isObj(vdom) && isFunc(vdom.type)){
        console.log('rendering a vdom function')
        return render(vdom.type(assignProps(vdom)), parent);
    }
    if (isObj(vdom) && isString(vdom.type)) {
        console.log('rendering vdom of type obj and vdom.type is string')
        let elem = vdom.type === FRAGMENT_TYPE ? d.createDocumentFragment() : d.createElement(vdom.type),
            dom = mount(elem);
        console.log('rendering all the children for', vdom)
        for (const child of cat(vdom.children)) render(child, dom);
        if (dom.setAttribute) for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
        if (vdom.type === FRAGMENT_TYPE) return mount(dom);
        return dom;
    } else {
        console.error(vdom);
        throw new Error(`Invalid VDOM: ${vdom}.`);
    }
};

var propsChanged = function (a, b) {
    for (var k in a) if (a[k] !== b[k]) return true;
    for (var k in b) if (a[k] !== b[k]) return true;
};

function parseCSSText(cssText) {
    var cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " "),
        style = {}, [__, _, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
    var cssToJs = s => s.replace(/\W+\w/g, match => match.slice(-1).toUpperCase());
    var properties = rule.split(";").map(o => o.split(":").map(x => x && x.trim()));
    for (var [property, value] of properties) {
        let prop = cssToJs(property);
        if (prop && value) style[prop] = value;
    }
    return style
}

export const patch = (dom, vdom, parent, hostPatch) => {
    parent = parent || dom.parentNode;
    let replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el),

        vdomIsObj = isObj(vdom),
        bothAreFrags = (dom.nodeName === FRAGMENT_TYPE || isCustomElement(dom)) && vdom.type === FRAGMENT_TYPE,
        domIsInstanceOfText = dom instanceof Text;




    if (vdomIsObj && isFunc(vdom.type)){
        console.log('   vdom is obj and vom type is function. patching')
        return patch(dom, vdom.type(assignProps(vdom)), dom.parentNode, hostPatch);
    }

    if (!vdomIsObj && domIsInstanceOfText){
        console.log('   vdom is NOT obj and dom is instance of text. replacing with render')
        return dom.textContent !== vdom ? replace(render(vdom, parent)) : dom;
    }


    if (vdomIsObj && domIsInstanceOfText){
        console.log('   vdom is obj and dom is instance of text, replacing with render' )
        return replace(render(vdom, parent));
    }

    if (vdomIsObj && (dom.nodeName !== vdom.type.toUpperCase()) && !bothAreFrags){
        console.log('vdom is obj and node names dont match. replacing with render')
        return replace(render(vdom, parent));
    }


    if (vdomIsObj && (dom.nodeName === vdom.type.toUpperCase()) || bothAreFrags) {
        console.log('vdom is obj and node names match... vdom', vdom, 'dom', dom)
        const pool = {};
        //create a map of the child nodes in the pool and apply a track key to each if not there
        cat(dom.childNodes).map((child, index) =>{
            console.log('building track key with:',child[trackKey] || trackKey + '_' + index)
            pool[child[trackKey] || trackKey + '_' + index] = child
        });

        cat(vdom.children).map((child, index) => {
            const key = child.props && child.props.key // see if theres a key applied by the user (mapping lists ?)
                || trackKey + '_' + index; // or apply a key with the index


            console.log('patching or rendering vdom children with this pool key', key);
            let patchResults, renderResults;
            if(pool[key]){
               patchResults = patch(pool[key], child, undefined, hostPatch)
            }else{
                renderResults = render(child, dom);
            }
            console.log('patch results', patchResults)
            console.log('render results', renderResults)

            // let c = pool[key] // if it exists
            //     ? patch(pool[key], child, undefined, hostPatch) // then patch it
            //     : render(child, dom); // else render the child
            // console.log(c)

            // if(!c)console.log('this is still in the pool')
            // if (!c) return;
            // delete pool[key]; // if there are results then prevent it from being removed in the next step
        });
        // kill all the leftover children ...Muahaha
        console.log('before remove', pool)
        // for (let key in pool) {
        //     let r = pool[key], h = r[handlers], k;
        //     if (h) for (k in h) r.removeEventListener(k, h[k]);
        //     console.log('removing', r)
        //     r.remove();
        // }

        // if ((hostPatch && isCustomElement(dom)) || dom.nodeName === FRAGMENT_TYPE) return dom;
        if (dom.nodeName === FRAGMENT_TYPE) return dom; //if its a fragment, then no need to diff the attributes

        let oldProps = {}, newProps = vdom.props, oldAttributes = dom.attributes;

        //create old props from the old attributes
        for (let i = oldAttributes.length, prop; i--;) {
            prop = oldAttributes[i].name;
            oldProps[prop === 'class' ? 'className' : prop] = oldAttributes[i].value;
        }

        //doesn't meet all cases cuz as of now the styles and className have to be parsed to figure out the change
        //but if no styles or no className, then we can maybe* assume none have changed and dip out of the diff early
        if (!propsChanged(oldProps, newProps)) return dom;

        for (let i in merge(oldProps, newProps)) {
            let oldValue = oldProps[i], newValue = newProps[i];
            if (i === 'key') { // ignore the key
            } else if (!(newProps[i])) { // if the new props don't contain the old key, then remove the attribute
                dom.removeAttribute(i === 'className' ? 'class' : i)
            } else if (i === 'className') {
                let vClassName = makeClassName(newProps[i]),
                    oldList = parseClassList(oldValue),
                    baseList = parseClassList(vClassName).filter(item => !oldList.includes(item)),
                    newClassName = baseList.concat(parseClassList(vClassName)
                        .filter(item => !baseList.includes(item))).join(' ');
                if (newClassName !== oldValue) dom.className = newClassName;
            } else if (i === 'style') {
                propsChanged(parseCSSText(oldValue), newValue) && setAttribute(dom, i, newValue);
            } else {
                // for any other case, lets do a simple check if the val has changed
                // cuz className or style may have triggered this diff, and we can still prevent unnecessary updates
                // then set the attribute
                if (oldValue !== newValue) setAttribute(dom, i, newValue)
            }
        }
        return dom;
    }
};
// const toVdom = (element, nodeName) => {
//     if (element.nodeType === 3) return element.nodeValue;
//     let children = [], props = {}, i = 0,
//         a = element.attributes, cn = [].concat(...element.childNodes);
//     if (a) for (i = a.length; i--;) props[a[i].name] = a[i].value;
//     for (i = cn.length; i--;) children[i] = toVdom(cn[i]);
//     return createElement(nodeName || element.nodeName.toLowerCase(), props, ...children);
// };

// function Fragment(obj) {
// 	var children = [];
// 	for (var key in obj) {
// 		if (obj.hasOwnProperty(key)) {
// 			var child = [].concat(obj[key]);
// 			for (var i = 0; i < child.length; i++) {
// 				var c = child[i];
// 				// if unkeyed, clone attrs and inject key
// 				if (isValidElement(c) && !(c.attributes && c.attributes.key)) {
// 					var a = {};
// 					if (c.attributes) for (var j in c.attributes) a[j] = c.attributes[j];
// 					a.key = key + '.' + i;
// 					c = preact.createElement(c.nodeName, a, c.children);
// 				}
// 				if (c != null) children.push(c);
// 			}
// 		}
// 	}
// 	return children;
// }
//


// class Component {
//     constructor(props) {
//         this.props = props || {};
//         this._raf = 0;
//         this.didMount
//             = this.willUnmount
//             = this.componentWillMount
//             = this.componentWillUnmount = () => {
//         };
//     }
//
//
//     componentDidUpdate() {
//         console.log('component did update')
//     }
//
//     _onStateChange = (data) => {
//         console.log('state change')
//         if (this._raf) cancelAnimationFrame(this._raf);
//         this._raf = requestAnimationFrame(() => {
//             patch(this.base, this.render());
//             console.log('asdf', this._raf)
//             this._raf = 0;
//             this.componentDidUpdate(this.props);
//
//         });
//
//     };
//
//     static render(vdom, parent = null) {
//         const props = assignProps(vdom);
//         if (Component.isPrototypeOf(vdom.type)) {
//             const i = new (vdom.type)(props);
//             i.componentWillMount();
//             i.base = render(i.render(), parent);
//             i.base[instanceKey] = i;
//             i.base[trackKey] = vdom.props.key;
//             i.componentDidMount();
//             return i.base;
//         } else return render(vdom.type(props), parent);
//     }
//
//     static patch(dom, vdom, parent = dom.parentNode, hostPatch) {
//         const props = assignProps(vdom);
//         if (dom[instanceKey] && dom[instanceKey].constructor === vdom.type) {
//             dom[instanceKey].props = props;
//             return patch(dom, dom[instanceKey].render(), parent, hostPatch);
//         } else if (Component.isPrototypeOf(vdom.type)) {
//             const ndom = Component.render(vdom, parent);
//             return parent ? (parent.replaceChild(ndom, dom) && ndom) : ndom;
//         } else if (!Component.isPrototypeOf(vdom.type)) {
//             return patch(dom, vdom.type(props), parent, hostPatch);
//         }
//     }
//
//     componentDidMount() {
//         this.didMount();
//     }
//
//     componentWillUnmount() {
//         this.willUnmount()
//     }
// }


// export const component = (Child) => {
//
//     let ref = null;
//     const setRef = (dom) => {
//         ref = dom;
//     };
//
//     let testValue = 'red';
//
//     const sayHello = () => {
//         console.log('hello');
//         testValue = 'green';
//         // console.log(.props)
//         let newVdom = toVdom(ref);
//         newVdom.props.style = 'color:green';
//         patch(ref, newVdom)
//     }
//
//
//     const C = (props) => {
//         return createElement(Child,
//             {
//                 ref: setRef,
//                 onClick: sayHello,
//                 style: {color: testValue},
//                 ...Child.props
//             },
//             ...props.children)
//     }
//
//     //     ({children, ...rest}) => {
//     //     // return <Child ref={setRef} onClick={sayHello} {...props}/>
//     //     return
//     // };
//
//
//     return C;
// }
//
//
//
// export const element = (state) => (Child) =>
//     class ObserverComponent extends Component {
//         didMount = () => {
//             this.unsub = observe(state, this._onStateChange);
//         };
//         willUnmount = () => this.unsub();
//         render = () => createElement(Child, {state, ...Child.props})
//     };
