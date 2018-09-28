

module.exports = function () {
    var GitRevisionPlugin = require('git-revision-webpack-plugin'),
        pkg = require('../package.json');
    var hash = '',
        commit = '';
    try {
        var gitRevision = new GitRevisionPlugin();
        commit = gitRevision.version();
        hash = gitRevision.commithash();
    } catch (error) {
        
    }

    return {
        verision: pkg.version,
        hash: hash,
        commit: commit,
    }
}