/**
 * @file
 * HelpCommandInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import { Command } from 'commander';
import CommandArgumentsInterface from './CommandArgumentsInterface';
import CommandOptionsDefinitionInterface from './CommandOptionsDefinitionInterface';
import CommandOptionsInterface from './CommandOptionsInterface';

/**
 * Class CommandInterface
 */
export default interface CommandInterface {

    /**
     * Returns the ID of the command.
     *
     * @return string
     */
    id(): string;

    /**
     * Defines the string (command line input) that this command will listen
     * to.
     *
     * Parameters:
     * - Parameters can be passed in the form of <required> and [optional]
     * - The string between the < > or [ ] will become the argument key in
     *   the action method.
     * - The last parameter can be variadic. To define a variadic parameter
     *   append ... to the parameter name, <name...> [name...]. In such
     *   cases where a variadic command is used its corresponding argument
     *   value in the action method will be an array of all values entered
     *
     * Examples: say-hi <name> [from]
     *
     * @return string
     */
    commandString(): string;

    /**
     * Defines a brief description of what the command is responsible for.
     *
     * @return string
     */
    description(): string;

    /**
     * Returns an object of options that will be handled by this command.
     *
     * @return {CommandOptionsDefinitionInterface[]}
     */
    options(): CommandOptionsDefinitionInterface[];

    /**
     * Run the commands execution actions.
     *
     * It is the responsibility of the action command to handle it's own
     * exits via calls to process.exit. If an exit is not triggered via
     * this method a default exit code of 0 will be used.
     *
     * @param {Command} commander
     *     The commander object
     * @param {CommandArgumentsInterface} args
     *     The command arguments
     * @param {CommandOptionsInterface} opts
     */
    action(commander: Command, args: CommandArgumentsInterface, opts: CommandOptionsInterface): void;

}
