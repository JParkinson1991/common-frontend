/**
 * @file
 * HelpCommand.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import { Command } from 'commander';
import { injectable } from 'inversify';
import 'reflect-metadata';
import AbstractCommand from '../AbstractCommand';
import CommandArgumentsInterface from '../CommandArgumentsInterface';
import CommandInterface from '../CommandInterface';
import CommandOptionsDefinitionInterface from '../CommandOptionsDefinitionInterface';
import CommandOptionsInterface from '../CommandOptionsInterface';

/**
 * Class HelpCommand
 *
 * Responsible for showing help screen
 */
@injectable()
export default class HelpCommand extends AbstractCommand implements CommandInterface {

    /**
     * Returns the ID of the command.
     *
     * @return string
     */
    public id(): string {
        return 'help';
    }

    /**
     * Defines the string (command line input) that this command will listen
     * to.
     *
     * @return string
     */
    public commandString(): string {
        return 'help';
    }

    /**
     * Defines a brief description of what the command is responsible for.
     *
     * @return string
     */
    public description(): string {
        return 'Show the help screen';
    }

    /**
     * Returns an object of options that will be handled by this command.
     *
     * @return {CommandOptionsDefinitionInterface[]}
     */
    public options(): CommandOptionsDefinitionInterface[] {
        return [
            {
                option: '-t, --test <word>',
                description: 'Test description',
                default: 'testing-the-word'
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
        commander.outputHelp();
        process.exit(0);
    }

}
