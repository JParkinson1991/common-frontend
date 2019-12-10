/**
 * @file
 * PathInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

export default interface PathInterface {

    /**
     * Must hold the node path package
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    internal: any;

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
     *
     * @return string
     */
    absoluteOrResolvedFrom(inputPath: string, resolveRoot: string): string;

    /**
     * Returns a regex pattern for a file path
     *
     * @param {string} path
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
    toRegex(path: string, prefix: string, suffix: string, flags?: string): RegExp;

}
