module.exports = {
    dump: require('./utility/utility.dump'),
    path: require('./utility/utility.path'),
    string: new (require('./utility/utility.string'))(),
    yaml: new (require('./utility/utility.yaml'))()
};