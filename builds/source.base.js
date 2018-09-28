var path = require('path');

const Config = {
    entry: path.resolve(__dirname, '../src/app.js'),                  // 项目入口文件
    outputFileName: 'index.js',                    // 项目输出文件名
    outputPath: path.resolve(__dirname, '../dist'),                   // 普通模式下打包输出文件夹
    outputReleasePath: path.resolve(__dirname, '../release'),         // 压缩模式下打包输出文件夹
    outputLibrary: 'APP',                               // 项目对外命名
    outputLibraryTarget: 'umd'                          // 打包对外模式, 默认 var, 可选umd、amd等
};

module.exports = Config;