


const app =
    ['div', {style: 'width: 100%; height:100%'},
        ['nav', {className: '.myNav'},
            ['div', {className: 'flex'},
                ['button', {onClick: () => 'dosomething'},
                    'click me'
                ]
            ]
        ],
        ['main', {},
            [`div`, {path: '/'}],
            ['div', {path: '/about'}],
            ['div', {path: '/list'}]
        ],
        ['footer']
    ];

const cat = (arr) => [].concat(...arr);

const render = (ray, parent) => {
    const mount = parent ? (el => parent.appendChild(el)) : (el => el);

    const [type, props, ...children] = ray;

    console.log(type, props, children);

}

render(app)

console.log(JSON.stringify({...app}, null, 4))



//https://github.com/jballant/webpack-strip-block/blob/master/index.js

/* jss:start */
const styles = (theme)=>({
    ':host':{
        width: '100%'
    },
});
/* jss:end */


