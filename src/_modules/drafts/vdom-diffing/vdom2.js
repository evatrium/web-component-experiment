/** @jsx createElement */
import {createElement} from '../../finalizing/vdom';
import {isArray, isObj, isFunc, isString, isNum} from "../../finalizing/utils";
import {Component} from "../../finalizing/Component";

let d = document,
    handlers = '__iosioHandlers',
    trackKey = '__iosioKey';
export const FRAGMENT_TYPE = '#document-fragment';



const assignProps = (vdom) => ({...vdom.props, children: vdom.children});

export const Fragment = ({children}) => createElement(FRAGMENT_TYPE, {}, ...children);

const cat = (arr) => [].concat(...arr);

var merge = function (a, b, out) {
    out = {};
    for (let k in a) out[k] = a[k];
    for (let k in b) out[k] = b[k];
    return out
};


const cnObj = (obj, out) => {
    out = "";
    for (const k in obj) if (obj[k]) out += (out && " ") + k;
    return out;
};
const makeClassName = (value) => isObj(value) ? cnObj(value) : value;
const parseClassList = (value) => (!value) ? [] : value.split(' ');

// Check for <super-button> and <button is="super-button">.
function isCustomElement(el) {
    if (!el.getAttribute || !el.localName) return false;
    const isAttr = el.getAttribute('is');
    return el.localName.includes('-') || isAttr && isAttr.includes('-');
}

var propsChanged = function (a, b) {
    for (var k in a) if (a[k] !== b[k]) return true;
    for (var k in b) if (a[k] !== b[k]) return true;
};


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
    } else if (key === 'inputValue') dom.value = value;
    else if (['checked', 'value'].includes(key) && !isCustomElement(dom)) dom[key] = value;
    else if (key === 'className') dom[key] = makeClassName(value)
    else if (key === 'style' && isObj(value)) Object.assign(dom.style, value);
    else if (key === 'ref' && isFunc(value)) value(dom);
    else if (key === 'key') dom[trackKey] = value;
    else if (!isObj(value) && !isFunc(value)) dom.setAttribute(key, value);
};


export function render(vdom, parent) {
    const mount = (el) => parent ? parent.appendChild(el) : el;

    if (isString(vdom) || isNum(vdom)) return mount(d.createTextNode(vdom));
    if (typeof vdom == 'boolean' || vdom === null) return mount(d.createTextNode(''));
    if (isObj(vdom) && isFunc(vdom.type)) return render(vdom.type(assignProps(vdom)), parent);


    let dom, elem = vdom.type === FRAGMENT_TYPE
        ? d.createDocumentFragment()
        : d.createElement(vdom.type);

    dom = mount(elem);

    cat(vdom.children).forEach((vChild) => dom.appendChild(render(vChild)));

    if (dom.setAttribute) for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
    if (vdom.type === FRAGMENT_TYPE) mount(dom);

    return dom;
}

const removeHandlers = (dom) => {
    if (dom instanceof Text || !dom) return dom;
    let handlers = dom[handlers], k;
    if (handlers) for (k in handlers) dom.removeEventListener(k, handlers[k]);
    cat(dom.childNodes).forEach(child => removeHandlers(child));
    return dom;
};

const updateProps = (dom, newProps, oldProps) => {
    //
    // console.log('updating props on dom ', dom);
    // console.log('old props', oldProps);
    // console.log('new props', newProps);


    if (!propsChanged(oldProps, newProps)) return;
    for (let i in merge(oldProps, newProps)) {
        let oldValue = oldProps[i], newValue = newProps[i];
        if (i === 'key') { // ignore the key
        } else if (!(newProps[i])) { // if the new props don't contain the old key, then remove the attribute
            dom.removeAttribute(i === 'className' ? 'class' : i)
        } else if (i === 'className') {
            if (isObj(newValue) && isObj(oldValue) && propsChanged(oldValue, newValue)) {
                setAttribute(dom, i, newValue);
            } else if (oldValue !== newValue) {
                setAttribute(dom, i, newValue);
            }
        } else if (i === 'style') {
            if (propsChanged(oldValue, newValue)) {
                setAttribute(dom, i, newValue)
            }
        } else {
            // for any other case, lets do a simple check if the val has changed
            // cuz className or style may have triggered this diff, and we can still prevent unnecessary updates
            // then set the attribute
            if (oldValue !== newValue) setAttribute(dom, i, newValue)
        }
    }
};


function typesChanged(node1, node2) {
    return typeof node1 !== typeof node2
        || typeof node1 === 'string' && node1 !== node2
        || node1.type !== node2.type
}

//
// export const render = (dom, newVDom) =>{
//     dom.appendChild(render(newVDom));
// }
/*
 if (!oldVDom) {
        render(newVDom, dom);
    } else if (!newVDom) {
        const toRemove = removeHandlers(dom.childNodes[index]);
        toRemove && dom.removeChild(toRemove);
    } else

     if (typeChanged(newVDom, oldVDom)) {
        const toRemove = removeHandlers(dom.childNodes[index]);
        toRemove && dom.replaceChild(render(newVDom), toRemove)
    } else if (isArray(newVDom)) {
        console.log('theres an array in here!!!')
    } else
 */


export const patch = (dom, newVDom, oldVDom, parent) => {
    parent = parent || dom.parentNode;

    /*
        replace( replace with this newly rendered child )
     */
    let replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el);


    if (oldVDom && !newVDom) {
        console.log('\t removing dom', dom)
        removeHandlers(dom).remove();
        return
    }
    /*
        BOTH OLD AND NEW VDOM ARE FUNCTIONAL COMPONENTS
        RENDER AND PATCH THE RESULTS
        {type:ƒ, props: {}, children}
        {type:ƒ, props: {}, children}
     */
    if (isObj(newVDom) && isObj(oldVDom) && isFunc(newVDom.type) && isFunc(oldVDom.type)) {
        console.log('\t rendering functional components')
        return patch(dom, newVDom.type(assignProps(newVDom)), oldVDom.type(assignProps(oldVDom)));
    }

    /*
        NEW VDOM IS TEXT
        if its not equal to the last text, then replace it. else return dom
        its safe to just replace cuz you cant set event listeners on text
     */
    if (!isObj(newVDom) && isString(newVDom)) {
        // console.log('\t new vdom is NOT obj and new vdom is string. replacing with render if strings are different')
        return oldVDom !== newVDom ? replace(render(newVDom, parent)) : dom;
    }

    if (typesChanged(newVDom, oldVDom)) {
        // console.log('\t types have changed')
        return replace(render(newVDom, parent));
    }


    if (newVDom.type === oldVDom.type) {
        console.log('\t types are the same', newVDom.type, oldVDom.type)

        const oldPool = {};
        const newPool = {};
        const domPool = {};


        const oldDomChildren = cat(dom.childNodes);
        const newChildren = cat(newVDom.children);
        const oldChildren = cat(oldVDom.children);


        oldDomChildren.map((child, indi) => {
            // console
            domPool[child[trackKey] || trackKey + '_' + indi] = child
        });

        oldChildren.map((child, indi) => {
            oldPool[child.props && child.props.key || trackKey + '_' + indi] = child
        });

        newChildren.map((child, indi) => {
            newPool[child.props && child.props.key || trackKey + '_' + indi] = child
        });


        const oldKeys = Object.keys(oldPool);
        const newKeys = Object.keys(newPool);
        const domKeys = Object.keys(domPool);


        // console.log()

        console.log('oldKeys', oldKeys)
        console.log('newKeys', newKeys)
        console.log('domKeys', domKeys)


        console.log('old dom children', oldDomChildren)
        console.log('new vdom children', newChildren)
        console.log('old vdom children', oldChildren)


        const merged = merge(oldPool, newPool);

        Object.keys(merged).sort().forEach((key) => {

            console.log(key)
            if(!oldPool[key]){
                render(newPool[key], dom)
                console.log('this needs to be rendered', newPool[key])
            }else{
                console.log('this needs to be patched')
                // patch(domPool[key],newPool[key], oldPool[key])

            }


        })


        const insBfr = (host, item, goesBefore)=>{
            host.insertBefore(item, goesBefore)
        }
        // for(let key in merge(oldPool, newPool)){
        //
        //
        //
        // }


        // merge()


        //
        // console.log('pool', pool);
        // console.log('new children length', newChildren.length, ' old children length', oldChildren.length)
        // // console.log('with type,', dom, dom.childNodes[index])
        // //
        // let patches = [];
        //
        // newChildren.map((child, indi) => {
        //
        //     const key = child.props && child.props.key || trackKey + '_' + indi;
        //
        //     if (pool[key]) {
        //         console.log('this was in the pooollll', pool[key]);
        //         console.log('patching pool', dom, dom.childNodes[indi], newChildren[indi], oldChildren[indi])
        //         patches.push(() => patch(dom.childNodes[indi], newChildren[indi], oldChildren[indi]));
        //         delete pool[key]
        //     } else {
        //         console.log('this wasnt', pool[key])
        //     }
        //
        //     //
        //     // console.log(newChildren[key], oldChildren[key])
        //     // render(dom, newChildren[key], oldChildren[key])
        //     //
        //     //
        //     // if (pool[key]) {
        //     //     console.log('this exists', pool[key]);
        //     //
        //     //     // render()
        //     // } else {
        //     //     console.log('this does not', pool[key])
        //     //     render(dom, newChildren[key], oldChildren[key])
        //     // }
        //
        //     // let c = pool[key] // if it exists
        //     //     ? patch(pool[key], child, undefined, hostPatch) // then patch it
        //     //     : render(child, dom); // else render the child
        //     // console.log(c)
        //     //
        //     // if (!c) console.log('this is still in the pool')
        //     // if (!c) return;
        //     // delete pool[key]; // if there are results then prevent it from being removed in the next step
        // });
        //
        // oldChildren.map((child, indi)=>{
        //
        // })
        //
        // console.log(pool);
        //
        //
        // for (let key in pool) {
        //     let r = pool[key], h = r[handlers], k;
        //     if (h) for (k in h) r.removeEventListener(k, h[k]);
        //     console.log('removing', r)
        //     r.remove();
        // }

        // updateProps(dom.childNodes[index], newVDom.props, oldVDom.props);
        //
        // for (let i = 0; i < newChildren.length || i < oldChildren.length; i++) {
        //     render(dom.childNodes[index], newChildren[i], oldChildren[i], i);
        // }

    } else if (isArray(newVDom)) {
        console.log('is array', newVDom)
    }

    return dom;
};


const vDiff = (target, source) => {


    const worker = {
        settings: {
            original: target,
        },
        replace(target, source = target) {
            const v = document.createElement('template');
            v.innerHTML = source;
            const vHTML = v.content.firstChild.nextElementSibling;

            if (vHTML.nodeName !== target.nodeName) {
                target.parentElement.replaceChild(vHTML, target);
                return;
            }
            this.iterate(target, vHTML);
        },
        iterate(targetNode, sourceNode, tOriginal) {
            if (targetNode || sourceNode) {

                this.checkAdditions(targetNode, sourceNode, tOriginal);

                if (targetNode && sourceNode && targetNode.nodeName !== sourceNode.nodeName) {
                    this.checkNodeName(targetNode, sourceNode);
                } else if (targetNode && sourceNode && targetNode.nodeName === sourceNode.nodeName) {
                    this.checkTextContent(targetNode, sourceNode);
                    targetNode.nodeType !== 3 && target.nodeType !== 8 && this.checkAttributes(targetNode, sourceNode);
                }
            }
            if (targetNode && sourceNode) {
                if (targetNode.childNodes && sourceNode.childNodes) {
                    this.settings.lengthDifferentiator = [...target.childNodes, ...sourceNode.childNodes];
                } else {
                    this.settings.lengthDifferentiator = null;
                }
                Array.apply(null, this.settings.lengthDifferentiator).forEach((node, idx) => {
                    this.settings.lengthDifferentiator &&
                    this.iterate(targetNode.childNodes[idx], sourceNode.childNodes[idx], targetNode, sourceNode);
                });
            }
        },
        checkNodeName(targetNode, sourceNode) {
            const n = sourceNode.cloneNode(true);
            targetNode.parentElement.replaceChild(n, targetNode);
        },
        checkAttributes(targetNode, sourceNode) {
            const attributes = targetNode.attributes || [];
            const filteredAttrs = Object.keys(attributes).map((n) => attributes[n]);
            const attributesNew = sourceNode.attributes || [];
            const filteredAttrsNew = Object.keys(attributesNew).map((n) => attributesNew[n]);
            filteredAttrs.forEach(o => {
                return sourceNode.getAttribute(o.name) !== null
                    ? targetNode.setAttribute(o.name, sourceNode.getAttribute(o.name))
                    : targetNode.removeAttribute(o.name);
            });
            filteredAttrsNew.forEach(a => {
                return targetNode.getAttribute(a.name) !== sourceNode.getAttribute(a.name)
                    && targetNode.setAttribute(a.name, sourceNode.getAttribute(a.name));
            });
        },
        checkTextContent(targetNode, sourceNode) {
            if (targetNode.nodeValue !== sourceNode.nodeValue) {
                targetNode.textContent = sourceNode.textContent;
            }
        },
        checkAdditions(targetNode, sourceNode, tParent = this.settings.original) {
            if (sourceNode && targetNode === undefined) {
                const newNode = sourceNode.cloneNode(true);
                tParent.nodeType !== 3 && tParent.nodeType !== 8 && tParent.appendChild(newNode);
            } else if (targetNode && sourceNode === undefined) {
                targetNode.parentElement.removeChild(targetNode);
            }
        }
    };


    Object.create(worker).replace(target, source);
};
//
// let x = 0;
//
// document.querySelector('button').addEventListener('click', () => {
//     x = (x === 3 ? 0 : x + 1);
//     vDiff(document.querySelector('section'),
//         `
// 			<section>
// 			<img style="display:${x === 1 ? 'block' : 'none'}" src="https://placeimg.com/700/200/tech" alt="phones p much">
// 			<img style="display:${x === 2 ? 'block' : 'none'}" src="https://placeimg.com/700/200/people" alt="peeps">
// 			<img style="display:${x === 0 ? 'block' : 'none'}" src="https://placeimg.com/700/200/animals" alt="woofers">
// 			<img style="display:${x === 3 ? 'block' : 'none'}" src="https://placeimg.com/700/200/nature" alt="outside">
// 			</section>
// 		`
//     );
// });
