import path from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";
import { merge } from "webpack-merge";
import TerserPlugin from "terser-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, "paper_admin/static/paper_admin/src");
const DIST_DIR = path.resolve(__dirname, "paper_admin/static/paper_admin/dist");

// Базовый объект, чьи свойства наследуют все конфигурации.
function getCommonConfig(devMode) {
    return {
        mode: devMode ? "development" : "production",
        devtool: devMode ? "eval" : "source-map",
        cache: devMode
            ? {
                  type: "filesystem",
                  cacheDirectory: path.resolve(__dirname, "cache"),
                  buildDependencies: {
                      config: [__filename]
                  }
              }
            : false,
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /[\\/]node_modules[\\/]/,
                    loader: "babel-loader",
                    options: devMode
                        ? {
                              cacheDirectory: path.resolve(__dirname, "cache")
                          }
                        : {}
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
                                    includePaths: [
                                        path.resolve(SOURCE_DIR, "css"),
                                        path.resolve(__dirname, "node_modules")
                                    ]
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
            })
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
            ].concat(
                devMode
                    ? []
                    : [
                          new TerserPlugin({
                              parallel: true
                          }),
                          new CssMinimizerPlugin({})
                      ]
            )
        },
        watchOptions: {
            aggregateTimeout: 2000,
            ignored: ["**/node_modules"]
        },
        stats: {
            assets: false,
            chunks: true
        }
    };
}

// Конфигурация для критических ресурсов, которые будут загружены в блокирующем
// режиме в тэге <head>.
function getCriticalConfig(devMode) {
    return merge(getCommonConfig(devMode), {
        entry: {
            critical: path.resolve(SOURCE_DIR, "js/critical.js")
        },
        output: {
            path: path.resolve(DIST_DIR),
            publicPath: "/static/paper_admin/dist/",
            filename: "[name].[contenthash].js",
            assetModuleFilename: "assets/[name][ext][query]"
        },
        plugins: [
            new HtmlWebpackPlugin({
                templateContent: ({ htmlWebpackPlugin }) =>
                    `${htmlWebpackPlugin.tags.headTags.join("\n")}` + `${htmlWebpackPlugin.tags.bodyTags.join("\n")}`,
                filename: path.resolve(__dirname, "paper_admin/templates/paper_admin/app.critical.html"),
                inject: false,
                scriptLoading: "blocking",
                chunks: ["critical"]
            })
        ]
    });
}

// Конфигурация общих ресурсов, которые будут загружены в defer-режиме.
function getAppConfig(devMode) {
    return merge(getCommonConfig(devMode), {
        entry: {
            app: path.resolve(SOURCE_DIR, "js/app.js")
        },
        output: {
            path: path.resolve(DIST_DIR),
            publicPath: "/static/paper_admin/dist/",
            filename: "[name].[contenthash].js",
            assetModuleFilename: "assets/[name][ext][query]",
            library: {
                type: "window",
                export: "default"
            }
        },
        plugins: [
            new HtmlWebpackPlugin({
                templateContent: ({ htmlWebpackPlugin }) =>
                    `${htmlWebpackPlugin.tags.headTags.join("\n")}\n` +
                    `${htmlWebpackPlugin.tags.bodyTags.join("\n")}\n`,
                filename: path.resolve(__dirname, "paper_admin/templates/paper_admin/app.head.html"),
                inject: false,
                chunks: ["app"]
            })
        ],
        optimization: {
            runtimeChunk: "single",
            splitChunks: {
                chunks: "all",
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
                    vendorStyles: {
                        priority: 10,
                        test: /[\\/]css[\\/]vendors[\\/].*\.s?css$/,
                        name: function (module) {
                            let modulePath = module.nameForCondition();
                            let vendorMatch = modulePath.match(/[\\/]css[\\/]vendors[\\/](.*?)(?:[\\/]|$)/);
                            if (vendorMatch) {
                                const filename = path.basename(vendorMatch[1], path.extname(vendorMatch[1]));
                                return `vendors.${filename}`;
                            }
                        }
                    },
                    appStyles: {
                        test: /\.s?css$/,
                        name: "app.styles"
                    }
                }
            }
        }
    });
}

export default (env, argv) => {
    const devMode = argv.mode !== "production";
    return [getCriticalConfig(devMode), getAppConfig(devMode)];
};
