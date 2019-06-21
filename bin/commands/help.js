const fs = require('fs');
const path = require('path');

const helpDir = path.resolve(__dirname, '..', 'help');
const defaultHelpFile = path.resolve(helpDir, 'default.txt');

/**
 * Renders a help file at the given path
 *
 * @param {string} $filePath
 *     The path of the file to render
 */
function renderFile($filePath){
    console.log(fs.readFileSync($filePath, 'utf8'));
}

module.exports = (args) => {
    let subCmd = (args._[0] === 'help')
        ? args._[1]
        : args._[0];

    //If no sub command passed, show the default help screen
    if(typeof(subCmd) === 'undefined'){
        renderFile(defaultHelpFile);
        return;
    }

    //Cleanup the sub command and create the help file path from it
    subCmd = subCmd.replace(/[^0-9a-z-]/gi, '_');
    let helpFile = path.resolve(__dirname, '..', 'help', subCmd + '.txt');

    //Render the help file, falling back to the default
    renderFile(fs.existsSync(helpFile)
        ? helpFile
        : defaultHelpFile
    );
};