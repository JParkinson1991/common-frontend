/**
 * @file
 * BuildCommand.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import { Command } from 'commander';
import { injectable } from 'inversify';
import AbstractWebpackCommand from '../AbstractWebpackCommand';
import CommandInterface from '../CommandInterface';
import CommandOptionsDefinitionInterface from '../CommandOptionsDefinitionInterface';
import CommandArgumentsInterface from '../CommandArgumentsInterface';
import CommandOptionsInterface from '../CommandOptionsInterface';
import 'reflect-metadata';

/**
 * Class BuildCommand
 *
 * Responsible for webpack builds
 */
@injectable()
export default class BuildCommand extends AbstractWebpackCommand implements CommandInterface {

    /**
     * Returns the ID of the command.
     *
     * @return string
     */
    public id(): string {
        return 'build';
    }

    /**
     * Defines the string (command line input) that this command will listen
     * to.
     *
     * @return string
     */
    public commandString(): string {
        return 'build';
    }

    /**
     * Defines a brief description of what the command is responsible for.
     *
     * @return string
     */
    public description(): string {
        return 'Builds the module via webpack';
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
            },
            {
                option: '-w, --watch',
                description: 'Watch and recompile on source file changes.'
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

        // If watching user runner to watch
        // Else do default build
        // In both cases pass whether running in devMode or not
        if (opts.w || opts.watch) {
            this.webpackRunner.watch(this.configLoader, isDevMode);
        }
        else {
            this.webpackRunner.build(this.configLoader, isDevMode);
        }
    }

}
