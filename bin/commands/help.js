const fs = require('fs');
const path = require('path');

const helpDir = path.resolve(__dirname, '..', 'help');
const defaultHelpFile = path.resolve(helpDir, 'default.txt');

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

    let helpFile = path.resolve(__dirname, '..', 'help', subCmd + '.txt');

    if(fs.existsSync(helpFile)){
        renderFile(helpFile);
    }
    else{
        renderFile(defaultHelpFile);
    }
};