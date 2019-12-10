/**
 * @file
 * CommandRepository.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import CommandInterface from './CommandInterface';

/**
 * Class CommandRepository
 *
 * Holds accessible CommandInterface instances
 */
export default class CommandRepository {

    /**
     * Contains all of the stored commands
     */
    private commands: { [key: string]: CommandInterface } = {};

    /**
     * Add a command to the repository
     *
     * @param {CommandInterface} command
     *     The command to add
     *
     * @return {this}
     */
    public addCommand(command: CommandInterface): this {
        this.commands[command.id()] = command;

        return this;
    }

    /**
     * Dumps all of the commands in the repository
     *
     * @return CommandInterface[]
     */
    public dump(): CommandInterface[] {
        return Object.values(this.commands);
    }

}
