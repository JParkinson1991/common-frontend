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
import YamlInterface from '../utility/YamlInterface';
import StringInterface from '../utility/StringInterface';

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
     * The yaml loader
     *
     * @var {YamlInterface}
     */
    private yaml: YamlInterface;

    /**
     * The default configuration file location
     *
     * Due to webpack bundling ensure this path is correct for the output file.
     */
    private static defaultConfigFile = path.resolve(appRoot, 'docs/default.cf.config.yml');

    /**
     * The suffix of the files accepted by this class when loading config.
     */
    private static fileSuffix: string = '.cf.config.yml';

    /**
     *
     * @param {StringInterface} string
     * @param {YamlInterface} yaml
     */
    public constructor(
        @inject(Services.String) string: StringInterface,
        @inject(Services.Yaml) yaml: YamlInterface
    ) {
        this.string = string;
        this.yaml = yaml;
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

        return glob.sync(
            (recursive)
                ? `${inDirectory}/**/*${ConfigLoader.fileSuffix}`
                : `${inDirectory}/*${ConfigLoader.fileSuffix}`
        );
    }

    /**
     * Load a config file into the instance
     *
     * @param {string} filePath
     */
    public load(filePath: string): void {
        if (!filePath.endsWith(ConfigLoader.fileSuffix)) {
            throw new Error('Invalid config file name');
        }

        if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
            throw new Error('Config file not found');
        }

        this.filePath = filePath;
        this.configData = this.yaml.loadFile(this.filePath) as ConfigDataInterface;
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
     * @param {string} withName
     *     The name of the configuration file to generate.
     *     This name will be suffixed with the config file suffix defined in
     *     this class.
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

        const filePath = this.generatePath(inDir, withName);
        if (!overwrite && fs.existsSync(filePath)) {
            throw new Error(`Configuration file already exists at: ${filePath}`);
        }

        if (!dryRun) {
            fs.copyFileSync(this.defaultConfigFile, filePath);
        }

        return filePath;
    }

    /**
     * Returns a generated configuration file path.
     *
     * @param {string} inDir
     *     The path to the directory to create the config file in.
     * @param {string} withName
     *     The name of the configuration file to generate.
     *     This name will be suffixed with the config file suffix defined in
     *     this class.
     *
     * @return {string}
     */
    public static generatePath(inDir: string, withName: string|null = null): string {
        if (withName === null || withName === '') {
            return `${inDir}/${path.basename(inDir)}${this.fileSuffix}`;
        }


        return `${inDir}/${withName}${this.fileSuffix}`;
    }

}
