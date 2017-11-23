/* eslint-disable */

var path = require('path');
var webpack = require('webpack');

var isDev = process.env.NODE_ENV !== 'production'
var config = {
  entry: path.join(__dirname, './render'),

  output: {
    path: path.resolve(__dirname, '../.prerender'),
    filename: 'render.js',
    libraryTarget: 'commonjs2',
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },

  target: 'node',

  module: {
    loaders: [
      {
        test: /\.md$/,
        loader: [
          'html-loader?{"minimize":false}',
          path.join(__dirname, '../build_helpers/markdownLoader')
        ].join('!')
      },
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
        loader: 'null-loader'
      },
      {
        test: /\.less$/,
        loader: 'null-loader'
      },
      {
        test: /\.png$/,
        loader: 'file-loader',
        query: { mimetype: 'image/png', name: 'images/[name]-[hash].[ext]' }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      '__DEV__': JSON.stringify(isDev || true)
    })
  ]
}

module.exports = config
