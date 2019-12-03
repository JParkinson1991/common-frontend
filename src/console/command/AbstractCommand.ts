/**
 * @file
 * AbstractCommand.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import { inject, injectable } from 'inversify';
import Services from '../../container/services';
import ConsoleOutputInterface from '../io/ConsoleOutputInterface';

/**
 * Class AbstractCommand
 *
 * Provides sharable default functionality accessible to all child commands.
 */
@injectable()
export default abstract class AbstractCommand {

    /**
     * The console output instance
     */
    protected output: ConsoleOutputInterface;

    /**
     * AbstractCommand constructor
     *
     * @param {ConsoleOutputInterface} consoleOutput
     *     The console output object
     */
    constructor(@inject(Services.ConsoleOutput) consoleOutput: ConsoleOutputInterface) {
        this.output = consoleOutput;
    }

}
