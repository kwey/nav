const config = require('./webpack.base');
config.devtool = 'cheap-module-eval-source-map';
config.watch = true;

module.exports = config