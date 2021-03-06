const path = require("path");
const webpack = require("webpack");
const pixrem = require("pixrem");
const autoprefixer = require("autoprefixer");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const SOURCE_DIR = "paper_admin/static/paper_admin/src";
const DIST_DIR = "paper_admin/static/paper_admin/dist";


module.exports = {
    devtool: "source-map",
    mode: "production",
    entry: {
        app: path.resolve(`${SOURCE_DIR}/js/app.js`),
    },
    output: {
        path: path.resolve(`${DIST_DIR}`),
        publicPath: "/static/paper_admin/dist/",
        filename: "[name].bundle.min.js",
        chunkFilename: "[name].chunk.min.js",
        assetModuleFilename: "assets/[name][ext][query]"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: "cache"
                        }
                    }
                ]
            },
            {
                test: require.resolve("jquery"),
                use: [{
                    loader: "expose-loader",
                    options: {
                        exposes: ["$", "jQuery"],
                    }
                }]
            },

            {
                test: /\.css$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                }, {
                    loader: "fast-css-loader"
                }]
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                },
                {
                    loader: "fast-css-loader",
                    options: {
                        importLoaders: 2
                    }
                },
                {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: {
                            plugins: [
                                pixrem(),
                                autoprefixer()
                            ]
                        }
                    }
                },
                {
                    loader: "sass-loader",
                    options: {
                        sassOptions: {
                            includePaths: [
                                path.resolve(`${SOURCE_DIR}/css/`)
                            ]
                        }
                    }
                }]
            },
            {
                test: /\.(jpe?g|png|gif|woff2?|ttf|eot|svg)$/i,
                type: "asset/resource",
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].min.css",
            chunkFilename: "[name].chunk.min.css",
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({

            }),
            new CssMinimizerPlugin({

            })
        ]
    }
};
