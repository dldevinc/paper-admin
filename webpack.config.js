const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge").default;
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const SOURCE_DIR = path.resolve(__dirname, "paper_admin/static/paper_admin/src");
const DIST_DIR = path.resolve(__dirname, "paper_admin/static/paper_admin/dist");

// Базовый объект, чьи свойства наследуют все конфигурации.
let baseConfig = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /[\\/]node_modules[\\/]/,
                loader: "babel-loader",
                options: {
                    cacheDirectory: path.resolve(__dirname, "cache")
                }
            },

            {
                test: require.resolve("jquery"),
                loader: "expose-loader",
                options: {
                    exposes: ["$", "jQuery"]
                }
            },

            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "fast-css-loader",
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: "postcss-loader"
                    }
                ]
            },

            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "fast-css-loader",
                        options: {
                            importLoaders: 2
                        }
                    },
                    {
                        loader: "postcss-loader"
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                includePaths: [path.resolve(SOURCE_DIR, "css"), path.resolve(__dirname, "node_modules")]
                            }
                        }
                    }
                ]
            },

            {
                test: /\.(jpe?g|png|gif|woff2?|ttf|eot|svg)$/i,
                type: "asset/resource"
            },

            // https://webpack.js.org/guides/asset-modules/#replacing-inline-loader-syntax
            {
                resourceQuery: /raw/,
                type: "asset/source"
            }
        ]
    },
    resolve: {
        modules: [SOURCE_DIR, "node_modules"]
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new webpack.ProgressPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css"
        }),
    ],
    optimization: {
        moduleIds: "deterministic",
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
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
                                    plugins: [
                                        {
                                            name: "preset-default",
                                            params: {
                                                overrides: {
                                                    removeViewBox: false
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        ]
                    }
                }
            })
        ]
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

// Конфигурация для критических ресурсов, которые будут загружены в блокирующем
// режиме в тэге <head>.
let criticalConfig = merge(baseConfig, {
    entry: {
        critical: path.resolve(SOURCE_DIR, "js/critical.js"),
    },
    output: {
        path: path.resolve(DIST_DIR),
        publicPath: "/static/paper_admin/dist/",
        filename: "[name].[contenthash].js",
        assetModuleFilename: "assets/[name][ext][query]",
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateContent: ({ htmlWebpackPlugin }) => (
                `${htmlWebpackPlugin.tags.headTags.join("\n")}` +
                `${htmlWebpackPlugin.tags.bodyTags.join("\n")}`
            ),
            filename: path.resolve(__dirname, "paper_admin/templates/paper_admin/app.critical.html"),
            inject: false,
            scriptLoading: "blocking",
            chunks: ["critical"]
        }),
    ]
});

// Конфигурация общих ресурсов, которые будут загружены в defer-режиме.
let commonConfig = merge(baseConfig, {
    entry: {
        app: path.resolve(SOURCE_DIR, "js/app.js"),
    },
    output: {
        path: path.resolve(DIST_DIR),
        publicPath: "/static/paper_admin/dist/",
        filename: "[name].[contenthash].js",
        assetModuleFilename: "assets/[name][ext][query]",
        library: {
            type: "window",
            export: "default",
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateContent: ({ htmlWebpackPlugin }) => `${htmlWebpackPlugin.tags.headTags.join("\n")}`,
            filename: path.resolve(__dirname, "paper_admin/templates/paper_admin/app.styles.html"),
            inject: false,
            scriptLoading: "blocking",
            chunks: ["app"]
        }),
        new HtmlWebpackPlugin({
            templateContent: ({ htmlWebpackPlugin }) => `${htmlWebpackPlugin.tags.bodyTags.join("\n")}`,
            filename: path.resolve(__dirname, "paper_admin/templates/paper_admin/app.scripts.html"),
            inject: false,
            scriptLoading: "blocking",
            chunks: ["app"]
        }),
    ],
    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                defaultVendors: {
                    priority: 20,
                    test: /[\\/]node_modules[\\/]/,
                    name: function (module) {
                        let modulePath = module.nameForCondition();
                        let match = modulePath.match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/);
                        if (match) {
                            let packageName = match[1].replace("@", "");
                            return `npm.${packageName}`;
                        } else {
                            throw new Error(`Invalid module path: ${modulePath}`);
                        }
                    }
                },
                innerVendors: {
                    priority: 10,
                    test: /[\\/]css[\\/]vendors[\\/].*\.s?css$/,
                    name: function (module) {
                        let modulePath = module.nameForCondition();
                        let verdorMatch = modulePath.match(/[\\/]css[\\/]vendors[\\/](.*?)(?:[\\/]|$)/);
                        if (verdorMatch) {
                            return `vendors.${path.basename(verdorMatch[1], ".scss")}`;
                        }
                    }
                },
                styles: {
                    test: /\.s?css$/,
                    name: function (module) {
                        let modulePath = module.nameForCondition();
                        let verdorMatch = modulePath.match(/[\\/]css[\\/]vendors[\\/](.*?)(?:[\\/]|$)/);
                        if (verdorMatch) {
                            return `vendors.${path.basename(verdorMatch[1], ".scss")}`;
                        } else {
                            return "vendors.app";
                        }
                    }
                }
            }
        },
    },
});

module.exports = (env, argv) => {
    const mode = argv.mode === "production" ? "production" : "development";
    commonConfig.mode = criticalConfig.mode = mode;

    if (mode === "production") {
        commonConfig.devtool = criticalConfig.devtool = "source-map";
    } else {
        commonConfig.devtool = criticalConfig.devtool = "eval";
    }

    if (mode === "development") {
        commonConfig.cache = criticalConfig.cache = {
            type: "filesystem",
            cacheDirectory: path.resolve(__dirname, "cache"),
            buildDependencies: {
                config: [__filename]
            }
        }
    }

    if (mode === "production") {
        commonConfig.optimization.minimizer = criticalConfig.optimization.minimizer = [
            new TerserPlugin({
                parallel: true
            }),
            new CssMinimizerPlugin({})
        ]
    }

    return [criticalConfig, commonConfig];
};
