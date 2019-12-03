/**
 * @file
 * AbstractRunner.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import * as fs from 'fs';
import { path as appRoot } from 'app-root-path';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import {
    Compiler, Configuration, HotModuleReplacementPlugin, Stats
} from 'webpack';
import { inject, injectable } from 'inversify';
import * as WebpackDevServer from 'webpack-dev-server';
import ConfigLoaderInterface from '../config/ConfigLoaderInterface';
import PathInterface from '../utility/PathInterface';
import StringInterface from '../utility/StringInterface';
import Services from '../container/services';
import 'reflect-metadata';
import ConfigDataInterface from '../config/ConfigDataInterface';
import * as util from 'util';


import WebpackNotifierPlugin = require('webpack-notifier');
import webpack = require('webpack');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

/**
 * Class AbstractWebpackRunner
 */
@injectable()
export default class WebpackRunner {

    /**
     * Local path utility instance
     */
    protected path: PathInterface;

    /**
     * Local string utility instance
     */
    protected string: StringInterface;

    /**
     * The default server host
     *
     * @type {string}
     */
    private serverDefaultHost: string = 'localhost';

    /**
     * The default server port
     *
     * @type {number}
     */
    private serverDefaultPort: number = 8080;

    /**
     * AbstractWebpackRunner constructor
     *
     * @param {PathInterface} path
     * @param {StringInterface} string
     */
    constructor(
        @inject(Services.Path) path: PathInterface,
        @inject(Services.String) string: StringInterface
    ) {
        this.path = path;
        this.string = string;
    }

    /**
     * Runs a webpack build for the loaded config
     *
     * @param {ConfigLoaderInterface} config
     *     The config to run webpack from
     * @param {boolean} devMode
     *     Run the build in development mode?
     *     This affects the generated webpack config object.
     * @param {(error: Error, stats: webpack.Stats) => void} callback
     *     A compiler run callback, can be used to handled cli output etc.
     *
     * @return void
     */
    // eslint-disable-next-line max-len
    public build(config: ConfigLoaderInterface, devMode: boolean, callback?: (error: Error, stats?: Stats) => void): void {
        const webpackCompiler: Compiler = webpack(this.generateConfig(
            config.getData(),
            this.path.internal.dirname(config.getFilePath()),
            devMode,
            false
        ));

        webpackCompiler.run((error: Error, stats: Stats): void => {
            if (typeof callback === 'function') {
                callback(error, stats);
            }
            else {
                process.exit(WebpackRunner.compilerCliOutput(error, stats));
            }
        });
    }

    /**
     * Runs a webpack watcher for the loaded config
     *
     * @param {ConfigLoaderInterface} config
     *     The config to run webpack from
     * @param {boolean} devMode
     *     Run the build in development mode?
     *     This affects the generated webpack config object.
     * @param {(error: Error, stats?: webpack.Stats) => void} callback
     *     A compiler run callback, can be used to handled cli output etc.
     *
     * @return void
     */
    // eslint-disable-next-line max-len
    public watch(config: ConfigLoaderInterface, devMode: boolean, callback?: (error: Error, stats?: Stats) => void): void {
        const configData = config.getData();

        // Generate the webpack config
        const webpackConfig = this.generateConfig(
            configData,
            this.path.internal.dirname(config.getFilePath()),
            devMode,
            false
        );

        // Add the notifier plugin to webpack config
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        webpackConfig.plugins.push(new WebpackNotifierPlugin({
            ...{
                title: this.path.internal.basename(this.path.internal.dirname(config.getFilePath())),
                alwaysNotify: false,
                excludeWarnings: false,
                skipFirstNotification: true,
                sound: true
            },
            ...configData.options.webpack_notifier
        }));

        // Create a webpack watch options object
        const webpackWatchOptions = {
            ...{
                aggregateTimeout: 300
            },
            ...configData.options.watch
        };

        const webpackCompiler: Compiler = webpack(webpackConfig);
        webpackCompiler.watch(webpackWatchOptions, (error: Error, stats: Stats): void => {
            if (typeof callback === 'function') {
                callback(error, stats);
            }
            else {
                WebpackRunner.compilerCliOutput(error, stats);
            }
        });
    }

    /**
     * Runs a webpack dev server for the loaded config
     *
     * @param {ConfigLoaderInterface} config
     *     The config to run webpack from
     * @param {boolean} devMode
     *     Run the server in development mode?
     *     This affects the generated webpack config object.
     * @param {(error: Error) => void} callback
     *     A server error handler callback
     */
    public server(config: ConfigLoaderInterface, devMode: boolean, callback?: (error: Error) => void): void {
        const configData = config.getData();

        // Generate the webpack config
        const webpackConfig = this.generateConfig(
            configData,
            this.path.internal.dirname(config.getFilePath()),
            devMode,
            true
        );

        // Add the hot module replacement plugin to the generated config
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        webpackConfig.plugins.push(new HotModuleReplacementPlugin());

        // Build the webpack compiler
        const webpackCompiler: Compiler = webpack(webpackConfig);

        // Get the cleaned up server options
        // const serverOptions = this.getServerOptions(configData);

        // serverOptions.contentBase = this.path.internal.dirname(config.getFilePath());
        // serverOptions.publicPath = `http://${serverOptions.host}:${serverOptions.port}/`;

        const serverOptions = {
            host: 'localhost',
            compress: false,
            disableHostCheck: true,
            hot: true,
            hotOnly: true,
            port: 1234,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            contentBase: this.path.internal.dirname(config.getFilePath()),
            publicPath: 'http://localhost:1234/'
        };

        const webpackDevServer = new WebpackDevServer(webpackCompiler, serverOptions);
        webpackDevServer.listen(
            serverOptions.port || this.serverDefaultPort,
            serverOptions.host || this.serverDefaultHost,
            (error: Error|undefined): void => {
                if (error) {
                    if (typeof callback === 'function') {
                        callback(error);
                    }
                    else {
                        throw error;
                    }
                }
            }
        );
    }

    /**
     * Generates a webpack configuration object
     *
     * @param {ConfigDataInterface} configData
     *     The config to use in generation
     * @param {string} resolveRoot
     *     The path to the config file the config data was loaded from.
     *     Used as build context, default notifier title etc.
     * @param {boolean} devMode
     *     Generate the configuration in development mode.
     * @param {boolean} forServer
     *     Generate the configuration for a server
     *
     * @returns {Configuration}
     */
    // eslint-disable-next-line max-len
    protected generateConfig(configData: ConfigDataInterface, resolveRoot: string, devMode: boolean, forServer: boolean): Configuration {
        // Set config related variables
        // Clean up path/directory name parameters
        const sourceRoot = this.string.trimRight(configData.structure.source_root, '/');
        const outputRoot = this.string.trimRight(configData.structure.output_root, '/');
        const fontDir = this.string.trimRight(configData.structure.font_dir, '/');
        const imageDir = this.string.trimRight(configData.structure.image_dir, '/');

        // Determine module resolution folders, this module may exist in a state
        // where it's dependencies exist in the top level project node_modules
        // directory or nested within it's own package directory. If its the
        // latter than the nested directory must be searched when resolving
        // modules. Use this for both loaders and modules.
        // todo: Add resolve alias for the resolve root
        const resolveModules = ['node_modules'];
        if (fs.existsSync(this.path.internal.resolve(appRoot, 'node_modules'))) {
            resolveModules.unshift(this.path.internal.resolve(appRoot, 'node_modules'));
        }

        // Dynamic configuration bins
        const pluginArray = [];

        // Non server specific plugins
        // These are plugins that can be used in both dev and non dev builds
        // but not when a server is being used.
        if (!forServer) {
            // Default build plugins
            // These are plugins that can exist in dev mode, non dev mode and server
            // config build.
            pluginArray.push(new FixStyleOnlyEntriesPlugin());

            // Extract styles to css files
            // style-loader used for server so we dont want this is being
            // build for a server
            pluginArray.push(new MiniCssExtractPlugin({
                filename: '[name].css'
            }));
        }

        // Server specific plugins
        // These are plugins that can be used in both dev and non dev builds
        // but only when a server is being used
        if (forServer) {
            pluginArray.push(new HotModuleReplacementPlugin());
        }

        // Add the webpack clean plugin as required
        // If not dev mode and default build specifies clean
        // or, is dev mode and dev settings specify clean
        if ((!devMode && configData.build.clean) || (devMode && configData.develop.clean)) {
            pluginArray.push(new CleanWebpackPlugin());
        }

        // Build the public path as required
        // Server public paths will be the accessible url of the server with
        // content being server from it's root. Non server builds take the
        // configuration value for the context (dev vs non dev) before
        // cleaning and ensuring it is in the right format (ends with '/')
        let publicPathComputed: string;
        if (forServer) {
            const serverOptions = this.getServerOptions(configData);
            const protocol = (serverOptions.https) ? 'https' : 'http';

            publicPathComputed = `${protocol}://${serverOptions.host}:${serverOptions.port}/`;
        }
        else {
            publicPathComputed = this.string.trimRight(
                this.path.absoluteOrResolvedFrom(
                    (!devMode)
                        ? configData.build.publicPath
                        : configData.develop.publicPath,
                    resolveRoot
                ),
                '/'
            );

            publicPathComputed += '/';
        }

        // Build and return the webpack config object
        const webpackConfig: Configuration = {
            mode: (!devMode) ? 'production' : 'development',
            context: resolveRoot,
            entry: (!devMode) ? configData.build.entry : configData.develop.entry,
            output: {
                path: this.path.absoluteOrResolvedFrom(outputRoot, resolveRoot),
                publicPath: publicPathComputed
            },
            resolve: {
                alias: {
                    '@': this.path.absoluteOrResolvedFrom(sourceRoot, resolveRoot)
                },
                modules: resolveModules
            },
            resolveLoader: {
                modules: resolveModules
            },
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        use: [
                            {
                                // Server uses style loader, everything else used css extraction
                                loader: (!forServer) ? MiniCssExtractPlugin.loader : 'style-loader'
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: devMode // source maps only enabled in dev mode
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: devMode // source maps only enabled in dev mode
                                }
                            }
                        ]
                    },
                    {
                        // (images?|${imageDir}).*\\.(jpe?g|png|gif|svg|webp)$
                        test: this.path.toRegex(imageDir, '(images?|', ').*\\.(jpe?g|png|gif|svg|webp)$', 'i'),
                        exclude: /fonts?/i,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[path][name].[ext]',
                                    // eslint-disable-next-line max-len
                                    outputPath: (url: string, resourcePath: string, context: string): string => this.handleMappedAssets(
                                        configData.structure.image_dir,
                                        configData.structure.image_mappings,
                                        url,
                                        resourcePath
                                    )
                                }
                            }
                        ]
                    },
                    {
                        // (fonts?|${fontDir}).*\\.(woff|woff2|eot|ttf|otf|svg)$$
                        test: this.path.toRegex(fontDir, '(fonts?|', ').*\\.(woff|woff2|eot|ttf|otf|svg)$', 'i'),
                        exclude: /images?/,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[path][name].[ext]',
                                    // eslint-disable-next-line max-len
                                    outputPath: (url: string, resourcePath: string, context: string): string => this.handleMappedAssets(
                                        configData.structure.font_dir,
                                        configData.structure.font_mappings,
                                        url,
                                        resourcePath
                                    )
                                }
                            }
                        ]
                    }
                ]
            },
            plugins: pluginArray,
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            devtool: (!devMode) ? false : configData.develop.devtool // no sourcemaps in production
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        /*
        console.log(util.inspect(webpackConfig, {
            showHidden: true,
            depth: null,
            colors: true
        }));
         */

        return webpackConfig;
    }

    /**
     * Cleans and returns server options from config data
     *
     * @return {Configuration}
     */
    protected getServerOptions(config: ConfigDataInterface): WebpackDevServer.Configuration {
        return {
            ...{
                host: this.serverDefaultHost,
                port: this.serverDefaultPort
            },
            ...config.options.server
        };
    }

    /**
     * Centralises the handling of mapped assets
     *
     * @param {string} rootDir
     *     The root dir to use for assets
     * @param {object} mappings
     *     The mappings object
     *     Keys are the patterns, values are the mapped dir
     * @param {string} url
     *     The assets url
     * @param {string} resourcePath
     *     The path to the actual assets
     *
     * @returns {string}
     */
    // eslint-disable-next-line max-len
    protected handleMappedAssets(rootDir: string, mappings: {[key: string]: string}, url: string, resourcePath: string): string {
        const BreakException = {}; // Used to break out of process loops
        let assetUrl = url;

        // Loop each pattern in the mappings object, check whether the asset to
        // load contains the pattern (path substring) within it's url, if it does,
        // rewrite the path of the asset to use the mapped directory rather than it's
        // actual source directory.
        //
        // Run this in a try and catch to allow the process to exit the loop early
        // when required.
        try {
            Object.keys(mappings).forEach((pattern) => {
                if (resourcePath.includes(pattern)) {
                    const mappedDir = this.string.trimRight(mappings[pattern], '/');

                    assetUrl = `${mappedDir}/${this.path.internal.basename(url)}`;

                    throw BreakException; // Break the loop
                }
            });
        }
        catch (error) {
            if (error !== BreakException) {
                throw error;
            }
        }

        // If the url points to a file that wont sit under the root directory
        // alter the url so that it is saved under the root directory
        if (!assetUrl.startsWith(`${rootDir}/`)) {
            assetUrl = `${rootDir}/${assetUrl}`;
        }

        return assetUrl;
    }

    /**
     * Handles compiler cli output
     *
     * Provide accessible means of replicating webpack cli output's
     *
     * @param {Error} error
     *     The error object
     * @param {Stats} stats
     *     The webpack stats object
     *
     * @returns {number}
     */
    public static compilerCliOutput(error: Error, stats: Stats): number {
        /* eslint-disable @typescript-eslint/ban-ts-ignore, no-console */
        if (error) {
            console.error(error.stack || error);
            // @ts-ignore
            if (error.details) {
                // @ts-ignore
                console.error(error.details);
            }

            return 1;
        }

        if (stats.hasErrors()) {
            console.error(stats.toString({
                colors: true
            }));

            return 1;
        }

        if (stats.hasWarnings()) {
            console.warn(stats.toString({
                colors: true
            }));
        }
        else {
            console.log(stats.toString({
                colors: true
            }));
        }

        return 0;
    }

}
