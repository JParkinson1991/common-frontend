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
import ImageminWebpackPlugin from 'imagemin-webpack-plugin';
import { inject, injectable } from 'inversify';
import * as _ from 'lodash';
import * as WebpackDevServer from 'webpack-dev-server';
import ConfigLoaderInterface from '../config/ConfigLoaderInterface';
import PathInterface from '../utility/PathInterface';
import StringInterface from '../utility/StringInterface';
import Services from '../container/services';
import 'reflect-metadata';
import ConfigDataInterface from '../config/ConfigDataInterface';

import WebpackNotifierPlugin = require('webpack-notifier');
import webpack = require('webpack');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const globImporter = require('node-sass-glob-importer');

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
        const configData = config.getData();

        // Generate the webpack config
        const webpackConfig = this.generateConfig(
            configData,
            this.path.internal.dirname(config.getFilePath()),
            devMode,
            false
        );

        // Non development builds will have image minification applied if needed
        if (!devMode) {
            this.injectImagemin(webpackConfig, configData);
        }

        const webpackCompiler: Compiler = webpack(webpackConfig);
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

        // Inject the webpack notifier plugin
        // Depending on config values this method may do nothing
        this.injectNotifier(
            webpackConfig,
            configData,
            this.path.internal.basename(this.path.internal.dirname(config.getFilePath()))
        );

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

        // Inject the webpack notifier plugin
        // Depending on config values this method may do nothing
        this.injectNotifier(
            webpackConfig,
            configData,
            this.path.internal.basename(this.path.internal.dirname(config.getFilePath()))
        );

        // Determine public path
        const protocol = (configData.options.server.https || false) ? 'https' : 'http';
        const host = configData.options.server.host || this.serverDefaultHost;
        const port = configData.options.server.port || this.serverDefaultPort;

        // Grab the server options
        const serverOptions = {
            ...{
                // Defaults that allow to overrides
                host: this.serverDefaultHost,
                port: this.serverDefaultPort,
                contentBase: this.path.internal.dirname(config.getFilePath())
            },
            ...configData.options.server,
            ...{
                // Forced values
                publicPath: `${protocol}://${host}:${port}/`
            }
        };

        // Add the hot module replacement plugin if required
        if (serverOptions.hot) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            webpackConfig.plugins.push(new HotModuleReplacementPlugin());
        }

        WebpackDevServer.addDevServerEntrypoints(webpackConfig, serverOptions);

        const compiler = webpack(webpackConfig);
        const server = new WebpackDevServer(compiler, serverOptions);

        server.listen(port, host, (error: Error|undefined): void => {
            if (error) {
                if (typeof callback === 'function') {
                    callback(error);
                }
                else {
                    throw error;
                }
            }
        });
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
        /**
         * generateConfig() Pre Processing
         *
         * Pre webpack config object creation steps
         */

        // Set config related variables
        // Clean up path/directory name parameters
        const sourceRoot = this.string.trimRight(configData.structure.source_root, '/');
        const outputRoot = this.string.trimRight(configData.structure.output_root, '/');
        const fontDir = this.string.trimRight(configData.structure.font_dir, '/');
        const imageDir = this.string.trimRight(configData.structure.image_dir, '/');

        // Determine module resolve paths.
        // This package may exist where its dependencies exists in various
        // locations. The following ensures the current directory and parent
        // node_modules folders are searched. If a node_module directory exists
        // at the application root it is searched. If a node_modules directory
        // exists as a sibling of the resolve roo (usually the config file
        // location) it is searched
        let resolveModules = ['node_modules'];
        if (fs.existsSync(this.path.internal.resolve(appRoot, 'node_modules'))) {
            resolveModules.unshift(this.path.internal.resolve(appRoot, 'node_modules'));
        }
        if (fs.existsSync(this.path.internal.resolve(resolveRoot, 'node_modules'))) {
            resolveModules.unshift(this.path.internal.resolve(resolveRoot, 'node_modules'));
        }
        resolveModules = _.uniq(resolveModules);

        // Determine any resolve aliases
        const resolveAlias: { [key: string]: string } = {
            ...{
                __: resolveRoot,
                __src: sourceRoot
            },
            ...configData.options.aliases
        };
        Object.keys(resolveAlias).forEach((key: string) => {
            resolveAlias[key] = this.path.absoluteOrResolvedFrom(resolveAlias[key], resolveRoot);
        });

        // Determine build variables
        let { build } = configData;
        if (devMode) {
            // Blindly merge in the development config if required
            // this allows development settings to override build settings
            // No need to worry about extra properties (that dont exist in
            // build) from develop data here, they will be used explicitly where
            // required (see devtool setting)
            build = {
                ...build,
                ...configData.develop
            };
        }

        // Determine webpack config using source root
        const webpackContext = this.path.absoluteOrResolvedFrom(sourceRoot, resolveRoot);

        // Resolve all entry files relative to the context
        const webpackEntry: { [key: string]: string } = {};
        Object.keys(build.entry).forEach((bundleName: string) => {
            let bundleProcessed = this.path.absoluteOrResolvedFrom(
                build.entry[bundleName],
                webpackContext
            );

            bundleProcessed = this.path.internal.relative(
                webpackContext,
                bundleProcessed
            );

            if (bundleProcessed.substr(0, 1) !== '.' && bundleProcessed.substr(0, 1) !== '/') {
                bundleProcessed = `./${bundleProcessed}`;
            }

            webpackEntry[bundleName] = bundleProcessed;
        });

        // Dynamic configuration bins
        const pluginArray = [];

        // Non server specific plugins
        // These are plugins that can be used in both dev and non dev builds
        // but not when a server is being used.
        //
        // Server specific functionality added in server method
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

        // Add the webpack clean plugin as required
        if (build.clean) {
            pluginArray.push(new CleanWebpackPlugin());
        }

        // Build the public path as required
        // Server public paths will be the accessible url of the server with
        // content being server from it's root. Non server builds take the
        // configuration value for the context (dev vs non dev) before
        // cleaning and ensuring it is in the right format (ends with '/')
        let publicPathComputed: string;
        if (forServer) {
            const protocol = (configData.options.server.https || false) ? 'https' : 'http';
            const host = configData.options.server.host || this.serverDefaultHost;
            const port = configData.options.server.port || this.serverDefaultPort;

            publicPathComputed = `${protocol}://${host}:${port}/`;
        }
        else {
            publicPathComputed = this.string.trimRight(
                this.path.absoluteOrResolvedFrom(
                    build.publicPath,
                    resolveRoot
                ),
                '/'
            );

            publicPathComputed += '/';
        }

        /**
         * generateConfig() Processing
         *
         * Create the initial webpack config object
         */

        // Build and return the webpack config object
        const webpackConfig: Configuration = {
            mode: (!devMode) ? 'production' : 'development',
            context: webpackContext,
            entry: webpackEntry,
            output: {
                path: this.path.absoluteOrResolvedFrom(outputRoot, resolveRoot),
                publicPath: publicPathComputed
            },
            resolve: {
                alias: resolveAlias,
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
                            // Postcss may be added here if required, see post processing
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        sourceMap: devMode,
                                        outputStyle: (devMode) ? 'compressed' : 'nested',
                                        // todo: note about glob importer working only for non aliased imports
                                        importer: globImporter()
                                    },
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

        /**
         * generateConfig() Post Processing
         *
         * Pre webpack config object creation steps
         */

        // Inject the postcss rule as required
        // Depending on config values this method may do nothing.
        this.injectPostcss(webpackConfig, configData, resolveRoot, devMode);

        return webpackConfig;
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
     * Injects the webpack notifier plugin as required
     *
     * If the value of the option parameter for notifier is set to false no
     * injection will occur.
     *
     * @param {webpack.Configuration} webpackConfig
     *     The webpack configuration object
     * @param {ConfigDataInterface} configData
     *     The common frontend config data object
     * @param {string} defaultTitle
     *     A default title to use for the notifications
     */
    // eslint-disable-next-line max-len
    protected injectNotifier(webpackConfig: Configuration, configData: ConfigDataInterface, defaultTitle: string = 'Common Frontend'): void {
        // Only inject notifier plugin if not set to false
        if (configData.options.notifier !== false) {
            if (typeof configData.options.notifier !== 'object') {
                configData.options.notifier = {};
            }

            // Add the notifier plugin to webpack config
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            webpackConfig.plugins.push(new WebpackNotifierPlugin({
                ...{
                    title: defaultTitle,
                    alwaysNotify: false,
                    excludeWarnings: false,
                    skipFirstNotification: true,
                    sound: true
                },
                ...configData.options.notifier
            }));
        }
    }

    /**
     * Injects the imagemin webpack plugin as required
     *
     * If the value of the option parameter for imagemin is et to false no
     * injection will occur.
     *
     * @param {webpack.Configuration} webpackConfig
     *     The webpack configuration object
     * @param {ConfigDataInterface} configData
     *     The common frontend config data object
     */
    protected injectImagemin(webpackConfig: Configuration, configData: ConfigDataInterface): void {
        if (configData.options.imagemin !== false) {
            if (typeof configData.options.imagemin !== 'object') {
                configData.options.imagemin = {};
            }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        webpackConfig.plugins.push(new ImageminWebpackPlugin({
            ...{
                test: /\.(jpe?g|png|gif|svg)$/i
            },
            ...configData.options.imagemin
        }));
    }

    /**
     * Injects the postcss plugin.
     *
     * If the value of the option parameter for postcss is set to false no
     * injection will occur.
     *
     * The following injection is not the cleanest piece of code in the world
     * but whilst not pretty internally it enabled a clean interface for users
     * of this package to set, extend and/or inherit default postcss config.
     *
     * @param {webpack.Configuration} webpackConfig
     *     The webpack configuration object
     * @param {ConfigDataInterface} configData
     *     The common frontend config data object
     * @param {string} resolveRoot
     *     The determined resolve root
     * @param {boolean} devMode
     *     Determined development mode indicator
     */
    // eslint-disable-next-line max-len
    protected injectPostcss(webpackConfig: Configuration, configData: ConfigDataInterface, resolveRoot: string, devMode: boolean): void {
        // eslint-disable-next-line max-len
        /* eslint-disable max-len,@typescript-eslint/no-var-requires,global-require,@typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-ignore */
        if (configData.options.postcss !== false) {
            const styleRuleIndex = _.findIndex(webpackConfig.module?.rules, { test: /\.scss$/ });
            // @ts-ignore
            const cssLoaderIndex = _.findIndex(webpackConfig.module?.rules[styleRuleIndex].use, { loader: 'css-loader' });
            const injectionIndex = cssLoaderIndex + 1;

            const postcssUseDefaults = _.get(_.pick(configData.options.postcss, 'useDefaults'), 'useDefaults', false);
            const postcssUserConfig = _.omit(configData.options.postcss, 'useDefaults');

            // If a config path is in the user config, resolve it from the
            // resolve root if required
            // @ts-ignore
            if (_.get(postcssUserConfig, 'config.path', false) !== false) {
                // @ts-ignore
                postcssUserConfig.config.path = this.path.absoluteOrResolvedFrom(
                    // @ts-ignore
                    postcssUserConfig.config.path,
                    resolveRoot
                );
            }

            // Splice in the loader definition after the sass-loader but
            // before the css-loader, view the webpack config object creation
            // comments to view it's position in the chain.
            // @ts-ignore
            webpackConfig.module.rules[styleRuleIndex].use.splice(injectionIndex, 0, {
                loader: 'postcss-loader',
                // @ts-ignore
                options: {
                    ...postcssUserConfig,
                    ...{
                        ident: 'postcss',
                        plugins: (loader: {}): any[] => {
                            let pluginsArray: any[] = [];

                            // Add the default plugins if requested
                            if (postcssUseDefaults) {
                                pluginsArray.push(require('postcss-cssnext'));
                                pluginsArray.push(require('cssnano'));
                            }

                            if (Object.prototype.hasOwnProperty.call(postcssUserConfig, 'plugins')) {
                                // @ts-ignore
                                if (typeof postcssUserConfig.plugins === 'function') {
                                    // @ts-ignore
                                    pluginsArray = [
                                        ...pluginsArray,
                                        // @ts-ignore
                                        ...postcssUserConfig.plugins(loader)
                                    ];
                                }
                                // @ts-ignore
                                else if (Array.isArray(postcssUserConfig.plugins)) {
                                    pluginsArray = [
                                        ...pluginsArray,
                                        // @ts-ignore
                                        ...postcssUserConfig.plugins
                                    ];
                                }
                            }

                            // @ts-ignore
                            return pluginsArray;
                        },
                        sourceMap: devMode // only use sourcemaps during development
                    }
                }
            });
            // eslint-disable-next-line max-len
            /* eslint-enable @typescript-eslint/no-var-requires,global-require,@typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-ignore */
        }
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

        /* eslint-enable @typescript-eslint/ban-ts-ignore, no-console */
        return 0;
    }

}
