import path from 'path';
import webpack, { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as dotenv from 'dotenv';
import WebpackBar from 'webpackbar';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { isDev } from './constants';

// 加载环境配置
const envConfig = dotenv.config({
  path: path.resolve(__dirname, `../env/.env.${process.env.BASE_ENV}`),
});

const tsxRegex = /.(ts|tsx)$/;
const cssRegex = /\.css$/;
const imageRegex = /\.(png|jpe?g|gif|svg)$/i;

const styleLoadersArray = [
  isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: '[path][name]__[local]--[hash:5]',
      },
    },
  },
];

const baseConfig: Configuration = {
  entry: path.join(__dirname, '../src/index.tsx'),
  output: {
    filename: 'static/js/[name].[chunkhash:8].js', // js加上chunkhash
    path: path.join(__dirname, '../dist'),
    clean: true,
    publicPath: '/',
    // ... 这里自定义输出文件名的方式是，将某些资源发送到指定目录
    assetModuleFilename: 'images/[name].[contenthash:8][ext]', // webpack5 处理图片
  },
  // loader
  module: {
    rules: [
      {
        test: tsxRegex,
        exclude: /node_modules/,
        use: 'babel-loader',
        // use: ['thread-loader', 'babel-loader'], // 开启多线程，大项目开启
      },
      {
        test: cssRegex,
        use: styleLoadersArray,
      },
      {
        test: imageRegex,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 20 * 1024, // 小于10kb转base64
          },
        },
        generator: {
          filename: 'static/images/[name].[contenthash:8][ext]', // 文件输出目录和命名
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.less', '.css'],
    // 配置别名
    alias: {
      '@': path.join(__dirname, '../src'),
    },
    modules: ['node_modules'], // 查找第三方模块只在本项目的node_modules中查找
  },
  // plugins
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webpack5-react-ts',
      filename: 'index.html',
      // 复制 'index.html' 文件，并自动引入打包输出的所有资源（js/css）
      template: path.join(__dirname, '../public/index.html'),
      inject: true, // 自动注入静态资源
      hash: true,
      cache: false,
      // 压缩html
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true, // 去空格
        removeComments: true, // 去注释
        minifyJS: true, // 在脚本元素和事件属性中缩小JavaScript(使用UglifyJS)
        minifyCSS: true, // 缩小CSS样式元素和样式属性
      },
      nodeModules: path.join(__dirname, '../node_modules'),
    }),
    // 注入环境变量
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(envConfig.parsed),
      'process.env.BASE_ENV': JSON.stringify(process.env.BASE_ENV),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    new WebpackBar({
      color: '#85d',
      basic: false, // 开启日志
      profile: false, // 启用探查器
    }),
  ],
  // webpack5持久化缓存
  cache: {
    type: 'filesystem',
  },
};

export default baseConfig;
