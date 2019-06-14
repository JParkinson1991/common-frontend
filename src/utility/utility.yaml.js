const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Yaml handling utility class
 */
class Yaml {

    /**
     * Loads yaml from the provided file
     *
     * @param {string} filePath
     *     The path to the yaml file to load
     *
     * @returns {object}
     *     Object representation of the yaml file
     */
    loadFile(filePath){
        if(fs.existsSync(filePath) === false){
            throw new Error('File not found at: ' + filePath);
        }

        return yaml.safeLoad(fs.readFileSync(filePath));
    }

}

module.exports = Yaml;