//Pull in required libraries
const cfConsole = require('../../src/console');
const fs = require('fs');
const path = require('path');
const sassLint = require('sass-lint');

//Define the default configuration file path
const defaultConfigFile = path.resolve(__dirname, '../../config', 'default.sass-lint.yml');

/**
 * Resolves a path from the process root unless absolute
 *
 * On receiving a file path this function will,
 * - Resolve relative file paths from the cwd() root
 *
 * @param {string} $filePath
 *     The file path to process
 *
 * @returns {string}
 *     The processed path or false on failure
 */
function resolvePath($filePath){
    if(path.isAbsolute($filePath) === false) {
        $filePath = path.resolve(process.cwd(), $filePath);
    }

    return $filePath;
}


module.exports = (args) => {
    //Fetch and resolve the sourceDir
    let sourceDir = args._[1];
    if(typeof(sourceDir) === 'undefined'){
        cfConsole.error('No source path provided');
        process.exit(1);
    }
    sourceDir = resolvePath(sourceDir);

    //Determine configuration file
    let configFile = defaultConfigFile;
    if(args.config || args.c){
        let configArg = (args.config)
            ? args.config
            : args.c;

        if(!fs.existsSync(configArg)){
            console.error(chalk.red('Error:') + ' Failed to find config file - ' + configArg);
            process.exit(1);
        }

        configFile = configArg;
    }

    //Output notices
    cfConsole.notice('Linting files at ' + sourceDir);
    cfConsole.notice((configFile === defaultConfigFile)
        ? 'Using default configuration'
        : 'Using configuration file ' + configFile
    );

    //Load the configuration file
    let config = sassLint.getConfig({}, configFile);

    //Lint and store all results
    let results = sassLint.lintFiles(sourceDir, config);

    //If the -v|--verbose flag passed, output the entire report
    //Else use standard functionality, (high level report, non 0 exit on error)
    if(args.verbose || args.v){
        sassLint.outputResults(results);

        //Initialise default exit code, further checks will alter as required
        let exitCode = 0;

        //If max warnings has been defined in configuration
        if(typeof(config.options['max-warnings']) !== 'undefined'){
            let warningCount = sassLint.warningCount(results).count;

            if(warningCount > 0 && warningCount > config.options['max-warnings']){
                exitCode = 1;
            }
        }

        //Check for errors
        if(sassLint.errorCount(results).count){
            exitCode = 1;
        }

        process.exit(exitCode);
    }

    //No verbose output to handle run checks against
    //Use standard functionality (high level error report, non 0 exit on error)
    sassLint.failOnError(results, config);
};