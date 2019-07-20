const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/*
    @babel/plugin-proposal-object-rest-spread
     @babel/plugin-proposal-decorators
     @babel/plugin-proposal-class-properties
     ,
    [
      "@babel/plugin-transform-destructuring",
      {
        "loose": false
      }
    ],
    [
      "@babel/plugin-proposal-object-rest-spread",
      {
        "useBuiltIns": true
      }
    ],
    [
      "@babel/plugin-proposal-decorators"
    ]

    ,
    [
      "@babel/plugin-proposal-class-properties",
      {
        "loose": true
      }
    ]
 */


module.exports = {
    devtool: 'cheap-module-source-map',
    module: {
        rules: [

            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {minimize: true}
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.(mjs|js|jsx)$/,
                exclude: /node_modules/,
                loader: [
                    'uglify-template-string-loader',
                    'babel-loader'
                ]
            }
        ],

    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
    ]
};