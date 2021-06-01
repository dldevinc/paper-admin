const path = require("path");
const webpack = require("webpack");
const pixrem = require("pixrem");
const autoprefixer = require("autoprefixer");
const { extendDefaultPlugins } = require("svgo");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");

const SOURCE_DIR = path.resolve(__dirname, "paper_admin/static/paper_admin/src");
const DIST_DIR = path.resolve(__dirname, "paper_admin/static/paper_admin/dist");


let config = {
    entry: {
        app: path.resolve(SOURCE_DIR, "js/app.js"),
    },
    output: {
        clean: true,
        path: path.resolve(DIST_DIR),
        publicPath: "/static/paper_admin/dist/",
        filename: "[name].[contenthash].js",
        assetModuleFilename: "assets/[name][ext][query]",
        library: {
            type: "window"
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /[\\/]node_modules[\\/]/,
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
                }, {
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
                                path.resolve(SOURCE_DIR, "css"),
                                path.resolve(__dirname, "node_modules"),
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
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css"
        }),
        new ImageMinimizerPlugin({
            minimizerOptions: {
                plugins: [
                    [
                        "gifsicle",
                        {
                            interlaced: true,
                            optimizationLevel: 3
                        }
                    ],
                    [
                        "mozjpeg",
                        {
                            progressive: true
                        }
                    ],
                    [
                        "optipng",
                        {
                            optimizationLevel: 7
                        }
                    ],
                    [
                        "svgo",
                        {
                            plugins: extendDefaultPlugins([
                                {
                                    name: 'removeViewBox',
                                    active: false
                                },
                            ]),
                        },
                    ],
                ]
            }
        }),
        new HtmlWebpackPlugin({
            templateContent: ({htmlWebpackPlugin}) =>
                `${htmlWebpackPlugin.tags.headTags.join("\n")}`,
            filename: path.resolve(__dirname, "paper_admin/templates/paper_admin/app.head.html"),
            inject: false,
            scriptLoading: 'blocking',
            chunks: ["app"]
        }),
        new HtmlWebpackPlugin({
            templateContent: ({htmlWebpackPlugin}) =>
                `${htmlWebpackPlugin.tags.bodyTags.join("\n")}`,
            filename: path.resolve(__dirname, "paper_admin/templates/paper_admin/app.body.html"),
            inject: false,
            scriptLoading: "blocking",
            chunks: ["app"]
        })
    ],
    optimization: {
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                defaultVendors: {
                    priority: 20,
                    test: /[\\/]node_modules[\\/]/,
                    name: function(module) {
                        let packageName = module.context.match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/)[1];
                        return `npm.${packageName.replace('@', '')}`;
                    }
                },
                innerVendors: {
                    priority: 10,
                    test: /[\\/]css[\\/]vendors[\\/].*\.s?css$/,
                    name: function(module) {
                        let modulePath = module.nameForCondition();
                        let verdorMatch = modulePath.match(/[\\/]css[\\/]vendors[\\/](.*?)(?:[\\/]|$)/);
                        if (verdorMatch) {
                            return `vendors.${path.basename(verdorMatch[1], ".scss")}`;
                        }
                    }
                },
                styles: {
                    test: /\.s?css$/,
                    name: function(module) {
                        let modulePath = module.nameForCondition();
                        let verdorMatch = modulePath.match(/[\\/]css[\\/]vendors[\\/](.*?)(?:[\\/]|$)/);
                        if (verdorMatch) {
                            return `vendors.${path.basename(verdorMatch[1], ".scss")}`;
                        } else {
                            return "vendors.app"
                        }
                    }
                }
            }
        },
    },
    watchOptions: {
        aggregateTimeout: 2000,
        ignored: ["**/node_modules"]
    },
    stats: {
        assets: false,
        chunks: true
    }
}


module.exports = (env, argv) => {
    config.mode = (argv.mode === "production") ? "production" : "development";

    if (config.mode === "production") {
        config.devtool = "source-map";
    } else {
        config.devtool = "eval";
    }

    if (config.mode === "development") {
        config.cache = {
            type: "filesystem",
            cacheDirectory: path.resolve(__dirname, "cache"),
            buildDependencies: {
                config: [__filename]
            }
        }
    }

    if (config.mode === "production") {
        config.optimization.minimizer = [
            new TerserPlugin({
                parallel: true,
            }),
            new CssMinimizerPlugin({})
        ];
    }

    return config;
};
