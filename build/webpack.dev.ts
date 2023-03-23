import { Configuration as WebpackConfiguration } from 'webpack';
import { merge } from 'webpack-merge';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import path from 'path';
import baseConfig from './webpack.base';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration
}

const host = '127.0.0.1';
const port = '8002';

const devConfig: Configuration = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    host,
    port,
    open: true,
    compress: false, // 开发环境不开启gzip
    hot: true,
    historyApiFallback: true,
    setupExitSignals: true, // 允许在 SIGINT 和 SIGTERM 信号时关闭开发服务器和退出进程
    static: {
      directory: path.join(__dirname, '../public'), // 托管静态文件夹
    },
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});

export default devConfig;
