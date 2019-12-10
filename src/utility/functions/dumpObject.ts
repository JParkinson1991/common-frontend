/**
 * @file
 * dumpObject.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import * as util from 'util';

/**
 * Dumps an object in it's entirety to a string.
 *
 * @param {object} object
 *     The object to dump
 * @param {boolean} showHidden
 *     Should hidden elements be shown
 *
 * @returns {string}
 *     The dumped object
 */
export default function dumpObject(object: object, showHidden: boolean = false): string {
    return util.inspect(object, {
        showHidden,
        depth: null,
        colors: true
    });
}
