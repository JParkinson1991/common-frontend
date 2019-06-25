const cfBuild = require('../../src/build');
const cfConsole = require('../../src/console');
const cfUtility = require('../../src/utility');

module.exports = (args) => {
    //Attempt to instantiate the build configuration
    //Either through command option/argument or discovery from process working dir
    try {
        var buildConfig = (args.config || args.c)
            ? new cfBuild.config(cfUtility.path.absoluteOrResolvedFrom(
                  (args.config || args.c),
                  process.cwd())
              )
            : cfBuild.config.discover(process.cwd());
    }
    catch(e){
        cfConsole.error(e.message);
        process.exit(1);
    }

    //Build mode instantiated successfully at this point
    //Configure from context
    var buildMode = 'Production';
    buildConfig.setSassOutputStyle('compressed'); //Set a sensible default that doesnt break sourcemaps etc
    if(args.d || args.dev || args.development){
        buildMode = 'Development';

        buildConfig.setProduction(false);
        buildConfig.setSourceMaps(true);
        buildConfig.setProcess(false);
    }

    //Override output style if required
    if(args['sass-output-style'] && typeof args['sass-output-style'] === 'string'){
        buildConfig.setSassOutputStyle(args['sass-output-style']);
    }

    //Disable clean if require
    if(args['no-clean']){
        buildConfig.setClean(false);
    }

    //Enable notify if required
    if(args.n || args.notify){
        buildConfig.setNotifications(true);

        //If name provided, set it
        let buildName = (args.n || args.notify);
        if(typeof buildName === 'string'){
            buildConfig.setBuildName(buildName);
        }
    }

    //Ensure this runs after dev checks
    //dev disables processing by default
    if(args.process){
        buildConfig.setProcess(true);
    }

    //Create the runner from the build config
    let runner = new cfBuild.runner(buildConfig);

    //Prebuild outputs
    cfConsole.notice('Building from ' + buildConfig.getConfigFilePath());
    cfConsole.notice('Build mode - ' + buildMode);

    let watch = (args.watch || args.w || false);
    if(watch === false){
        runner.build(function(err, stats){
            let exitCode = cfBuild.runner.cliOutput(err, stats);
            process.exit(exitCode);
        });
    }
    else{
        cfConsole.notice('Enabling watch');

        let watchOptions = {};
        if(typeof args['watch-proxy'] === 'string'){
            watchOptions.proxy = args['watch-proxy'];
        }

        if(typeof args['watch-proxy-delay'] === 'number' && args['watch-proxy-delay'] > 0){
            watchOptions.reloadDelay = args['watch-proxy-delay'];
        }

        runner.watch(watchOptions,function(err, stats){
            cfBuild.runner.cliOutput(err, stats);
        });
    }
};