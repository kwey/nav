const config = require('./webpack.base');

config.devtool = 'cheap-eval-source-map';
config.watch = true;

module.exports = config