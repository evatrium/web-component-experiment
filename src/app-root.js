import {createElement, Fragment} from "./_modules/finalizing/vdom";
/** @jsx createElement */
import {element, Component} from "./_modules/finalizing/Component";
import {observable} from "./_modules/finalizing/observer";
import "./_modules/drafts/routing/app-router";
import "./components/app-container";
import './pages/landing-page'
import './components/nav-bar'
// import './components/panel'
import {MyBox} from "./pages/todo";

// const box = observable({color: 'red'});

export const AppRoot = element('app-root', {
    state: {color: 'red'},
    render: ({state}) => {
        return (
            <app-container has-top-nav>
                <nav-bar >

                </nav-bar>

                <input onInput={(e) => state.color = e.target.value}/>

                <my-box box-color={state.color}>

                </my-box>
                {/*<app-router>*/}
                {/*<landing-page></landing-page>*/}
                {/*<io-panel>*/}
                {/*<h1> im in a panel!!</h1>*/}
                {/*</io-panel>*/}
                {/*</app-router>*/}
            </app-container>
        )
    }
});

