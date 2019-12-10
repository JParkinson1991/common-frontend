/**
 * @file
 * WebpackRunnerInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import { Stats } from 'webpack';
import ConfigLoaderInterface from '../config/ConfigLoaderInterface';

/**
 * Interface WebpackRunnerInterface
 */
export default interface WebpackRunnerInterface {

    /**
     * Runs a webpack build for the loaded config
     *
     * @param {ConfigLoaderInterface} config
     *     The config to run webpack from
     * @param {boolean} devMode
     *     Run the build in development mode?
     * @param {(error: Error, stats: webpack.Stats) => void} callback
     *     A compiler run callback, can be used to handled cli output etc.
     *
     * @return void
     */
    build(config: ConfigLoaderInterface, devMode: boolean, callback?: (error: Error, stats?: Stats) => void): void;

    /**
     * Runs a webpack watcher for the loaded config
     *
     * @param {ConfigLoaderInterface} config
     *     The config to run webpack from
     * @param {boolean} devMode
     *     Run the build in development mode?
     * @param {(error: Error, stats?: webpack.Stats) => void} callback
     *     A compiler run callback, can be used to handled cli output etc.
     *
     * @return void
     */
    watch(config: ConfigLoaderInterface, devMode: boolean, callback?: (error: Error, stats?: Stats) => void): void;

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
    server(config: ConfigLoaderInterface, devMode: boolean, callback?: (error: Error) => void): void;

}
