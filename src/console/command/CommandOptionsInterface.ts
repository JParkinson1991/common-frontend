/**
 * @file
 * CommandOptionsInterface.ts
 *
 * @author Josh Parkinson <joshparkinson1991@gmail.com>
 */

/**
 * Interface CommandOptionsInterface
 *
 * Structure definition for command options that have been parsed and
 * assigned the relevant value.
 */
export default interface CommandOptionsInterface {
    [key: string]: string | boolean;
}
