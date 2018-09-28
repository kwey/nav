var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.js');

var contentBase = 'http://localhost:8080/webpack-dev-server/';

new WebpackDevServer(webpack(config), {
    contentBase: contentBase,
    hot: true,
    historyApiFallback: false,
    compress: false,
    quiet: true,
    noInfo: false,
    lazy: true,
    watchOptions: {
        aggregateTimeout: 10,
        poll: 1000
    },
    headers: {
        "X-Custom-Header": "yes",
        'Access-Control-Allow-Origin': '*'
    },
    stats: { colors: true }
}).listen(8080, 'localhost', function (err, result) {
    if (err) {
        console.log(err);
    }

    console.log('Listening at localhost:8080');
});