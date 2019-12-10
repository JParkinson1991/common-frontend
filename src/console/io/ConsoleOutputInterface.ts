/**
 * @file
 * ConsoleOutputInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

/**
 * ConsoleOutputInterface
 *
 * Defines methods of outputting data to the console.
 */
export default interface ConsoleOutputInterface {
    /**
     * Log output to the console
     *
     * @param {string} output
     *     The string to output
     */
    log(output: string): void;

    /**
     * Log a success message to the console
     *
     * @param {string} message
     *     The success message to display
     */
    success(message: string): void;

    /**
     * Log a warning message to the console
     *
     * @param {string} message
     *     The warning message to display
     */
    warning(message: string): void;

    /**
     * Log an error message to the console
     *
     * @param {string} message
     *     The error message to display
     */
    error(message: string): void;

    /**
     * Log a notice message to the console
     *
     * @param {string} message
     *     The notice message to display
     */
    notice(message: string): void;
}
