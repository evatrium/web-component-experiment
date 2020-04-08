import {Elemental} from "../../src";

const styles =  // language=CSS format=true
    jcss`
        :host {
            display: block;
            will-change: opacity, height;
            width: 100%;
            transition: all .3s cubic-bezier(0, 0.91, 0.58, 1);
            height: 0;
            opacity: 1;
            overflow: hidden;
        }
    `;

const updateStyle = ({style, props: {expanded, collapsedHeight}, scrollHeight}) =>
    Object.assign(style, {
        height: (expanded ? scrollHeight : (collapsedHeight || 0)) + 'px',
        opacity: (expanded ? 1 : 0)
    });

export class Expander extends Elemental {
    static shadow = true;
    static styles = styles;
    static propTypes = {
        expanded: {
            type: Boolean,
            reflect: true
        },
        collapsedHeight: Number,
    };

    didMount() {
        updateStyle(this);
    }

    didUpdate() {
        updateStyle(this);
    }

    static template = `<slot> </slot>`
}

customElements.define('elemental-expander', Expander);


const container = document.getElementById("container");

/*

    ----------- really simple example made in like 5 min ---------------------

 */
customElements.define('elemental-example', class extends Elemental {
    static proxyRefs = true;

    static styles = /*language=CSS*/ `
    elemental-example{
        display: block;
        width: 100%;
    }
     #btn{
        display:block
    }
    elemental-expander{
        background: aliceblue;
        width: 50%;
        margin: 0 auto;
        text-align: center;
        font-family: -apple-system, Helvetica;
    }
    `;

    didMount() {
        const {btn, exp} = this.refs;

        btn.onclick = () => {
            exp.expanded = !exp.expanded;
        }
    }

    static template = `
    <button id="btn">
        toggle expand
    </button>
    
    <elemental-expander id="exp">
        <h1>expanded!!!!!</h1>
    </elemental-expander>

`;
});


container.appendChild(document.createElement('elemental-example'));
