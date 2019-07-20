import createElement, { Fragment} from "../_modules/finalizing/vdom";
import {element, Component} from "../_modules/finalizing/Component";
import {insertStyleSheet} from "../_modules/finalizing/insertStyleSheet";
import {fadeIn} from "../styles/mixins";
import {theme, cvar, convertThemeToCssVars} from "../styles/theme";


insertStyleSheet(
    convertThemeToCssVars(theme,)
    // language=CSS format=true
    + css`
    html, body {
        overflow-x: hidden;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-tap-highlight-color: transparent;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        text-rendering: optimizeLegibility;
        margin: 0;
        padding: 0;
        background: ${cvar('bg1')}
    }
    html {
        /*font-family: */
        font-size: 16px;
        font-weight: 500;
        line-height: 120%;
    }
    body {
        overflow-x: hidden; 
        -webkit-overflow-scrolling: touch;
    }
    *, :after, :before {
        box-sizing: border-box
    }

`);

// insertStyleSheet(
//     // language=CSS format=true
//     css`
//     :root {
//         --error:blue;
//     }
//     `
// )
export const AppContainer = element('app-container',
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
                        :not(:defined){
                            display: none;
                        }

                        :host {
                            display: flex;
                            width: 100%;
                            height: 100%;
                            min-height: 100%;
                            flex-direction: column;
                            -webkit-overflow-scrolling: touch;
                            margin: 0 auto;
                        }
                        :host([has-top-nav]){
                            padding-top: ${cvar('nav_height')};
                        }

                        :host > * {
                            -webkit-transform: translateZ(0px);
                        }
                    ` + fadeIn
                    }</style>
                    <slot></slot>
                </Fragment>
            )
        }
    });

