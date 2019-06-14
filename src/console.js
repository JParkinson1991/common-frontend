const chalk = require('chalk');

/**
 * Simple formatting wrapper for use in console output
 *
 *
 * @type {{
 *     log: module.exports.log,
 *     success: module.exports.success,
 *     warning: module.exports.warning,
 *     error: module.exports.error,
 *     notice: module.exports.notice
 * }}
 */
module.exports = {

    /**
     * Simple wrapper around console.log function
     *
     * @param {string} output
     *     What to output
     */
    log: function(output){
        console.log(output);
    },

    /**
     * Centralises success message output format
     *
     * @param {string} message
     *     The success message to display
     */
    success: function(message){
        this.log(chalk.green('Success:') + ' ' + message.trim());
    },

    /**
     * Centralises warning message output format
     *
     * @param {string} message
     *     The warning message to display
     */
    warning: function(message){
        this.log(chalk.yellow('Warning:') + ' ' + message.trim());
    },

    /**
     * Centralises error message output format
     *
     * @param {string} message
     *     The error message to display
     */
    error: function(message){
        this.log(chalk.red('Error:') + ' ' + message.trim());
    },

    /**
     * Centralises notice message output form
     *
     * @param {string} message
     *     The notice message to display
     */
    notice: function(message){
        this.log(chalk.blue('Notice:') + ' ' + message.trim());
    }

};