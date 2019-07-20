import {Component, element} from "../_modules/finalizing/Component";
import {createElement, Fragment} from "../_modules/finalizing/vdom";
import {cvar} from "../styles/theme";

console.log('i am herrreeeee!!!! ha h aha ha ah ah ah')

//    panelStyles: {background: 'white', borderRadius: '10px', boxShadow: shadows[0],},

export const Panel = element('io-panel', () => (
    <Fragment>
        <style>{
            // language=CSS format=true
            css`
            :not(:defined){
                display: none;
            }
            :host {
                background: white;
                border-radius: 10px;
                box-shadow: ${cvar('shadow_1')}
            }
            :host([pad]){
                padding: ${cvar('spacing')}
            }
        `
        }</style>
        <slot></slot>
    </Fragment>
));

