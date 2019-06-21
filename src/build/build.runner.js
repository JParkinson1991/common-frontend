const _assign = require('lodash.assign');
const browserSync = require('browser-sync');
const chokidar = require('chokidar');
const webpack = require('webpack');

const _createCompiler = Symbol('createCompiler');


class BuildRunner {

    /**
     * Instantiates a BuildRunner object
     *
     * @param {BuildConfig|BuildConfig[]} buildConfigs
     *     The initial build config to add to the runn stack
     */
    constructor(buildConfigs){
        this.buildConfigs = [];

        if(Array.isArray(buildConfigs) === false){
            buildConfigs = [buildConfigs];
        }

        for(var i = 0; i < buildConfigs.length; i++){
            this.addBuildConfig(buildConfigs[i]);
        }
    }

    /**
     * Adds a build config to the run stack
     *
     * @param {BuildConfig} buildConfig
     *     The build config to add to the run stack
     */
    addBuildConfig(buildConfig){
        if(buildConfig.constructor.name !== 'BuildConfig'){
            throw new Error('Parameter must be an instance of BuildConfig');
        }

        this.buildConfigs.push(buildConfig);
    }

    /**
     * Runs the webpack for the buildConfigs loaded into the
     * object instance
     *
     * @returns {boolean}
     *     True on build success
     *     False on fail
     */
    build(callback = null){
        let compiler = this[_createCompiler]();

        compiler.run((err, stats) => {
            if(typeof callback === 'function'){
                callback(err, stats);
            }
        });
    }

    /**
     * Runs webpack in watch mode for the buildConfigs loaded
     *
     * @param {object} options
     *     The webpack watch options
     *     If this object contains a 'proxy' setting a browser sync instance will be created
     * @param {function} callback
     *     A callback to trigger after webpack watch has finished
     */
    watch(options = {}, callback = null){
        let compiler = this[_createCompiler]();

        options = _assign({
            ignored: /node_modules/,
            aggregateTimeout: 300
        }, options);

        compiler.watch({ ignored: /node_modules/, aggregateTimeout: 300}, (err, stats) => {
            if(typeof callback === 'function'){
                callback(err, stats);
            }
        });

        if(options.hasOwnProperty('proxy')){
            var bs = browserSync.create();
            bs.init({
                proxy: options.proxy,
                reloadDelay: (options.hasOwnProperty('reloadDelay')) ? options.reloadDelay * 1000 : 0
            });

            var watchDirs = [];
            compiler.compilers.forEach(function(compilerConfig){
                watchDirs.push(compilerConfig.outputPath + '/**/*.css');
            });

            let cssWatcher = chokidar.watch(watchDirs, {
                ignored: /node_modules/,
                ignoreInitial: true,
            });

            cssWatcher.on('add', (path) => {
                    bs.reload(path);
            });
            cssWatcher.on('change', (path) => {
                    bs.reload(path);
            });
            cssWatcher.on('unlink', () => {
                    bs.reload();
            });
        }
    }

    /**
     * Static handler that can be used to simplify the build result/output
     * within a cli context.
     *
     * It is recommended to use this method as part of the build/watch method callbacks.
     *
     * @param {object} err
     *     Webpack error object
     * @param {object} stats
     *     Webpack stats object
     *
     * @returns {number}
     *     Recommended process exit code
     */
    static cliOutput(err, stats){
        if(err){
            console.error(err.stack || err);

            if(err.details){
                console.error(err.details);
            }

            return 1;
        }

        if(stats.hasErrors()){
            console.error(stats.toString({
                colors: true
            }));

            return 1;
        }

        if(stats.hasWarnings()){
            console.warn(stats.toString({
                colors: true
            }));
        }
        else{
            console.log(stats.toString({
                colors: true
            }));
        }

        return 0;
    }

    /**
     * Generates an array of webpack ready configuration objects
     *
     * @returns {Compiler}
     */
    [_createCompiler](){
        if(this.buildConfigs.length === 0){
            throw new Error('No BuildConfigs loaded')
        }

        var configObjects = [];
        this.buildConfigs.forEach(function(buildConfig){
            configObjects.push(buildConfig.generate())
        });

        return webpack(configObjects);
    }
}

module.exports = BuildRunner;