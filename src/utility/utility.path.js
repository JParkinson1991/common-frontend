const cfUtilityString = new (require('./utility.string'))();
const path = require('path');


module.exports = {

    /**
     * Returns an absolute path either as provided or resolved from the resolvedFromDir
     *
     * @param {string} inputPath
     *     The path that may or may not be absolute
     * @param {string} resolveFromDir
     *     The path to resolve a relative path from if required
     *
     * @returns {string}
     *     The absolute path either as provided or resolved from the resolveFromDir
     */
    absoluteOrResolvedFrom: function(inputPath, resolveFromDir){
        return (path.isAbsolute(inputPath))
            ? inputPath
            : path.resolve(resolveFromDir, inputPath);
    },

    /**
     * Generates a regex pattern object for a given path
     *
     * @param {string} path
     *     The path to generate the regex pattern object for
     * @param {string} start
     *     The pattern starting element
     *     For example, pattern starting from start of string|line: /^
     * @param {string} end
     *     The pattern ending element
     *     For example, pattern ending at end of string|line: $/
     *     Flags can also be include: /ig
     */
    toRegex: function(path, start = '/', end = '/'){
        path = cfUtilityString.trim(path, ['/', '.']);

        return new RegExp(start + path.replace(/\//g, '\\/') + end);
    }
};