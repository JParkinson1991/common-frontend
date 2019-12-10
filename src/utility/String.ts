/**
 * @file
 * String.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import { injectable } from 'inversify';
import StringInterface from './StringInterface';
import 'reflect-metadata';

/**
 * Class String
 */
@injectable()
export default class String implements StringInterface {

    /**
     * Trim character(s) and whitespace from the provided string
     *
     * @param {string} string
     *     The string to trim
     * @param {null | string | string[]} characters
     *     Either a single character as a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     */
    public trim(string: string, characters?: string|string[]): string {
        return String.doTrim(string, characters || null, true, true);
    }

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
    public trimLeft(string: string, characters?: string|string[]): string {
        return String.doTrim(string, characters || null, true, false);
    }

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
    public trimRight(string: string, characters?: string|string[]): string {
        return String.doTrim(string, characters || null, false, true);
    }

    /**
     * Internal trimmer capable of handling all the public trim methods.
     *
     * @param {string} string
     *     The string
     * @param {string | string[]} characters
     * @param {boolean} left
     * @param {boolean} right
     */
    private static doTrim(string: string, characters: null|string|string[], left: boolean, right: boolean): string {
        // Make characters array uniform format
        if (Array.isArray(characters) === false) {
            if (characters === null) {
                characters = [];
            }
            else if (typeof characters === 'string') {
                characters = characters.trim().split(' ');
            }
            else {
                throw new Error('Invalid characters argument. Expected string|string[]');
            }
        }
        if (left) {
            string = string.replace(/^\s*/, '');
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            while (characters.includes(string.charAt(0))) {
                string = string.substring(1);
            }
        }

        if (right) {
            string = string.replace(/\s*$/, '');
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            while (characters.includes(string.charAt(string.length - 1))) {
                string = string.substring(0, string.length - 1);
            }
        }

        return string;
    }

}
