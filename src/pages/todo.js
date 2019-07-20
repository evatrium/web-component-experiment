import {createElement, Fragment} from "../_modules/finalizing/vdom";
/** @jsx createElement */
import {Component, element} from "../_modules/finalizing/Component"
import {todos} from "../logic/todos";
import {observer, Observe, observable} from "../_modules/finalizing/observer";
import {fadeIn} from "../styles/mixins";
import {FlexBox} from "../components/flex-box";
import {Frag} from "../_modules/finalizing/Component";

let testState = {
    some: {
        value: 'some value',
        nested: {
            value: 'some nested value'
        }
    },
    another: {
        nested: {
            value: 'another nested value'
        }
    },
    value: 'value'
};

const box = {
    size: 300,
    color: 'red',
    show: true
};

const selected = testState.some.nested;

observable(testState);

let anotherTestState = observable({
    some: {
        value: 'some value',
        nested: {
            value: 'some nested value'
        }
    },
    another: {
        nested: {
            value: 'another nested value'
        }
    },
    value: 'value'
});

observable(todos)

export const MyBox = element('my-box', {
    observe: [anotherTestState, testState],
    props: {
        ['box-color']: String,
        size: Number,
        isBig: {
            type: String,
            reflect: true,
            value: true
        },
        listItems: Array
    },
    render: ({props, state}) => {
        console.log('my-box props', props)
        const color = props['box-color'] || 'red';
        const size = props.size || 300;

        return (
            <div style={{height: `${size}px`, width: `${size}px`, background: color}}>

                <style>{// language=CSS format=true
                        `:host {
                        display: block
                    }

                    :host([hidden]) {
                        display: none;
                    }` + fadeIn
                }</style>




                <input
                    value={selected.value}
                    onInput={(e) => selected.value = e.target.value}/>

                <input
                    value={testState.some.value}
                    onInput={(e) => testState.some.value = e.target.value}/>


                {selected.value}
                <h2>{testState.some.value}</h2>

                <hr/>

                <input
                    value={anotherTestState.some.nested.value}
                    onInput={(e) => anotherTestState.some.nested.value = e.target.value}/>

                <input
                    value={anotherTestState.some.value}
                    onInput={(e) => anotherTestState.some.value = e.target.value}/>

                <h2>{anotherTestState.some.nested.value}</h2>
                <h2>{anotherTestState.some.value}</h2>



                {props['list-items'] && props['list-items'].map((todo) => (
                    <div key={'todoId' + todo.id}>{todo.name}
                        <button onClick={() => todos.removeTodo(todo)}>Remove!</button>
                    </div>
                ))}
            </div>
        )
    }
});


class AnotherBox extends Component {
    constructor() {
        super();

    }

    didMount() {

        window.addEventListener('redBoxClicked', ({detail}) => {
            console.log('received message', detail);
        })
    }

    static props = {
        ['box-color']: String,
        size: Number,
        isBig: {
            type: String,
            reflect: true,
            value: true
        }
    };

    render({props, state}) {

        const color = props['box-color'] || 'blue';
        const size = props.size || 300;

        return (

            <div style={{height: `${size}px`, width: `${size}px`, background: color}}>
                <style>{`:host{display:block}:host([hidden]){display: none;}` + fadeIn}</style>
                {/*<input*/}
                {/*value={selected.value}*/}
                {/*onInput={(e) => selected.value = e.target.value}/>*/}
                {/*<input*/}
                {/*value={testState.some.value}*/}
                {/*onInput={(e) => testState.some.value = e.target.value}/>*/}

                {/*{selected.value}*/}
                {/*<h3>{testState.some.value}</h3>*/}


                {/*<h3>{anotherTestState.some.value}</h3>*/}


            </div>

        )
    }


}


customElements.define('another-box', AnotherBox)


const bg = '#5efff7';

observable(box);

@Observe([todos, box])
class MyApp extends Component {
    constructor() {
        super();
        // this.state = [todos, box, testState];
    }

    // state = [todos, box, testState.some.nested];


    render({props, state}) {

        const style = {
            background: todos.testValue ? 'red' : 'blue',
            color: todos.testValue ? 'black' : 'white',
            flexDirection: 'column',
            WebkitFontSmoothing: "antialiased"
        };

        let _props = {};

        if (todos.testValue) _props = {className: 'blue'};

        return (
            <Fragment>

                <style>{
                    // language=CSS format=true
                    css`

                    :host {
                        display: block;
                    }

                    :host([hidden]){
                        display: none;
                    }
                    .red{
                        background: red;
                    }

                    .blue{
                        background: ${bg}
                    }

                    .bold{
                        font-weight:bold
                    }

                  `

                }</style>


                {/*<h1>{selected.value}</h1>*/}

                <span style={`background: ${todos.testValue ? 'red' : 'blue'}`}> todo app! </span>

                <input onKeyPress={(e) => {
                    todos.captureEnter(e);
                }}
                       placeholder="new todo name" value={todos.todoName}
                       onInput={(e) => todos.todoName = e.target.value}/>

                <input className={{
                    red: todos.testValue
                }} placeholder={'search todos'}
                       onInput={(e) => todos.setSearchValue(e.target.value)}/>

                <flex-box jcc w100 style={{height: '100px'}}>

                    <div style={{height: '10px', width: '10px', background: 'blue'}}>
                        heyyy
                    </div>

                </flex-box>
                <div {..._props} >
                    <button onClick={() => todos.testValue = !todos.testValue}>click me</button>
                </div>

                <div>
                    {todos.displayList.map((todo) => (
                        <div key={'todoId' + todo.id}>{todo.name}
                            <button onClick={() => todos.removeTodo(todo)}>Remove!</button>
                        </div>
                    ))}
                </div>
                <h1 style={style}>hello</h1>
                <h2>hiiii</h2>
                <h3>ohh haaaiii</h3>


                <div style={{width: '100%', padding: '10px'}}>

                    <input type="number" placeholder={'box-size'} value={box.size}
                           onInput={(e) => box.size = e.target.value}/>
                </div>

                <button onClick={() => box.show = !box.show}> toggle box</button>

                <input placeholder="new todo name" value={box.color}
                       onInput={(e) => box.color = e.target.value}/>


                {box.show &&
                <my-box size={box.size} box-color={box.color} is-big listItems={todos.displayList}>

                    <div slot="place1">
                        <slot name="app-place-1"></slot>
                    </div>

                    <div slot="place2">
                        {todos.displayList.map((todo) => (
                            <div key={'todoId' + todo.id}>{todo.name}
                                <button onClick={() => todos.removeTodo(todo)}>Remove!</button>
                            </div>
                        ))}
                    </div>

                    <h2>derpy derp derp</h2>
                </my-box>
                }


                {/*<another-box></another-box>*/}
            </Fragment>

        )

    }
}

customElements.define('my-app', MyApp)


/*
(html`
            <div style=${{height: `${size}px`, width: `${size}px`, background: color}}>
             <style>:host{display:block}:host([hidden]){display: none;} ${fadeIn}
            </style>
             <input
                value=${selected.value}
                onInput=${(e) => selected.value = e.target.value}/>


            <input
                value=${testState.some.value}
                onInput=${(e) => testState.some.value = e.target.value}/>

            ${selected.value}
            <h3>${testState.some.value}</h3>
            <h3>${anotherTestState.some.value}</h3>
        </div>
        `)
 */