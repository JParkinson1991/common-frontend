/**
 * @file
 * ConsoleOutput.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import * as chalk from 'chalk';
import { injectable } from 'inversify';
import 'reflect-metadata';
import ConsoleOutputInterface from './ConsoleOutputInterface';

/**
 * ConsoleOutput class
 *
 * Handles the rendering of messages to the console.
 */
@injectable()
export default class ConsoleOutput implements ConsoleOutputInterface {

    /**
     * The local chalk instance
     *
     * Tightly coupled as the chalk package can not be represented as
     * concrete instance easily.
     */
    private chalk = chalk;

    /**
     * Simple wrapper around console.log function
     *
     * @param {string} output
     *     The string to output
     */
    public log(output: string): void {
        // eslint-disable-next-line no-console
        console.log(output);
    }

    /**
     * Allows logging to console using internal chalk instance
     *
     * @param {function} output
     *     The function responsible for creating the content to be logged
     *     The function will receive {Chalk} as its only parameter and is
     *     expected to return a string representing the required console
     *     output
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public logChalk(output: (chalk: any) => string): void {
        this.log(output(this.chalk));
    }

    /**
     * Centralises success message output format
     *
     * @param {string} message
     *     The success message to display
     */
    public success(message: string): void {
        this.log(this.chalk.green('Success: ') + message.trim());
    }

    /**
     * Centralises warning message output format
     *
     * @param {string} message
     *     The warning message to display
     */
    public warning(message: string): void {
        this.log(this.chalk.yellow('Warning: ') + message.trim());
    }

    /**
     * Centralises error message output format
     *
     * @param {string} message
     *     The error message to display
     */
    public error(message: string): void {
        this.log(this.chalk.red('Error: ') + message.trim());
    }

    /**
     * Centralises notice message output form
     *
     * @param {string} message
     *     The notice message to display
     */
    public notice(message: string): void {
        this.log(this.chalk.blue('Notice: ') + message.trim());
    }

}
