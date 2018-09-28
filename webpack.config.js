const webpack = require('webpack');


let config
const env = process.env.NODE_ENV;
console.log('Webpack run env:' + env)


if (env === 'release') {
  config = require('./builds/release.base');
} else {
  config = require('./builds/static.base');
}





module.exports = config