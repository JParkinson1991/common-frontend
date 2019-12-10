/** npm install eslint-import-resolver-webpack --save-dev
 * @file
 * InitCommand.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import { Command } from 'commander';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Inquirer } from 'inquirer';
import AbstractCommand from '../AbstractCommand';
import CommandArgumentsInterface from '../CommandArgumentsInterface';
import CommandInterface from '../CommandInterface';
import CommandOptionsDefinitionInterface from '../CommandOptionsDefinitionInterface';
import CommandOptionsInterface from '../CommandOptionsInterface';
import ConfigLoader from '../../../config/ConfigLoader';
import Services from '../../../container/services';
import ConsoleOutputInterface from '../../io/ConsoleOutputInterface';
import PathInterface from '../../../utility/PathInterface';

/**
 * Class InitCommand
 *
 * Responsible for initialising package config
 */
@injectable()
export default class InitCommand extends AbstractCommand implements CommandInterface {

    /**
     * @var {PathInterface}
     */
    protected path: PathInterface;

    /**
     * @var {Inquirer}
     */
    protected inquirer: Inquirer;

    /**
     * Init Command Constructor
     *
     * @param {ConsoleOutputInterface} consoleOutput
     *     Handles writing of console output
     * @param {Path} path
     *     Path utility instance
     * @param {Inquirer} inquirer
     *     Inquirer instance
     */
    constructor(
        @inject(Services.ConsoleOutput) consoleOutput: ConsoleOutputInterface,
        @inject(Services.Path) path: PathInterface,
        @inject(Services.Inquirer) inquirer: Inquirer
    ) {
        super(consoleOutput);
        this.path = path;
        this.inquirer = inquirer;
    }

    /**
     * Returns the ID of the command.
     *
     * @return string
     */
    public id(): string {
        return 'init';
    }

    /**
     * Defines the string (command line input) that this command will listen
     * to.
     *
     * @return string
     */
    public commandString(): string {
        return 'init';
    }

    /**
     * Defines a brief description of what the command is responsible for.
     *
     * @return string
     */
    public description(): string {
        return 'Initialises the package config';
    }

    /**
     * Returns an object of options that will be handled by this command.
     *
     * @return {CommandOptionsDefinitionInterface[]}
     */
    public options(): CommandOptionsDefinitionInterface[] {
        return [
            {
                option: '-d, --dir <path>',
                description: 'The directory to create the config file in. Defaults to current directory.'
            },
            {
                option: '-f, --filename <name>',
                description: 'The name of the config file to create'
            },
            {
                option: '-o, --overwrite',
                description: 'Overwrites a config file recreate if it already exists'
            }
        ];
    }

    /**
     * Run the commands execution actions.
     *
     * It is the responsibility of the action command to handle it's own
     * exits via calls to process.exit;
     *
     * @param {Command} commander
     *     The commander object
     * @param {CommandArgumentsInterface} args
     *     The command arguments
     * @param {CommandOptionsInterface} opts
     *     The command options interface
     */
    public action(commander: Command, args: CommandArgumentsInterface, opts: CommandOptionsInterface): void {
        // Determine the configuration directory from any passed arguments
        // Fallback to current dir
        const configDir = this.path.absoluteOrResolvedFrom(
            (opts.d || opts.dir || process.cwd()).toString(),
            process.cwd()
        );

        // Determine filename
        // Default to null so config loader default is used when option omitted
        const configArg = opts.f || opts.filename || null;
        const configFilename = (typeof configArg === 'string' && configArg.length > 0)
            ? configArg
            : null;

        // Determine force flag
        // Double !! ensure bool, if neither set false -> true -> false
        // If one set string (truthy) -> false -> true
        const overwrite = !!(opts.o || opts.overwrite);

        let configPath = '';
        try {
            configPath = ConfigLoader.createFile(configDir, configFilename, overwrite, true);
        }
        catch (error) {
            this.output.error(error.message);
            process.exit(1);
        }

        // Output the notices to the command caller
        this.output.notice(`Generating configuration file at: ${configPath}`);
        if (overwrite) {
            this.output.log('Any existing configuration will be overwritten.');
        }

        this.inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'Happy to proceed?'
        }]).then((answers) => {
            if (answers.confirm === false) {
                process.exit(0);
            }

            try {
                ConfigLoader.createFile(configDir, configFilename, overwrite);
                this.output.success('Configuration file created successfully');
            }
            catch (error) {
                this.output.error(error.message);
                process.exit(1);
            }
        });
    }

}
