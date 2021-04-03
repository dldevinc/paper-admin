const path = require("path");
const webpack = require("webpack");
const pixrem = require("pixrem");
const autoprefixer = require("autoprefixer");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");

const SOURCE_DIR = "paper_admin/static/paper_admin/src";
const DIST_DIR = "paper_admin/static/paper_admin/dist";


module.exports = {
    devtool: "source-map",
    mode: "production",
    entry: {
        app: path.resolve(SOURCE_DIR, "js/app.js"),
    },
    output: {
        path: path.resolve(DIST_DIR),
        publicPath: "/static/paper_admin/dist/",
        filename: "[name].min.js",
        assetModuleFilename: "assets/[name][ext][query]"
    },
    cache: {
        type: "filesystem",
        cacheDirectory: path.resolve(__dirname, "cache")
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
                            cacheDirectory: path.resolve(__dirname, "cache")
                        }
                    }
                ]
            },
            {
                test: require.resolve("jquery"),
                loader: "expose-loader",
                options: {
                    exposes: ["$", "jQuery"],
                }
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
                                path.resolve(SOURCE_DIR, "css")
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
    resolve: {
        modules: [SOURCE_DIR, "node_modules"],
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new webpack.ProgressPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].min.css"
        }),
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: function(module, chunks, cacheGroupKey) {
                        const allChunksNames = chunks.map((item) => item.name).join("~");
                        return `vendors-${allChunksNames}`;
                    },
                    chunks: "all"
                }
            }
        },
        minimizer: [
            new TerserPlugin({

            }),
            new CssMinimizerPlugin({

            })
        ]
    }
};
