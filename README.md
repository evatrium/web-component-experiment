# Elemental 🧠

Web Component Essentials with built-in adoptable styleSheets (including fallback), static template caching, and more...

@TODO: write better docs


## Usage
```js
import {Elemental} from "the/path/to/elemental";

export class MyComponent extends Elemental{
    //set to true to apply shadowdom
    static shadow = true;
    /* 
     Component will check for adopted stylesheets 
     and if not available will append a style tag to the root/shadowRoot.
        
     optionally set static styles as a string
     static styles = ':host{background:aliceblue}';
    */
    //or an object with options
    static styles = {
        // styles to adopt to each instance of this component 
        // (efficiently achieved with adoptedStyleSheets),
        css: ':host{color:red}',
        // async: true, // constructable style sheet option. async true uses replace else replaceSync 
 
        // you can force the usage of the style tag over adoptedStyleSheets
        // useStyleTag: true,
 
        // optionally include global styles that will be set once to the document head
        global: 'x-element{visibility:hidden}',
        
        //if using shadowRoot, some resets are included by default
        //:host, *, *::before, *::after {box-sizing: border-box;}
        //set this to true to disable using the resets
        //noDefaultResets: true,
    };

    /*  
        If your component is simple and doesn't update much, it might be more performant 
        to use a template instead of JSX, since a copy is cached and cloned per instance.
        this is is a static value but dom may be updated manually in beforeInitialUpdate and after didMount.
        or with propLogic
    */
    static template = '<h1 id="my_ref">hello elemental</h1><input id="checkbox" type="checkbox"/>';
    
    /*
        proxyRefs

        (this makes sense if using a template and not vdom bacuse you can just pass a function to the ref prop)

        to automatically proxy elements references, 
        set this to true or an options object to override defaults.
        * keep your ref names camel or snake cased
        
        when the component mounts, reference to the h1 tag above will be available on:
        this.refs.my_ref.
        
        (in a case where you are completely wiping out the dom or updating nodes, you can call:
            this.refs.refreshRefsCache()
        to pull new references)
    */
    static proxyRefs = {
        //(default) likely there will be shadowDom so the default selector is set to get by id
        selector: ref => `#${ref}`, // can change to something like (ref) => `[data-${ref}]`
        selectorMethod: 'querySelector', // can change to something like querySelectorAll
    };   
    
    /*
        propTypes
        define all your properties with types, optionally with a default value 
        and optional reflect property to reflect your props as attrs.

        (if reflected:true) 
        When a prop is set, it will update the corresponding attribute to kabob-case version 
        
        in addition, properties on the class will be updated when attributes are set 
        (this is by default without setting the reflect option)
        
    */
   
    static propTypes = {

        myStringProp: String,
        myBooleanProp: Boolean,
        myNumberProp: Number,
        myObjectProp: Object,
        myArrayProp: Array,
        anyValueGoesProp: 'any',

        toBeReflected: {
            type: String,
            reflect: true
        },

        toBeReflectedWithDefaultValue: {
            type: Boolean,
            reflect: true,
            value: true
        },
        checked: {
            type: Boolean,
            reflect: true,
        }
    };

    /*
        state should always be an object
        use this.setState({someProp: 'newValue'}) 
        or this.setState(({someNum})=>({someNum: someNum + 1})
        
       setState will call the method onStateChange(){
            then this.update then didUpdate()
       }  
       if you override onStateChange, then you will need to manually call this.update
    */
    state = {
        count: 0
    };   
    
    // before didMount gets called 
    // (if using a template) this gets called after the template is applied, but before didMount and propLogic
    beforeInitialUpdate(){
    }
    
    //example handle click without jsx
    handleClick = (e) => {
        e.stopPropagation();
        let c = this.refs.checkbox.checked;
        this.checked = c;
        this.emit('change', {checked: c});
    };

    didMount() {
        // this.eventListener will automatically remove the event listener when the component unmounts
        this.eventListener(this.refs.checkbox, 'click', this.handleClick);
        // all subscriptions (like the event listener above) are pushed into this.unsubs.
        /*
            //here is an example of doing the above manually

            this.checkbox = this.shadowRoot.querySelector("#checkbox");
            this.checkbox.addEventListener("click", this.handleClick);
            this.unlisten = () => this.checkbox.removeEventListener("click", this.handleClick);
            // then either push it into unsubs 
            this.unsubs.push(this.unlisten)
            // or call unlisten inside willUnmount() 
        */ 
    }
    
    willUnmount(){
        // this.unlisten();
    }

    onStateChange(state, changedPaths = ['nested.value']){ //array of values that have changed on the object

        //if including this method, it will override calling update (thus wont call render, propLogic and didUpdate)
        // so manually calling this.update() here may be necessary (must do so if using the render function with vdom)
        // otherwise, omit this method and render will be called onChange
    }

    // called when props or state changes (unless onStateChange is overriden like above)
    didUpdate(props = {}, prevProps = {}, changedProps = ['myStringProp', 'example']){
    }   

    //****** using propLogic makes sense if using a template and you don't have a lot of changes happening.
    // Make precise updates based on which prop changes
    propLogic = (init)=>({ // initially runs after didMount (init===true) then is triggered for every update (init===false) 
        myStringProp: (value, refs) => {
            if(init){ //upon didMount
                refs.my_ref.textContent = value || 'default name'; //value is the value from the prop
            }else{ 
                // subsequent updates 
            }
        },
        // this both initializes and updates the checkbox when the prop changes
        checked: (checked, {checkbox}) => checkbox.checked = checked
    });
    
    // if you'd like to use jsx / preact / lit-html
    // you can hook into the render cycle here. 
    // this.render is called passing the following arguments
    //     (this.props, this.state, this.setState, this)
    // results from render are passed here, including the shadowRoot (if available) or the host element
    // as the second argument
    renderer = (resultsFromRender, shadowRootOrHost /* this.shadowRoot || this */)=>{
        // renderer provides an extra layer of control if you'd like to create
        // an abstracted layer on top of elemental,
        // thus, having the results from render here provides a prehook before
        // anything actually gets rendered
    
        //example with preact render
        render(resultsFromRender, shadowRootOrHost)
    };   
    
    render(props, state, setState, self /* self = this */){
        
        return (
            <Fragment>
                <h1 ref={r => this.my_ref = r} style={{color: 'red', fontSize: 50 /*no need for pixel vaue*/}}>
                    hello: {props.myStringProp} 
                </h1>
                 <h2 style={{color: 'blue'}} className={'some className'}>
                        {state.count}
                 </h2>
                <button onClick={()=> state.count++}> inc count +</button>
            </Fragment>
        )   
    }   
}

customElements.define('my-component', MyComponent);
```


