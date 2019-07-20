import {element} from "../_modules/finalizing/Component";
import {createElement, Fragment} from "../_modules/finalizing/vdom";
import {cvar} from "../styles/theme";
import {insertStyleSheet} from "../_modules/finalizing/insertStyleSheet";

// insertStyleSheet(':root{--success:green')

export default element('landing-page', () => (
    <Fragment>
        <style>
            {//language=CSS format=true`
                `


            `}
        </style>
        <h1>Welcom to the landing page</h1>
    </Fragment>
));