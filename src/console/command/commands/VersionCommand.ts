/**
 * @file
 * VersionCommand.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import { Command } from 'commander';
import { injectable } from 'inversify';
import AbstractCommand from '../AbstractCommand';
import CommandArgumentsInterface from '../CommandArgumentsInterface';
import CommandInterface from '../CommandInterface';
import CommandOptionsDefinitionInterface from '../CommandOptionsDefinitionInterface';
import CommandOptionsInterface from '../CommandOptionsInterface';

/**
 * Class VersionCommand
 *
 * Responsible for showing the application version
 */
@injectable()
export default class VersionCommand extends AbstractCommand implements CommandInterface {

    /**
     * Returns the ID of the command.
     *
     * @return string
     */
    public id(): string {
        return 'version';
    }

    /**
     * Defines the string (command line input) that this command will listen
     * to.
     *
     * @return string
     */
    public commandString(): string {
        return 'version';
    }

    /**
     * Defines a brief description of what the command is responsible for.
     *
     * @return string
     */
    public description(): string {
        return 'Show the application version number';
    }

    /**
     * Returns an object of options that will be handled by this command.
     *
     * @return {CommandOptionsDefinitionInterface[]}
     */
    public options(): CommandOptionsDefinitionInterface[] {
        return [];
    }

    /**
     * Run the commands execution actions.
     *
     * @param {Command} commander
     *     The commander object
     * @param {CommandArgumentsInterface} args
     *     The command arguments
     * @param {CommandOptionsInterface} opts
     */
    public action(commander: Command, args: CommandArgumentsInterface, opts: CommandOptionsInterface): void {
        // eslint-disable-next-line no-underscore-dangle
        this.output.log(commander.parent._version);
        process.exit(0);
    }

}
