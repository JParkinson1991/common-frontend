/**
 * @file
 * CommandOptionsDefinitionInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

/**
 * Interface CommandOptionsDefinitionInterface
 *
 * Structure definition for the definition of a command option.
 *
 * @property {string} option
 *     The option flag, name and any value it takes declared inside < >
 *     Example: -f, --force
 *              -n, --name <name>
 * @property {string} description
 *     A brief description of the option and what it controls
 * @property {string} default
 *     A default value to assign to options that take a value
 *     If not defined the option value must be provided by the caller.
 */
export default interface CommandOptionsDefinitionInterface {
    option: string;
    description: string;
    default?: string;
}
