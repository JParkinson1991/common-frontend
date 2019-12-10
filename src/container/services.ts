/**
 * @file
 * types.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

const Services = {
    // Application Commands
    BuildCommand: Symbol('BuildCommand'),
    HelpCommand: Symbol('HelpCommand'),
    InitCommand: Symbol('InitCommand'),
    ServerCommand: Symbol('ServerCommand'),
    VersionCommand: Symbol('VersionCommand'),

    // Internal Classes
    ConfigLoader: Symbol('ConfigLoader'),
    ConsoleOutput: Symbol('ConsoleOutput'),
    Path: Symbol('Path'),
    String: Symbol('String'),
    WebpackRunner: Symbol('WebpackRunner'),
    Yaml: Symbol('Yaml'),

    // Third party
    Inquirer: Symbol('inquirer')
};

export default Services;
