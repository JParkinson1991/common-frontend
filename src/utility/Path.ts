/**
 * @file
 * Path.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import * as path from 'path';
import { injectable } from 'inversify';
import 'reflect-metadata';
import PathInterface from './PathInterface';
import String from './String';

/**
 * Class Path
 *
 * Utility methods for path manipulation
 */
@injectable()
export default class Path implements PathInterface {

    /**
     * Accessible path internal module
     */
    public internal = path;

    /**
     * Returns the absolute input path.
     *
     * If the provided input is absolute, it is returned as is, if not it is
     * returned as resolved from the resolve root.
     *
     * @param {string} inputPath
     *      The path that may or may not be absolute
     * @param {string} resolveRoot
     *      The path to resolve a relative path from if required
     */
    public absoluteOrResolvedFrom(inputPath: string, resolveRoot: string): string {
        return (path.isAbsolute(inputPath))
            ? inputPath
            : path.resolve(resolveRoot, inputPath);
    }

    /**
     * Returns a regex pattern for a file path
     *
     * @param {string} pathInput
     *     The path to generate the regex pattern object for
     * @param {string} prefix
     *     The pattern prefix
     *     For example, pattern starting from start of string|line: /^
     * @param {string} suffix
     *     The pattern suffix
     *     For example, pattern ending at end of string|line: $/
     * @param {string|undefined} flags
     *     Any required pattern flags
     *
     * @returns {RegExp}
     */
    public toRegex(pathInput: string, prefix: string = '/', suffix: string = '/', flags?: string): RegExp {
        const stringUtil = new String(); // eslint-disable-line no-new-wrappers
        pathInput = stringUtil.trim(pathInput, ['/', '.']);

        return new RegExp(`${prefix}${pathInput}${suffix}`);
    }

}
