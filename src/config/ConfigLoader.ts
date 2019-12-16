/**
 * @file
 * Config.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { path as appRoot } from 'app-root-path';
import { inject, injectable } from 'inversify';
import ConfigDataInterface from './ConfigDataInterface';
import ConfigLoaderInterface from './ConfigLoaderInterface';
import 'reflect-metadata';
import Services from '../container/services';
import StringInterface from '../utility/StringInterface';
import dynamicRequire from '../utility/functions/dynamicRequire';

/**
 * Class Config
 *
 * Holds package configuration
 */
@injectable()
export default class ConfigLoader implements ConfigLoaderInterface {

    /**
     * The loaded config data object
     *
     * Only null prior to first load
     *
     * @var {ConfigDataInterface|null}
     */
    private configData: ConfigDataInterface|null = null;

    /**
     * The config file path
     *
     * Only null prior to first load
     *
     * @var {string}
     */
    private filePath: string|null = null;

    /**
     * The string utility instance
     *
     * @var {StringInterface}
     */
    private string: StringInterface;

    /**
     * The suffix of the files accepted by this class when loading config.
     */
    private static defaultConfigFileName: string = '.cf.config.js';

    /**
     * ConfigLoader constructor
     *
     * @param {StringInterface} string
     */
    public constructor(@inject(Services.String) string: StringInterface) {
        this.string = string;
    }

    /**
     * Finds all config files in a given directory
     *
     * @param {string} inDirectory
     *     The path to the directory to search for the files within
     * @param {boolean} recursive
     *     Search directory recursively
     *
     * @returns {string[]}
     *     An array of absolute paths to the found files
     */
    public findFiles(inDirectory: string, recursive: boolean = false): string[] {
        inDirectory = this.string.trimRight(inDirectory, '/');

        // Non recursive searches involve a simple file check
        if (!recursive) {
            return (fs.existsSync(`${inDirectory}/${ConfigLoader.defaultConfigFileName}`))
                ? [`${inDirectory}/${ConfigLoader.defaultConfigFileName}`]
                : [];
        }

        // Recursive searches require globing
        return glob.sync(`${inDirectory}/**/${ConfigLoader.defaultConfigFileName}`);
    }

    /**
     * Load a config file into the instance
     *
     * @param {string} filePath
     */
    public load(filePath: string): void {
        if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
            throw new Error('Config file not found');
        }

        this.filePath = filePath;
        this.configData = dynamicRequire(filePath) as ConfigDataInterface;
    }

    /**
     * Returns the path to the config file handled by the class instance
     *
     * @return {string}
     */
    public getFilePath(): string {
        if (this.filePath === null) {
            throw new Error('No config loaded');
        }

        return this.filePath;
    }

    /**
     * Returns the config data object
     *
     * @return {ConfigDataInterface}
     */
    public getData(): ConfigDataInterface {
        if (this.configData === null) {
            throw new Error('No config loaded');
        }

        return this.configData;
    }

    /**
     * Creates a configuration file in the given directory with the given name.
     *
     * @param {string} inDir
     *     The path to the directory to create the config file in.
     * @param {string|null} withName
     *     The name of the configuration file to generate.
     *     If null the default filename will be used
     * @param {boolean} overwrite
     *     If a configuration file already exists in the determined location and
     *     this value is set to false an error will be thrown. Set to true to
     *     overwrite any existing file.
     * @param {boolean} dryRun
     *     Run all checks etc without actually copying the file.
     *
     * @return {string}
     *     The path to the created file (or to be created file if dry run).
     */
    public static createFile(
        inDir: string,
        withName: string|null = null,
        overwrite: boolean = false,
        dryRun: boolean = false
    ): string {
        // Ensure directory exists, and is a path to a directory and not a file.
        if (!fs.existsSync(inDir) || !fs.statSync(inDir).isDirectory()) {
            throw new Error(
                `Invalid inDir received. Ensure path exists and is a directory. Received: ${inDir}`
            );
        }

        // Determine file name
        const filePath = (withName !== null)
            ? `${inDir}/${withName}`
            : `${inDir}/${ConfigLoader.defaultConfigFileName}`;

        // Check whether file can be created
        if (!overwrite && fs.existsSync(filePath)) {
            throw new Error(`Configuration file already exists at: ${filePath}`);
        }

        // Find the default file path
        // Required so default file can be found when package is in various states.
        let defaultFilePath = null;
        [
            // When package is linked it exists as the appRoot
            path.resolve(appRoot, 'assets/config/default.cf.config.js'),
            // This is the path relative to the build output file.
            path.resolve(__dirname, '../assets/config/default.cf.config.js')
        ].forEach((defaultFileSearchPath: string) => {
            if (fs.existsSync(defaultFileSearchPath)) {
                defaultFilePath = defaultFileSearchPath;
            }
        });

        // If not found throw error
        if (defaultFilePath === null) {
            throw new Error('Internal error. Failed to find default config file. Please create manually.');
        }

        // Create as necessary
        if (!dryRun) {
            fs.copyFileSync(defaultFilePath, filePath);
        }

        return filePath;
    }

}
