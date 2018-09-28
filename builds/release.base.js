const webpack = require('webpack');
const config = require('./webpack.base');
const source = require('./source.base');
const getVersion = require('./get-version');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const outPath = source.outputPath;
console.log(getVersion());
config.module.rules.push({
    test: /index\.js$/,
    loader: 'webpack-replace',
    query: {
      replace: [{
        from: 'REPLACE_VERSION',
        to: getVersion().verision
      }]
    }
  })
config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    },
    sourceMap: true,
    beautify: true
  }));
  config.plugins.push(new CleanWebpackPlugin([outPath],　 //匹配删除的文件
    {
        verbose:  true,        　　　　　　　　　　//开启在控制台输出信息
        dry:      false        　　　　　　　　　　//启用删除文件
    })
  )

module.exports = config