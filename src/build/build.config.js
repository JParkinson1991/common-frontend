const cfUtility = require('./../utility');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const fs = require('fs');
const glob = require('glob');
const globImporter = require('node-sass-glob-importer');
const ImageMinPlugin = require('imagemin-webpack-plugin').default;
const _get = require('lodash/get');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');

const _boolOr = Symbol('boolOr');

const _defaultConfigFile = path.resolve(__dirname, '../../config/default.cf.build.yml');

/**
 * BuildConfig Class
 *
 * Handles the creation of webpack configuration objects form
 * configuration files.
 */
class BuildConfig {

    /**
     * Instantiates a BuildConfig object
     *
     * @param {string} configFilePath
     *     The build config file path
     */
    constructor(configFilePath){
        if(fs.existsSync(configFilePath) === false){
            throw new Error('Config file not found at ' + configFilePath);
        }

        this.buildName = path.basename(path.dirname(configFilePath));
        this.clean = true;
        this.config = cfUtility.yaml.loadFile(configFilePath);
        this.configFilePath = configFilePath;
        this.notifications = false;
        this.sassOutputStyle = 'nested'; //use node-sass default
        this.process = true;
        this.production = true;
        this.resolveRoot = path.dirname(configFilePath);
        this.sourceMaps = false;
    };

    /**
     * Returns the configuration file path
     *
     * @returns {string}
     */
    getConfigFilePath(){
        return this.configFilePath;
    }

    /**
     * Sets the config's build name
     *
     * When running multiple builds simultaneously this setting and enabled notifications
     * would help distinguish between the two
     *
     * @param {string} buildName
     *     When running multiple p
     */
    setBuildName(buildName){
        this.buildName = buildName;
    }

    /**
     * Sets the clean build directory enabled state
     *
     * @param {boolean} trueFalse
     *     True to clean build directory before build
     *     False to built on top of current files
     */
    setClean(trueFalse){
        this.clean = this[_boolOr](trueFalse, true);
    }

    /**
     * Sets the notifications enabled state
     *
     * @param {boolean} trueFalse
     *     True to enable notifications
     *     False to disable them
     */
    setNotifications(trueFalse){
        this.notifications = this[_boolOr](trueFalse, false);
    }

    /**
     * Sets the processing flag
     *
     * @param {boolean} trueFalse
     *     True to enable processing
     *     False to disable it
     */
    setProcess(trueFalse){
        this.process = this[_boolOr](trueFalse, true)
    }

    /**
     * Sets the production flag
     *
     * @param {boolean} trueFalse
     *     True to enable production build
     *     False to disable it
     */
    setProduction(trueFalse){
        this.production = this[_boolOr](trueFalse, true);
    }

    /**
     * Sets the resolve root to use when paths are defined in config generation
     *
     * @param {string} resolveRoot
     *     The path resolve root
     */
    setResolveRoot(resolveRoot){
        if(fs.existsSync(resolveRoot)){
            throw new Error('Resolve root not found at ' + resolveRoot);
        }

        this.resolveRoot = resolveRoot;
    }

    /**
     * Sets the output style to use during sass compilation
     *
     * @param sassOutputStyle
     *     The output style to sue
     */
    setSassOutputStyle(sassOutputStyle){
        this.sassOutputStyle = sassOutputStyle;
    }

    /**
     * Sets the source paths enabled flag
     *
     * @param {boolean} trueFalse
     *     True to enable source
     */
    setSourceMaps(trueFalse){
        this.sourceMaps = this[_boolOr](trueFalse, false);
    }

    /**
     * Returns a webpack ready configuration object parsed from
     * the objects settings and original configuration file.
     *
     * @returns {object}
     */
    generate(){
        //Preprocess structure directories
        let imageDir = cfUtility.string.trimRight(this.config.structure.image_dir, '/');

        //Font handling, clean up the font dir from structure
        //Create regex patterns for use in webpack rules
        //If any external fonts given, add them to the patterns
        let fontDir = cfUtility.string.trimRight(this.config.structure.font_dir, '/');
        let fontDirPatterns = [cfUtility.path.toRegex(fontDir)];
        let externalFonts = _get(this.config, 'external.fonts', []);
        for(let i = 0; i < externalFonts.length; i++){
            fontDirPatterns.push(cfUtility.path.toRegex(externalFonts[i]));
        }

        let webpackConfig = {
            mode: (this.production === true) ? 'production' : 'development',
            context: cfUtility.path.absoluteOrResolvedFrom(this.config.build.context, this.resolveRoot),
            entry: this.config.build.entry,
            output: {
                path: cfUtility.path.absoluteOrResolvedFrom(this.config.build.output.path, this.resolveRoot),
                filename: this.config.build.output.filename,
                publicPath: this.config.build.output.public_path
            },
            resolve: {
                alias: this.config.external.aliases
            },
            plugins: [
                new FixStyleOnlyEntriesPlugin(),
                new MiniCssExtractPlugin({
                    filename: '[name].css'
                })
            ],
            devtool: (this.sourceMaps === true) ? 'source-map' : false,
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: this.sourceMaps
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    importer: globImporter(),
                                    outputStyle: this.sassOutputStyle,
                                    sourceMap: this.sourceMaps
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(jpe?g|png|gif|svg)$/i,
                        exclude: fontDirPatterns,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: (this.production)
                                        ? imageDir + '/[hash].[ext]'
                                        : imageDir + '/[path][name].[ext]',
                                    outputPath: (url, resourcePath, context) => {
                                        //Remove node_modules from output paths as contents often
                                        //ignored in recursive file searches etc.
                                        return url.replace('/node_modules/', '/');
                                    }
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                        exclude: cfUtility.path.toRegex(this.config.structure.image_dir),
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: (this.production)
                                        ? fontDir + '/[hash].[ext]'
                                        : fontDir + '/[path][name].[ext]',
                                    outputPath: (url, resourcePath, context) => {
                                        //Remove node_modules from output paths as contents often
                                        //ignored in recursive file searches etc.
                                        return url.replace('/node_modules/', '/');
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        };

        //Add clean if require
        if(this.clean){
            webpackConfig.plugins.push(new CleanWebpackPlugin());
        }

        //Add module/assets processing for production builds
        if(this.process){
            //Check for image min configuration, add plugin if it exists
            let imageMinConfig = _get(this.config, 'processing.image_min', false);
            if(imageMinConfig !== false){
                webpackConfig.plugins.push(new ImageMinPlugin({
                    test: cfUtility.path.toRegex(
                        this.config.structure.image_dir,
                        '/^',
                        '\\/.+\\.(jpe?g|png|gif|svg)$/i'
                    ),
                    options: imageMinConfig
                }))
            }
        }

        //Add notifications plugin if required
        if(this.notifications === true){
            //Build the initial notifier config
            let notifierConfig = {
                title: this.buildName,
                excludeWarnings: false,
                alwaysNotify: true,
                skipFirstNotification: false
            };

            //Attempt to find a logo file for use with notifier
            let logoPattern = path.resolve(this.resolveRoot, 'logo.{png,jpeg,jpg,gif,svg}');
            let logoResults = glob.sync(logoPattern);
            if(logoResults.length !== 0){
                notifierConfig.contentImage = logoResults[0];
            }

            //Attach the notifier
            webpackConfig.plugins.push(new WebpackNotifierPlugin(notifierConfig))
        }

        return webpackConfig;
    };

    /**
     * Centralises boolean type checking with fallback to a provided default
     *
     * @returns {boolean}
     */
    [_boolOr](value, defaultValue){
        return (typeof value === 'boolean')
            ? value
            : defaultValue;
    }

    /**
     * Instantiates and returns an instance of this class by discovering a
     * configuration file within the given directory.
     *
     * For a BuildConfig instance to be discovered there must be a
     * configuration file with the following suffix:
     * >> .cf.build.yml
     *
     * @param {string} inDir
     *     The directory in which to find the config file
     * @param {boolean} recursive
     *     Should the given directory be searched through recursively
     *
     * @return {BuildConfig}
     */
    static discover(inDir, recursive = false){
        inDir = cfUtility.string.trimRight(inDir, '/');

        let globPattern = (recursive)
            ? inDir + '/**/*.cf.build.yml'
            : inDir + '/*.cf.build.yml';

        let results = glob.sync(globPattern);
        if(results.length === 0){
            throw new Error('Failed to find config in ' + globPattern);
        }

        return new this(results[0]);
    }

    /**
     * Creates a build configuration file and object in the given directory
     *
     * @param {string} inDir
     *     The absolute path to the directory in which to create the build config file
     * @param {string} name
     *     The name of the build config file (will be prepended to .cf.build.yml)
     *     If not provided, the directory name will be used
     * @param {boolean} force
     *     If true, a build configuration file will:
     *     - be created, even if one already exists in the given directory
     *     - overwrite any build config file with the same name
     *
     * @return {BuildConfig}
     */
    static create(inDir, name = null, force = false){
        //Ensure config file exists
        if(fs.existsSync(inDir) === false){
            throw new Error('Cant create build config. ' + inDir + ' does not exist');
        }

        //Ensure directory path is for a directory
        if(fs.lstatSync(inDir).isDirectory() === false){
            throw new Error('Cant create build config. ' + inDir + ' is not a directory');
        }

        //Not forcing, so ensure config file does not already exit
        if(force === false){
            if(glob.sync(inDir + '/*.cf.build.yml').length > 0){
                throw new Error('Cant create build config. Configuration files already exist in ' + inDir);
            }
        }

        let newConfigFile = (name === null)
            ? inDir + '/' + path.basename(inDir) + '.cf.build.yml'
            : inDir + '/' + name + '.cf.build.yml';

        //Checks passed, copy the default into it's final file
        fs.copyFileSync(_defaultConfigFile, newConfigFile);

        return new this(newConfigFile);
    }
}


module.exports = BuildConfig;