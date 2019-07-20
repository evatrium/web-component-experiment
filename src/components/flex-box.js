import {createElement, Fragment} from "../_modules/finalizing/vdom";
import {element} from "../_modules/finalizing/Component";

/** @jsx createElement */

const flex = [
    'aic', 'jcc', 'jcsb', 'jcse', 'jcfs', 'jcfe',
    'asfe', 'asfs', 'ass', 'fdc', 'fdr', 'centerize', 'h100', 'w100',
    'a100', 'grow1', 'wrap'
];
export const FlexBox = element('flex-box', {
    props: {...flex.reduce((acc, cur) => ((acc[cur] = {type: Boolean, reflect: true}, acc)), {})},
    render: () => (
        <Fragment>
            <style>
                {// language=CSS format=true
                    css`
                        :host([hidden]) {
                            display: none;
                        }

                        :host {
                            display: flex;
                        }

                        :host([aic]) {
                            align-items: center;
                        }

                        :host([jcc]) {
                            justify-content: center;
                        }

                        :host([jcsb]) {
                            justify-content: space-between;
                        }

                        :host([jcse]) {
                            justify-content: space-evenly;
                        }

                        :host([jcfs]) {
                            justify-content: flex-start;
                        }

                        :host([jcfe]) {
                            justify-content: flex-end;
                        }

                        :host([asfe]) {
                            align-self: flex-end;
                        }

                        :host([asfs]) {
                            align-self: flex-start;
                        }

                        :host([ass]) {
                            align-self: stretch;
                        }

                        :host([fdc]) {
                            flex-direction: column;
                        }

                        :host([fdr]) {
                            flex-direction: row;
                        }

                        :host([centerize]) {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }

                        :host([h100]) {
                            height: 100%;
                        }

                        :host([w100]) {
                            width: 100%;
                        }

                        :host([all100]) {
                            height: 100%;
                            width: 100%;
                        }

                        :host([grow1]) {
                            flex-grow: 1
                        }

                        :host([wrap]) {
                            flex-flow: wrap;
                        }
                    `}</style>
            <slot></slot>
        </Fragment>
    )
});


// language=CSS format=true
const stencilCSS = css`
    :root {
        --color-woodsmoke: #16161d;
        --color-dolphin: #626177;
        --color-gunpowder: #505061;
        --color-manatee: #8888a2;
        --color-cadet-blue: #abb2bf;
        --color-whisper: #ebebf7;
        --color-selago: #f4f4fd;
        --color-white-lilac: #f8f8fc;
        --color-white: #fff;
        --color-green-haze: #00ab47;
        --color-dodger-blue: #5851ff;
        --color-dodger-blue-hover: rgba(88, 81, 255, 0.2);
        --color-old-lace: #fdf5e4;
        --color-wheatfield: #f1e3c5;
        --color-pirate-gold: #9a6400;
        --button-shadow: 0px 2px 4px rgba(2, 8, 20, 0.1), 0px 1px 2px rgba(2, 8, 20, 0.08);
        --button-shadow-hover: 0 4px 6px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
        --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
    }

    .btn {
        border: none;
    }

    .btn {
        -webkit-transition: all .15s ease;
        transition: all .15s ease;
        outline: none;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 14px 20px;
        border-radius: 6px;
        letter-spacing: .04em;
        -webkit-box-shadow: var(--button-shadow);
        box-shadow: var(--button-shadow);
        cursor: pointer;
        display: -ms-inline-flexbox;
        display: inline-flex;
        -ms-flex-align: center;
        align-items: center;
    }

    .btn, .btn a {
        text-decoration: none;
    }

    .btn a {
        color: inherit;
    }

    .btn app-icon {
        margin-right: 8px;
        opacity: .8;
    }

    .btn:hover {
        text-decoration: none;
        -webkit-transform: translateY(-1px);
        transform: translateY(-1px);
        -webkit-box-shadow: var(--button-shadow-hover);
        box-shadow: var(--button-shadow-hover);
    }

    .btn--primary {
        background: var(--color-dodger-blue);
        color: var(--color-white);
    }

    .btn--secondary {
        background: var(--color-white);
        color: var(--color-dodger-blue);
    }

    .btn--tertiary {
        background: #f4f4fd;
        color: var(--color-dodger-blue);
    }

    .btn--tertiary, .btn--tertiary:hover {
        -webkit-box-shadow: none;
        box-shadow: none;
    }

    .btn--tertiary:hover {
        background-color: #ececf9;
        -webkit-transform: none;
        transform: none;
    }

    .btn--small {
        letter-spacing: -.02em;
        text-transform: none;
        font-size: 15px;
        padding: 5px 12px 7px;
        font-weight: 500;
        border-radius: 8px;
        min-height: 38px;
    }

    stencil-route-link:hover {
        cursor: pointer;
    }

    .list--unstyled {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }

    .list--icon li {
        position: relative;
        padding-left: 28px;
    }

    .list--icon app-icon {
        position: absolute;
        top: 0;
        left: 0;
    }

    code {
        font-weight: 400;
        font-family: SFMono-Regular, Lucida Console, Monaco, monospace;
        font-size: 14px;
    }

    p code, ul code {
        font-size: 14px;
        padding: 2px 6px 3px;
        background-color: var(--color-whisper);
        color: var(--color-woodsmoke);
        border-radius: 3px;
    }

    h1 code, h2 code, h3 code {
        font-size: .8em;
        font-weight: 700;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
    }

    h1, h1 a {
        font-size: 32px;
        line-height: 38px;
        font-weight: 600;
        letter-spacing: -.012em;
        color: var(--color-woodsmoke);
    }

    h2, h2 a {
        font-size: 20px;
    }

    h2, h2 a, h3, h3 a {
        font-weight: 700;
        color: var(--color-woodsmoke);
    }

    h3, h3 a {
        font-size: 17px;
    }

    h4, h4 a {
        font-size: 14px;
        margin-top: 32px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: .04em;
    }

    h4, h4 a, p, ul {
        color: var(--color-gunpowder);
    }

    p, ul {
        font-size: 15px;
        line-height: 1.8;
        margin: 14px 0;
    }

    ul {
        padding: 0 0 0 16px;
    }

    p a, ul a {
        -webkit-transition: border .3s;
        transition: border .3s;
        color: var(--color-dodger-blue);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        font-weight: 500;
    }

    p a:hover, ul a:hover {
        border-bottom-color: var(--color-dodger-blue-hover);
    }

    * {
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
    }

    ::-moz-selection {
        background: var(--color-whisper);
    }

    ::-moz-selection, ::selection {
        background: var(--color-whisper);
    }
`