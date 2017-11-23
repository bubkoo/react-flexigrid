/* eslint-disable */

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var isDev = process.env.NODE_ENV !== 'production'
var config = {

  entry: path.join(__dirname, './layout/Document'),

  output: {
    path: path.resolve(__dirname, '../.site/'),
    filename: isDev ? '[name].js' : '[name]-[hash].js',
    publicPath: '',
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  devtool: 'source-map',

  target: 'web',

  devServer: {
    host: '0.0.0.0',
  },

  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [
              require.resolve('babel-preset-env'), {
                useBuiltIns: true,
              },
            ],
            require.resolve('babel-preset-react'),
            require.resolve('babel-preset-stage-0'),
          ],
          plugins: [
            require.resolve('babel-plugin-add-module-exports'),
            require.resolve('babel-plugin-react-require'),
            require.resolve('babel-plugin-syntax-dynamic-import'),
          ],
          cacheDirectory: true,
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!less-loader',
        }),
      },
      {
        test: /\.png$/,
        loader: 'file-loader',
        query: { mimetype: 'image/png', name: 'images/[name]-[hash].[ext]' },
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin(isDev ? '[name].css' : '[name]-[hash].css'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __DEV__: JSON.stringify(isDev || true),
    }),
  ],
}

if (!isDev) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({ compressor: { warnings: false } }))
}

module.exports = config
