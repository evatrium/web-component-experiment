// language=CSS format=true
export const fadeIn = css`
    :host {
        will-change: opacity;
        animation: fadein 300ms ease-in-out;
    }

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }`;