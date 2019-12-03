/**
 * @file
 * Yaml.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

import * as fs from 'fs';
import { safeLoad as yamlSafeLoad } from 'js-yaml';
import { injectable } from 'inversify';
import 'reflect-metadata';
import YamlInterface from './YamlInterface';

/**
 * Interface YamlInterface
 */
@injectable()
export default class Yaml implements YamlInterface {

    /**
     * Loads yaml from the provided file
     *
     * @param {string} filePath
     *     The path to the yaml file to load
     *
     * @returns {object}
     *     Object representation of the yaml file
     */
    public loadFile(filePath: string): {} {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }

        return yamlSafeLoad(fs.readFileSync(filePath).toString());
    }

}
