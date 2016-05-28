var path = require('path'),
    webpack = require('webpack'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"), // Extract text from bundle into a file
    precss = require('precss'), // use Sass-like markup in your CSS files
    autoprefixer = require('autoprefixer'), // add vendor prefixes to CSS rules
    postcssSprites = require('postcss-sprites'), // generates spritesheets from your stylesheets
    postcssImport = require('postcss-import'), // inline @import rules content
    HtmlWebpackPlugin = require('html-webpack-plugin')// Simplifies creation of HTML files
    
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin,
    sprites = postcssSprites.default

// the path relative to the root directory
var _AP = function(){
    var args = Array.prototype.slice.call(arguments);
    args.unshift(__dirname)
    return path.resolve.apply(this, args)
}

var _defualtAppPath = 'todo'
var config = {
    context: _AP(_defualtAppPath), // path.resolve(__dirname, _defualtAppPath)
    entry: {
        'bundle':"./src/js/entry.js",
         vendor : ['jquery','underscore', 'backbone']
    },
    output: {
        path: _AP(_defualtAppPath, 'build'),
        publicPath: '/build/',
        filename: 'js/bundle.js'
    },
    resolve: { alias: {
         "jquery": _AP('library/js/', 'zepto.js') // or jquery.js for PC
    }},
    plugins: [
        new webpack.ProvidePlugin({
            _: 'underscore',
            Backbone: 'backbone'
        }),
        new CommonsChunkPlugin('vendor','js/vendor.js'),
        new ExtractTextPlugin("css/app.css", {
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            title: 'TODO',
            hash:true,
            favicon: 'src/favicon.ico',
            template: './src/template/index.hdb',
            files:{
                'css':['css/app.css']
            }
        })
    ],
     module: {
        loaders: [
            {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
                loader: 'url-loader?limit=10&name=img/[hash:6].[ext]'
            },
            {
                test: /\.scss|\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', ['css-loader?minimize', 'postcss-loader', 'sass-loader'])
            },
            {
                test: /\.html$/,
                loader: "html-loader"
            },
            {
                test: /\.hdb$/,
                loader: "handlebars-loader",
                query:{
                    helperDirs: [
                        _AP(_defualtAppPath,"src/template/helpers")
                    ]
                }
            }
        ]
    },
    postcss: function(){
        return [precss, autoprefixer,
            postcssImport({
                addDependencyTo: webpack
            }),
            sprites({
                stylesheetPath: _defualtAppPath + '/build/css',
                spritePath:  _defualtAppPath + '/src/img/',
                relativeTo: 'rule',
                retina: true,
                padding: 3,
                filterBy: function(image){
                    if (!/\.png$/.test(image.url)) {
                        return Promise.reject();
                    }
                    if(image.url.indexOf('icon') == -1){ // sprite images
                        return Promise.reject();
                    }
                    return Promise.resolve();
                }
            })
        ]
    },
    devServer: {
        port:3000,
        contentBase: './' + _defualtAppPath
    }
}

module.exports = config;
