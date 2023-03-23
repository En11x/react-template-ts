import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import CopyPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import baseConfig from './webpack.base';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const globAll = require('glob-all');

const path = require('path');

const prodConfig: Configuration = merge(baseConfig, {
  mode: 'production', // 生产模式,会开启tree-shaking和压缩代码,以及其他优化
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'), // copy public
          to: path.resolve(__dirname, '../dist'), // 复制到dist
          filter: (source) => !source.includes('index.html'), // 忽略index.html
        },
      ],
    }),

    // 打包时抽离css
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css', // 抽离css的输出目录和名称
    }),
    // 清理无用css，检测src下所有tsx文件和public下index.html中使用的类名和id和标签名称
    // 只打包这些文件中用到的样式
    new PurgeCSSPlugin({
      paths: globAll.sync([`${path.join(__dirname, '../src')}/**/*`, path.join(__dirname, '../public/index.html')], { nodir: true }),
      only: ['dist'],
      safelist: {
        standard: [/^ant-/], // 过滤以ant-开头的类名，哪怕没用到也不删除
      },
    }),
  ],
  optimization: {
    minimizer: [
      // 压缩css
      new CssMinimizerPlugin(),
      // 压缩js
    ],
    // 代码分割，第三方包和公共代码
    splitChunks: {
      cacheGroups: {
        vendors: {
          // 提取node_modules代码
          test: /node_modules/,
          name: 'vendors', // 提取文件命名为vendors,js后缀和chunkhash会自动加
          minChunks: 1, // 只要使用一次就提取
          chunks: 'initial', // 只提取初始化就获取到的模块，异步的不管
          minSize: 0, // 大于0就提取
          priority: 1,
        },
        commons: {
          // 提取页面公共代码
          name: 'commons',
          minChunks: 2, // 使用2次就提取
          chunks: 'initial',
          minSize: 0,
        },
      },
    },
  },
});

export default prodConfig;
