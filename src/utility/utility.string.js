const _doTrimLeft = Symbol('doTrimLeft');
const _doTrimRight = Symbol('doTrimRight');
const _charactersToArray = Symbol('charactersToArray');

/**
 * String utility class
 *
 * Provides string manipulation methods
 */
class String {

    /**
     * Trim a character(s) and whitespace from the provided string
     *
     * @param {string} string
     *     The string to trim
     * @param {string|array} characters
     *     Either a single character in a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     *     The trimmed string
     */
    trim(string, characters = []) {
        string = string.trim();
        characters = this[_charactersToArray](characters);
        if(characters.length === 0){
            return string;
        }

        string = this[_doTrimLeft](string, characters);
        string = this[_doTrimRight](string, characters);

        return string;
    };

    /**
     * Trim a character(s) and whitespace from the left/start of the provided string
     *
     * @param {string} string
     *     The string to trim
     * @param {string|array} characters
     *     Either a single character in a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     *     The trimmed string
     */
    trimLeft(string, characters){
        string = string.trim();
        characters = this[_charactersToArray](characters);
        if(characters.length === 0){
            return string;
        }

        return this[_doTrimLeft](string, characters);
    }

    /**
     * Trim a character(s) and whitespace from the right/end of the provided string
     *
     * @param {string} string
     *     The string to trim
     * @param {string|array} characters
     *     Either a single character in a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     *     The trimmed string
     */
    trimRight(string, characters){
        string = string.trim();
        characters = this[_charactersToArray](characters);
        if(characters.length === 0){
            return string;
        }

        return this[_doTrimRight](string, characters);
    }

    /**
     * Private method handling left trim of string
     *
     * @param {string} string
     *     The string to trim
     * @param {string|array} characters
     *     Either a single character a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     *     The trimmed string
     */
    [_doTrimLeft](string, characters){
        while(characters.indexOf(string.charAt(0)) > -1){
            string = string.substring(1);
        }

        return string;
    }

    /**
     * Private method handling right trim of string
     *
     * @param {string} string
     *     The string to trim
     * @param {string|array} characters
     *     Either a single character a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {string}
     *     The trimmed string
     */
    [_doTrimRight](string, characters){
        while(characters.indexOf(string.charAt(string.length-1)) > -1){
            string = string.substring(0,string.length-1);
        }

        return string;
    };

    /**
     * Private method used to convert character argument to array
     *
     * @param {string|array} characters
     *     Either a single character in a string
     *     A string of characters separated by a space
     *     An array of characters
     *
     * @returns {array}
     *     The characters array
     */
    [_charactersToArray](characters){
        if(typeof characters === 'undefined'){
            return [];
        }

        if(typeof characters === 'string'){
            characters = characters.trim().split(' ');
        }

        if(Array.isArray(characters)){
            return characters;
        }

        //throw error here
        throw new Error('Invalid characters argument. Expected array|string')
    }

}

module.exports = String;