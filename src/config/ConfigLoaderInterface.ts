/**
 * @file
 * ConfigInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import ConfigDataInterface from './ConfigDataInterface';

/**
 * Interface ConfigInterface
 *
 * Holds accessible configuration data objects
 */
export default interface ConfigLoaderInterface {

    /**
     * Finds all config files in a given directory
     *
     *
     * @param {string} inDirectory
     *     The path to the directory to search for the files within
     * @param {boolean} recursive
     *     Search directory recursively
     *
     * @returns {string[]}
     *     An array of absolute paths to the found files
     */
    findFiles(inDirectory: string, recursive: boolean): string[];

    /**
     * Load a config file into the instance
     *
     * @param {string} filePath
     */
    load(filePath: string): void;

    /**
     * Returns the path to the config file handled by the class instance
     *
     * @return {string}
     */
    getFilePath(): string;

    /**
     * Returns the config data object
     *
     * @return {ConfigDataInterface}
     */
    getData(): ConfigDataInterface;

}
