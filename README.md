---------- webpack sizing --------
1.3kb main.js - webpack runtime only
3.4kb main.js - webpack runtime with superfine / elemental
     2KB       superfine / web Component
   
   4.5kb - todo app
-----------------------------------

browser list
-----------------------------------
  "browserslist": {
    "production": [
      ">0.03%",
      "not dead",
      "IE 9",
      "not op_mini all"
    ],
    "development": [
      "defaults"
    ]
  }
  
-----------------------------------


libs

https://open-wc.org/

content loading animation
https://www.clever-cloud.com/doc/clever-components/?path=/story/env-var-env-var-editor-expert-default--no-data-yet-skeleton


https://github.com/CleverCloud/clever-components/blob/master/components/atoms/cc-expand.js


https://www.sitepoint.com/javascript-decorators-what-they-are/

https://github.com/jballant/webpack-strip-block/blob/master/index.js


https://github.com/askbeka/wc-context/blob/master/demo/redux/components/controlled-input.js

https://github.com/ycmjason-talks/2018-11-21-manc-web-meetup-4/blob/master/src/vdom/diff.js


https://github.com/tvcutsem/harmony-reflect

raw loader
https://github.com/webpack-contrib/raw-loader/blob/master/src/index.js

ripples
https://codepen.io/Craigtut/pen/dIfzv

<head>
  <!-- 
    If you are loading es5 code you will need 
    custom-elements-es5-loader to make the element work in 
    es6-capable browsers. 
        
    If you are not loading es5 code, you don't need 
    custom-elements-es5-loader. 
  --> 
  <!-- 
  <script src="./path-to/custom-elements-es5-loader.js"></script>
  -->

  <!-- Load polyfills -->
  <script 
    src="path-to/webcomponents-loader.js"
    defer>
  </script> 

  <!-- Load component when polyfills are definitely ready -->
  <script type="module">
    // Take care of cases in which the browser runs this
    // script before it has finished running 
    // webcomponents-loader.js (e.g. Firefox script execution order)
    window.WebComponents = window.WebComponents || { 
      waitFor(cb){ addEventListener('WebComponentsReady', cb) }
    }

    WebComponents.waitFor(async () => { 
      import('./path-to/some-element.js');
    });
  </script>
</head>
<body>
  <!-- Add the element to the page -->
  <some-element></some-element>
</body>



-------------- CSS ----------------
https://developers.google.com/web/updates/2016/06/css-containment


<body class="darktheme">
  <fancy-tabs>
    ...
  </fancy-tabs>
</body>


:host-context(.darktheme) {
  color: white;
  background: black;
}



const slot = this.shadowRoot.querySelector('#slot');
slot.addEventListener('slotchange', e => {
  console.log('light dom children changed!');
});

Call slot.assignedNodes() to find which elements the slot is rendering. 
The {flatten: true} option will also return a slot's fallback content (if no nodes are being distributed).

element.assignedSlot tells you which of the component slots your element is assigned to.


https://stackoverflow.com/questions/37818401/importing-html-files-with-es6-template-string-loader




https://developers.google.com/web/fundamentals/web-components/best-practices




const allCustomElements = [];

function isCustomElement(el) {
  const isAttr = el.getAttribute('is');
  // Check for <super-button> and <button is="super-button">.
  return el.localName.includes('-') || isAttr && isAttr.includes('-');
}

function findAllCustomElements(nodes) {
  for (let i = 0, el; el = nodes[i]; ++i) {
    if (isCustomElement(el)) {
      allCustomElements.push(el);
    }
    // If the element has shadow DOM, dig deeper.
    if (el.shadowRoot) {
      findAllCustomElements(el.shadowRoot.querySelectorAll('*'));
    }
  }
}

findAllCustomElements(document.querySelectorAll('*'));


function deepActiveElement() {
  let a = document.activeElement;
  while (a && a.shadowRoot && a.shadowRoot.activeElement) {
    a = a.shadowRoot.activeElement;
  }
  return a;
}



https://medium.com/@sweetpalma/gooact-react-in-160-lines-of-javascript-44e0742ad60f

https://medium.com/intrinsic/javascript-object-property-descriptors-proxies-and-preventing-extension-1e1907aa9d10


https://github.com/wavesoft/dot-dom

https://medium.com/@asolove/preact-internals-3-some-fiddly-little-bits-f353b1ad7abc




https://2ality.com/2014/12/es6-proxies.html

function tracePropAccess(obj, propKeys) {
    // Store the property data here
    let propData = Object.create(null);
    // Replace each property with a getter and a setter
    propKeys.forEach(function (propKey) {
        propData[propKey] = obj[propKey];
        Object.defineProperty(obj, propKey, {
            get: function () {
                console.log('GET '+propKey);
                return propData[propKey];
            },
            set: function (value) {
                console.log('SET '+propKey+'='+value);
                propData[propKey] = value;
            },
        });
    });
    return obj;
}



https://mithril.js.org/jsx.html



---------------------------- polyfills

npm install --save child-replace-with-polyfill


// From https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith
function ReplaceWithPolyfill() {
  "use-strict"; // For safari, and IE > 10
  var parent = this.parentNode,
    i = arguments.length,
    currentNode;
  if (!parent) return;
  if (!i)
    // if there are no arguments
    parent.removeChild(this);
  while (i--) {
    // i-- decrements i and returns the value of i before the decrement
    currentNode = arguments[i];
    if (typeof currentNode !== "object") {
      currentNode = this.ownerDocument.createTextNode(currentNode);
    } else if (currentNode.parentNode) {
      currentNode.parentNode.removeChild(currentNode);
    }
    // the value of "i" below is after the decrement
    if (!i)
      // if currentNode is the first argument (currentNode === arguments[0])
      parent.replaceChild(currentNode, this);
    // if currentNode isn't the first
    else parent.insertBefore(this.previousSibling, currentNode);
  }
}

if (!Element.prototype.replaceWith)
  Element.prototype.replaceWith = ReplaceWithPolyfill;
if (!CharacterData.prototype.replaceWith)
  CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
if (!DocumentType.prototype.replaceWith)
  DocumentType.prototype.replaceWith = ReplaceWithPolyfill;
