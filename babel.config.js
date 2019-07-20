module.exports = {
    presets: [
        '@babel/preset-env',
    ],

    plugins: [
        ["postcss-template-literals", {
            "tag": "css",
            "replace": "",
            "plugins": [["autoprefixer"]]
        }],

        [
            "@babel/plugin-transform-react-jsx",
            {
                "pragma": "createElement",
                "pragmaFrag": "Fragment"
            }
        ],
        [
            "@babel/plugin-proposal-decorators",
            {
                "legacy": true
            }
        ],
        [
            "@babel/plugin-proposal-class-properties",
            {
                "loose": true
            }
        ],
        [
            "@babel/plugin-transform-destructuring",
            {
                "loose": true,
                "useBuiltIns": true
            }
        ],
        [
            "@babel/plugin-proposal-object-rest-spread",
            {
                "useBuiltIns": true
            }
        ],

    ]
};