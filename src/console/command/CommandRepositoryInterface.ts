/**
 * @file
 * CommandRepositoryInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import CommandInterface from './CommandInterface';

/**
 * Interface CommandRepositoryInterface
 */
export default interface CommandRepositoryInterface {
    /**
     * Add a command to the repository
     *
     * @param {CommandInterface} command
     *     The command to add
     *
     * @return {this}
     */
    addCommand(command: CommandInterface): this;

    /**
     * Dumps all of the commands in the repository
     *
     * @return CommandInterface[]
     */
    dump(): CommandInterface[];
}
