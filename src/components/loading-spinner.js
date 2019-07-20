import {createElement, Fragment} from "../_modules/finalizing/vdom";
import {element} from "../_modules/finalizing/Component";
import {theme} from "../styles/theme";


export const NavBar = element('nav-bar', {
    render: () => (
        <nav>
            <style>
                {// language=CSS format=true
                    css`

                        .loading {
                            position: relative;
                        }

                        .loadingIndicator {
                            display: block;
                            position: absolute;
                            border-radius: 50%;
                            border: 4px solid transparent;
                            border-top-color: #e0ebf3;
                            border-right-color: #e0ebf3;
                            animation: spin 300ms linear infinite;
                            z-index: 1002;
                            width: 100%;
                            height: 100%;
                        }

                        @keyframes spin {
                            from {
                                transform: rotate(0);
                            }
                            to {
                                transform: rotate(360deg);
                            }
                        }

                    `}
            </style>
            <slot></slot>
        </nav>
    )
});


export const LoadingSpinner = element('loading-spinner',{
    render:({size, className, containerHeight, ...rest}) => (
        <div className={cn(className, 'centerize flex all100', containerHeight && 'withContainer')} {...rest}>
            <div className="loading" style={{
                height: size ? size + 'px' : 75,
                width: size ? size + 'px' : 75,
            }}>
                <div className="loadingIndicator"/>
            </div>
        </div>
    )
});