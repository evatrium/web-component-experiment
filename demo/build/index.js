
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
class Elemental extends HTMLElement {
  constructor(props) {
    super(props);

    this.setState = newState => {
      this.prevState = { ...this.state
      };
      Object.assign(this.state, newState);
      this.onStateChange(this.state, this.prevState);
    };

    this[GET_ARGS] = () => [this.props, this.prevProps, this.changedProps];

    this.emit = (event, detail, opts = {}, from = this) => from.dispatchEvent(new CustomEvent(event, {
      detail: detail,
      bubbles: true,
      composed: true,
      ...opts
    }));

    this.eventListener = (to, ev, cb, opts) => this.unsubs.push(eventListener(to, ev, cb));

    this.unsubSubs = () => {
      let {
        unsubs: un
      } = this;

      for (let i = un.length; i--;) un[i] && un[i]();

      this.unsubs = [];
    };

    this.onStateChange = () => {
      return this.update();
    };

    const {
      shadow,
      styles,
      template,
      proxyRefs
    } = this.constructor;
    shadow && this.attachShadow({
      mode: 'open'
    });

    if (isObj(styles) && styles.global && !globalStyleTagCache.get(this.constructor)) {
      headStyleTag(this.nodeName.toLowerCase())(styles.global);
      globalStyleTagCache.set(this.constructor, true);
    }

    let initial = true,
        adoptSheets = cssStrOrObj => {
      let {
        options = {},
        css = ''
      } = isObj(cssStrOrObj) ? cssStrOrObj : {
        css: cssStrOrObj
      };
      this.fallbackCssString = adoptStyles(this, css, {
        getStringOnFallback: false,
        ...options
      });
    },
        statics = () => {
      styles && adoptSheets(styles);
      template && appendTemplate(this, template);
    };

    Object.assign(this, {
      unsubs: [],
      refs: proxyRefs ? refs(proxyRefs)(this) : {},
      prevState: {},
      state: {},
      props: {},
      prevProps: {},
      changedProps: [],
      mounted: new Promise(mount => this.mount = mount),
      initialized: new Promise(mount => this.init = mount),
      update: () => {
        if (!this.processing) {
          this.processing = this.mounted.then(_ => {
            this.render && this.renderer && this.renderer(this.render(this.props, this.state, this.setState, this), this.shadowRoot || this);

            if (initial) {
              this.unmount = this.didMount(...this[GET_ARGS]()) || NOOP;
              const logic = this.propLogic && this.propLogic(true);
              logic && Object.keys(this.props).forEach(prop => {
                logic[prop] && logic[prop](this.props[prop], this.refs);
              });
            } else {
              const shouldUpdate = this.shouldUpdate(...this[GET_ARGS]());

              if (shouldUpdate || shouldUpdate === undefined) {
                this.didUpdate(...this[GET_ARGS]());
                const logic = this.propLogic && this.propLogic();
                logic && this.changedProps.forEach(prop => logic[prop] && logic[prop](this.props[prop], this.refs));
              }
            }

            initial = false;
            this.changedProps = [];
            this.processing = false;
          });
        }

        return this.processing;
      }
    });
    shadow && statics();
    this.initialized.then(() => {
      !shadow && statics();

      if (this.observe) {
        [].concat(this.observe).forEach(o => {
          isObj(o) && o.$onChange && this.unsubs.push(o.$onChange(this.update));
        });
      }

      this.beforeInitialUpdate(...this[GET_ARGS]());
      this.mount();
    });
    let initAttrs = this.constructor[INIT_ATTRS],
        length = initAttrs.length;

    while (length--) initAttrs[length](this);

    this.update();
  }

  connectedCallback() {
    if (this[IS_MOUNTED]) return;
    this[IS_MOUNTED] = true;
    this.init();
  }

  attributeChangedCallback(a, o, n) {
    if (this[IGNORE_ATTR] === a || o === n) return;
    this[attrToProp(a)] = n;
  }

  static get observedAttributes() {
    let {
      prototype,
      propTypes
    } = this;
    this[INIT_ATTRS] = [];
    if (!propTypes) return [];
    return Object.keys(propTypes).map(prop => {
      let attr = propToAttr(prop);
      let schema = propTypes[prop] === 'any' || propTypes[prop].name ? {
        type: propTypes[prop]
      } : propTypes[prop];

      if (!(prop in prototype)) {
        Object.defineProperty(prototype, prop, {
          get() {
            return this.props[prop];
          },

          set(nextValue) {
            let {
              value,
              error
            } = formatType(nextValue, schema.type);
            if (error && value != null) console.error(`[${prop}] must be type [${schema.type.name}]`);
            if (value === this.props[prop]) return;
            this.changedProps.push(prop);

            if (schema.reflect) {
              this.mounted.then(() => {
                this[IGNORE_ATTR] = attr;
                updateAttribute(this, attr, schema.type === Boolean && !value ? null : value);
                this[IGNORE_ATTR] = false;
              });
            }

            this.prevProps[prop] = this.props[prop];
            this.props[prop] = value;
            this.update();
          }

        });
      }

      schema.value && this[INIT_ATTRS].push(self => self[prop] = schema.value);
      return attr;
    });
  }

  disconnectedCallback() {
    let {
      isConnected,
      unmount,
      willUnmount
    } = this;
    if (isConnected) return;
    typeof unmount === 'function' && unmount();
    willUnmount();
    this.unsubSubs();
  }

  didUpdate() {}

  didMount() {}

  beforeInitialUpdate() {}

  shouldUpdate() {}

  willUnmount() {}

}
const isObj = thing => Object.prototype.toString.call(thing) === '[object Object]';
const isArray = Array.isArray;
const addListener = (to, ev, cb) => to.addEventListener(ev, cb);
const removeListener = (from, ev, cb) => from.removeEventListener(ev, cb);
const eventListener = (to, ev, cb, opts) => {
  if (!isArray(to)) return addListener(to, ev, cb), () => removeListener(to, ev, cb);
  let unListenAll = [];
  to.forEach(l => {
    addListener(l[0], l[1], l[2]);
    unListenAll.push(() => removeListener(l[0], l[1], l[2]));
  });
  return () => unListenAll.forEach(f => f());
};
const IGNORE_ATTR = Symbol(),
      INIT_ATTRS = Symbol(),
      IS_MOUNTED = Symbol(),
      GET_ARGS = Symbol();

let NOOP = () => {};
const propToAttr = prop => prop.replace(/([A-Z])/g, "-$1").toLowerCase();
const attrToProp = attr => attr.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
const updateAttribute = (node, attr, value) => {
  value === null || value === false || value === 'null' || value === 'false' ? node.removeAttribute(attr) : node.setAttribute(attr, typeof value == "object" ? JSON.stringify(value) : value);
};
const formatType = (value, type) => {
  if (type === 'any') return {
    value,
    error: false
  };
  type = type || String;
  if (type == Boolean) value = [true, 1, "", "1", "true"].includes(value);else if (typeof value == "string") {
    value = type == Number ? Number(value) : type == Object || type == Array ? JSON.parse(value) : value;
  }
  if ({}.toString.call(value) == `[object ${type.name}]`) return {
    value,
    error: type == Number && Number.isNaN(value)
  };
  return {
    value,
    error: true
  };
};
const createElem = tag => document.createElement(tag);
const createStyleTag = css => {
  let style = createElem('style');
  style.appendChild(document.createTextNode(css));
  return {
    element: style,
    update: css => style.textContent = css
  };
};
const getShadowParent = elmnt => {
  while (elmnt.parentNode && (elmnt = elmnt.parentNode)) if (elmnt instanceof ShadowRoot) return elmnt;

  return document;
};
const constructableStyleCache = new Map();
const constructableStyleTagFallbackCache = new Map();
const adoptStyles = (element, cssString, options = {}) => {
  const {
    async,
    getStringOnFallback,
    useStyleTag,
    noDefaultResets
  } = options;
  cssString = (element.shadowRoot && !noDefaultResets ? `:host, *, *::before, *::after {box-sizing: border-box;} ` : '') + (cssString || options.cssString || '');
  const signature = element.constructor.tag || element.constructor;

  if ("adoptedStyleSheets" in document && !useStyleTag) {
    let adopter = element.shadowRoot || getShadowParent(element),
        constructable = constructableStyleCache.get(signature);

    if (!constructable) {
      constructable = new CSSStyleSheet();
      constructable[async ? 'replace' : 'replaceSync'](cssString);
      constructableStyleCache.set(signature, constructable);
    }

    if (![].concat(adopter.adoptedStyleSheets).includes(constructable)) {
      adopter.adoptedStyleSheets = [...adopter.adoptedStyleSheets, constructable];
    }
  } else {
    if (getStringOnFallback) return cssString;
    let style = constructableStyleTagFallbackCache.get(signature);

    if (!style) {
      style = createStyleTag(cssString).element;
      constructableStyleTagFallbackCache.set(signature, style);
    }

    (element.shadowRoot || element).appendChild(style.cloneNode(true));
  }
};
const globalStyleTagCache = new Map();
const headStyleTag = (id, mount) => {
  let style = createElem('style');
  if (id) style.id = id;
  style.appendChild(document.createTextNode(""));
  (mount || document.head).appendChild(style);
  return css => (style.appendChild(document.createTextNode(css)), style);
};
const refs = options => self => {
  let {
    selector = ref => `#${ref}`,
    selectMethod = 'querySelector'
  } = isObj(options) ? options : {},
      refsCache = {},
      root = self.shadowRoot || self;
  return new Proxy({}, {
    get(target, key) {
      if (key === 'refreshRefsCache') return () => refsCache = {};
      if (!refsCache[key]) refsCache[key] = root[selectMethod](selector(key));
      return refsCache[key];
    }

  });
};
const tagTemplateCache = new Map();
const appendTemplate = (element, templateStr) => {
  if (!element || !templateStr) return;
  let el = element.shadowRoot || element,
      signature = element.constructor,
      temp = tagTemplateCache.get(signature);

  if (!temp) {
    temp = createElem('template');
    temp.innerHTML = templateStr;
    tagTemplateCache.set(signature, temp);
  }

  el.appendChild(temp.content.cloneNode(true));
};
let promise = new Promise(resolve => resolve());

var _class, _temp;
const styles = `:host{display:block;will-change:opacity,height;width:100%;transition:all .3s cubic-bezier(0,.91,.58,1);height:0;opacity:1;overflow:hidden}`;

const updateStyle = ({
  style,
  props: {
    expanded,
    collapsedHeight
  },
  scrollHeight
}) => Object.assign(style, {
  height: (expanded ? scrollHeight : collapsedHeight || 0) + 'px',
  opacity: expanded ? 1 : 0
});

class Expander extends Elemental {
  didMount() {
    updateStyle(this);
  }

  didUpdate() {
    updateStyle(this);
  }

}
Expander.shadow = true;
Expander.styles = styles;
Expander.propTypes = {
  expanded: {
    type: Boolean,
    reflect: true
  },
  collapsedHeight: Number
};
Expander.template = `<slot> </slot>`;
customElements.define('elemental-expander', Expander);
const container = document.getElementById("container");
customElements.define('elemental-example', (_temp = _class = class extends Elemental {
  didMount() {
    const {
      btn,
      exp
    } = this.refs;

    btn.onclick = () => {
      exp.expanded = !exp.expanded;
    };
  }

}, _class.proxyRefs = true, _class.styles = `
    elemental-example{
        display: block;
        width: 100%;
    }
     #btn{
        display:block
    }
    elemental-expander{
        background: aliceblue;
        width: 50%;
        margin: 0 auto;
        text-align: center;
        font-family: -apple-system, Helvetica;
    }
    `, _class.template = `
    <button id="btn">
        toggle expand
    </button>
    
    <elemental-expander id="exp">
        <h1>expanded!!!!!</h1>
    </elemental-expander>

`, _temp));
container.appendChild(document.createElement('elemental-example'));

export { Expander };
//# sourceMappingURL=index.js.map
