import {Component, element} from "../../finalizing/Component";
import {createElement, Fragment} from "../../finalizing/vdom";
import {theme} from "../../../styles/theme";
import {fadeIn} from "../../../styles/mixins";
import {cvar} from "../../../styles/theme";

/** @jsx createElement */

export const AppRouter = element('app-router',
    class Container extends Component {
        static props = {
            hasTopNav: Boolean
        };

        render() {
            return (
                <Fragment>
                    <style>{
                        // language=CSS format=true
                        css`
                        :host([hidden]) {
                            display: none;
                        }

                        :host {
                            display: block;
                            width: 100%;
                            height: 100%;
                            color: ${cvar('error')}
                        }

                        #pages::slotted(*){

                        }
                    `}</style>
                    <slot id="pages"></slot>
                </Fragment>
            )
        }
    });



