/**
 * @file
 * Application.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */
import { Command } from 'commander';
import CommandArgumentsInterface from './command/CommandArgumentsInterface';
import CommandRepository from './command/CommandRepository';
import CommandInterface from './command/CommandInterface';

/**
 * Class Application
 *
 * Responsible for bootstrapping cli application using commander and
 * repository of commands
 */
export default class Application {

    /**
     * Application version number
     */
    public version = '1.0.0';

    /**
     * Commander class, used to build application
     */
    private commander: Command;

    /**
     * Command repository, contains application commands
     */
    private commandRepository: CommandRepository;

    /**
     * Application Constructor
     *
     * @param {Command} commander
     *     The commander object, configuration of commander can be done outside
     *     of this application class prior to object construction if required.
     * @param {CommandRepository} commandRepository
     *     Repository containing the commands to build the application with.
     */
    constructor(commander: Command, commandRepository: CommandRepository) {
        this.commander = commander;
        this.commandRepository = commandRepository;
    }

    /**
     * Runs the application
     *
     * @return {void}
     */
    public run(): void {
        // Set the command version from what is set in the application
        this.commander.version(this.version);

        // For each of the commands in the repository, configure commander
        // to process them
        this.commandRepository.dump().forEach((definition: CommandInterface) => {
            // Create a sub command to attach to the application
            // Use the command string from the definition to initialise it
            const subCommand = this.commander.command(definition.commandString());

            // Set the description
            subCommand.description(definition.description());

            // Add all options
            definition.options().forEach((optionDefinition) => {
                // Only add default options if they are defined
                // Do not pass null value as default as this will be handled
                // by commander and output to user when executing help etc.Ω
                if (
                    Object.prototype.hasOwnProperty.call(optionDefinition, 'default')
                    && typeof optionDefinition.default === 'string'
                ) {
                    subCommand.option(
                        optionDefinition.option,
                        optionDefinition.description,
                        optionDefinition.default
                    );
                }
                else {
                    subCommand.option(
                        optionDefinition.option,
                        optionDefinition.description,
                    );
                }
            });

            // Define the action
            subCommand.action((...argsRaw) => {
                // Extract the commander object so it can be passed as its
                // own argument to the sub commands action method
                const commanderObject: Command = argsRaw.splice(-1, 1).pop();

                // Process argument data creating an object of key value
                // pairs to pass to the sub command action method
                const argumentData: CommandArgumentsInterface = {};
                argsRaw.forEach((arg, argIndex) => {
                    // eslint-disable-next-line no-underscore-dangle
                    argumentData[commanderObject._args[argIndex].name] = arg;
                });

                // Delegate routing to the sub action
                definition.action(commanderObject, argumentData, commanderObject.opts());
            });
        });

        // No arguments passed, output help
        if (process.argv.slice(2).length === 0) {
            this.commander.outputHelp();
        }

        // Parse process args, run commander, run application.
        this.commander.parse(process.argv);
    }

}
