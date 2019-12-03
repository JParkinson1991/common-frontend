/**
 * @file
 * AbstractWebpackCommand.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import { inject, injectable } from 'inversify';
import AbstractCommand from './AbstractCommand';
import 'reflect-metadata';
import ConfigLoaderInterface from '../../config/ConfigLoaderInterface';
import WebpackRunnerInterface from '../../webpack/WebpackRunnerInterface';
import Services from '../../container/services';
import ConsoleOutputInterface from '../io/ConsoleOutputInterface';
import CommandOptionsDefinitionInterface from './CommandOptionsDefinitionInterface';

/**
 * Class AbstractWebpackCommand
 *
 * Base class for webpack functionality wrapping commands
 */
@injectable()
export default class AbstractWebpackCommand extends AbstractCommand {

    /**
     * The local config instance
     *
     * @var {ConfigInterface}
     */
    protected configLoader: ConfigLoaderInterface;

    /**
     * The local webpack runner
     *
     * @var {WebpackRunnerInterface}
     */
    protected webpackRunner: WebpackRunnerInterface;

    /**
     * AbstractWebpackCommand constructor
     *
     * @param {ConsoleOutputInterface} consoleOutput
     *     IO interface for console output
     * @param {ConfigLoaderInterface} configLoader
     *     Configuration loader
     * @param {WebpackRunnerInterface} webpackRunner
     *     Handles the execution of webpack functionality
     */
    constructor(
        @inject(Services.ConsoleOutput) consoleOutput: ConsoleOutputInterface,
        @inject(Services.ConfigLoader) configLoader: ConfigLoaderInterface,
        @inject(Services.WebpackRunner) webpackRunner: WebpackRunnerInterface
    ) {
        super(consoleOutput);
        this.configLoader = configLoader;
        this.webpackRunner = webpackRunner;
    }

    /**
     * Provides reusable configuration command option that can be used for
     * all sub commands
     *
     * @returns {CommandOptionsDefinitionInterface}
     */
    protected getConfigOptionDefinition(): CommandOptionsDefinitionInterface {
        return {
            option: '-c, --config <path>',
            description: 'A path to the configuration file to use. If not'
                + ' provided the config file will be discovered within the'
                + ' current directory.'
        };
    }

    /**
     * Loads a configuration file into the local config loader instance
     *
     * @param {string} configPath
     *     The path to the config file to load, if not passed config files
     *     will attempted to be loaded from the current working directory.
     * @param {boolean} exitOnError
     *     Should this method end the process on errors.
     *     If false, any errors produced in load will bubble to the caller.
     */
    protected loadConfigFile(configPath: string, exitOnError: boolean = true): void {
        try {
            if (!configPath || configPath.length === 0) {
                const configFiles = this.configLoader.findFiles(process.cwd(), true);

                if (configFiles.length === 0) {
                    this.output.error(`Failed to find config file in: ${process.cwd()}`);
                    process.exit(1);
                }

                if (configFiles.length > 1) {
                    this.output.warning('Found multiple configs, using first only');
                }

                // eslint-disable-next-line prefer-destructuring
                configPath = configFiles[0];
            }

            this.output.notice(`Loading config: ${configPath}`);
            this.configLoader.load(configPath);
        }
        catch (error) {
            if (exitOnError) {
                this.output.error(error.message);
                process.exit(1);
            }
            else {
                throw error;
            }
        }
    }

}
