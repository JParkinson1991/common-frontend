const util = require('util');

module.exports = {

    dumpObject: function(object, showHidden = false){
        return util.inspect(object, {
            'showHidden': showHidden,
            'depth': null,
            'colors': true
        });
    }

};