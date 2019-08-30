const path = require('path');
const webpack = require('webpack');
const pixrem = require('pixrem');
const autoprefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const SOURCE_DIR = 'paper_admin/static/paper_admin/src';
const DIST_DIR = 'paper_admin/static/paper_admin/dist';


module.exports = {
    devtool: 'source-map',
    mode: 'production',
    entry: {
        app: path.resolve(`${SOURCE_DIR}/js/app.js`),
    },
    output: {
        path: path.resolve(`${DIST_DIR}`),
        publicPath: '/static/paper_admin/dist/',
        filename: '[name].bundle.min.js',
        chunkFilename: '[name].chunk.min.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: 'cache'
                        }
                    }
                ]
            },
            {
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: 'jQuery'
                }, {
                    loader: 'expose-loader',
                    options: '$'
                }]
            },

            {
                test: /\.css$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                }, {
                    loader: 'fast-css-loader'
                }]
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                },
                {
                    loader: 'fast-css-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            pixrem(),
                            autoprefixer()
                        ]
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            path.resolve(`${SOURCE_DIR}/css/`)
                        ]
                    }
                }]
            },
            {
                test: /\.(woff|woff2)$/i,
                loader: 'file-loader',
                options: {
                    outputPath: function(url, resourcePath, context) {
                        const basename = path.basename(resourcePath);
                        const dirname = path.basename(path.dirname(resourcePath));
                        return path.join('fonts', dirname, basename);
                    }
                }
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'file-loader',
                options: {
                    name: 'image/[name].[ext]',
                }
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            'window.jQuery': "jquery"
        }),
        new MiniCssExtractPlugin({
            filename: '[name].min.css',
            chunkFilename: '[name].chunk.min.css',
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: 'cache',
                sourceMap: true,
                extractComments: true,
            }),
            new OptimizeCSSAssetsPlugin({

            })
        ]
    }
};
