const cfBuild = require('../../src/build');
const cfConsole = require('../../src/console');
const cfUtility = require('../../src/utility');
const fs = require('fs');
const path = require('path');

module.exports = (args) => {
    //Default the configuration storage dir to current working directory
    //If a directory argument provided process it
    let configDir = process.cwd();
    if(args.dir || args.d){
        let dirArg = (args.dir || args.d);
        if(typeof dirArg !== 'string'){
            cfConsole.error('Directory flag used but no path provided.');
            process.exit(1);
        }

        configDir = cfUtility.path.absoluteOrResolvedFrom(dirArg, process.cwd());
        if(fs.existsSync(configDir) === false){
            cfConsole.error(configDir + ' does not exist');
            process.exit(1);
        }

        configDir = path.dirname(configDir); //Just in case a file passed
    }

    //Default the name of the config file to name of the directory it is being saved to
    let configName = path.basename(configDir);
    if(args.name || args.n){
        let nameArg = (args.name || args.n);
        if(typeof nameArg !== 'string'){
            cfConsole.error('Name flag used but no name provided.');
            process.exit(1);
        }

        configName = nameArg;
    }

    //Determine if init to be forced
    let force = (args.force || args.f || false);

    //Create the config
    try {
        let buildConfig = cfBuild.config.create(configDir, configName, force);

        cfConsole.success('Configuration file created at ' + buildConfig.getConfigFilePath());
        process.exit(0);
    }
    catch(e){
        cfConsole.error(e.message);
        process.exit(1);
    }
};