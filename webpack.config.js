const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = function(env = {}) {
  console.log('****************')
  console.log('env config: ', env)
  console.log('****************')
  return {
    entry: './src/index',
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'wscn-video.js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                root: resolve(__dirname, 'src'),
                attr: ['img:src', 'link:href']
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html'
      }),
      new webpack.NamedModulesPlugin()
    ],
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src')
      }
    },
    devServer: {
      port: 9000
    }
  }
}
