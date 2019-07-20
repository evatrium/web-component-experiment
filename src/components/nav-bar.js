import {createElement, Fragment} from "../_modules/finalizing/vdom";
import {element} from "../_modules/finalizing/Component";
import {cvar} from "../styles/theme";

/** @jsx createElement */


export const NavBar = element('nav-bar', {
    render: () => (
        <nav>
            <style>
                {// language=CSS format=true
                    css`
                        :host([hidden]) {
                            display: none;
                        }

                        :host, nav {
                            position: fixed;
                            top:0;
                            right:0;
                            left:0;
                            background: white;
                            border-bottom: 1px solid aliceblue;
                            flex-shrink: 0;
                            z-index: ${cvar('z_index_nav')};
                            height: ${cvar('nav_height')};
                            box-shadow: ${cvar('shadow_1')};
                        }
                    `}
            </style>
            <slot></slot>
        </nav>
    )
});



