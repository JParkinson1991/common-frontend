/**
 * @file
 * ServerCommand.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import { Command } from 'commander';
import { injectable } from 'inversify';
import CommandInterface from '../CommandInterface';
import AbstractWebpackCommand from '../AbstractWebpackCommand';
import CommandOptionsDefinitionInterface from '../CommandOptionsDefinitionInterface';
import CommandArgumentsInterface from '../CommandArgumentsInterface';
import CommandOptionsInterface from '../CommandOptionsInterface';
import 'reflect-metadata';

/**
 * Class ServerCommand
 *
 * Responsible for starting webpack dev server
 */
@injectable()
export default class ServerCommand extends AbstractWebpackCommand implements CommandInterface {

    /**
     * Returns the ID of the command.
     *
     * @return string
     */
    public id(): string {
        return 'server';
    }

    /**
     * Defines the string (command line input) that this command will listen
     * to.
     *
     * @return string
     */
    public commandString(): string {
        return 'server';
    }

    /**
     * Defines a brief description of what the command is responsible for.
     *
     * @return string
     */
    public description(): string {
        return 'Starts a development server';
    }

    /**
     * Returns an object of options that will be handled by this command.
     *
     * @return {CommandOptionsDefinitionInterface[]}
     */
    public options(): CommandOptionsDefinitionInterface[] {
        return [
            this.getConfigOptionDefinition(),
            {
                option: '-d, --dev',
                description: 'Enable build in development mode'
            }
        ];
    }

    /**
     * Run the command execution actions.
     *
     * @param {Command} commander
     *     The commander instance
     * @param {CommandArgumentsInterface} args
     *     The command arguments
     * @param {CommandOptionsInterface} opts
     *     The command options interface
     */
    public action(commander: Command, args: CommandArgumentsInterface, opts: CommandOptionsInterface): void {
        this.loadConfigFile((opts.c || opts.config || '').toString());
        const isDevMode = !!((opts.d || opts.dev));

        this.webpackRunner.server(this.configLoader, isDevMode);
    }

}
