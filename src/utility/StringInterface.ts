/**
 * @file
 * StringInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

/**
 * Interface StringInterface
 */
export default interface StringInterface {

    /**
     * Trim character(s) and whitespace from the provided string
     *
     * @param {string} string
     *     The string to trim
     * @param {string | string[]} characters
     *     Either a single character as a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     */
    trim(string: string, characters: string|string[]): string;

    /**
     * Trim character(s) and whitespace from the left/start of the provided
     * string
     *
     * @param {string} string
     *     The string to trim
     * @param {string | string[]} characters
     *     Either a single character as a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     */
    trimLeft(string: string, characters: string|string[]): string;

    /**
     * Trim character(s) and whitespace from the right/end of the provided
     * string
     *
     * @param {string} string
     *     The string to trim
     * @param {string | string[]} characters
     *     Either a single character as a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     */
    trimRight(string: string, characters: string|string[]): string;

}
