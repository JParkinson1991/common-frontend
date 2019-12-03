/**
 * @file
 * YamlInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

/**
 * Interface YamlInterface
 */
export default interface YamlInterface {

    /**
     * Loads yaml from the provided file
     *
     * @param {string} filePath
     *     The path to the yaml file to load
     *
     * @returns {object}
     *     Object representation of the yaml file
     */
    loadFile(filePath: string): {};

}
