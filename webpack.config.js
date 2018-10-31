const webpack = require('webpack');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const postcss = require('postcss')
const postcssPresetEnv = require('postcss-preset-env')
const postcssImport = require('postcss-import')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const mode = process.env.NODE_ENV || 'development';
const dev = mode === 'development';

const preprocess = require('svelte-preprocess')({
  transformers: {
    postcss: {
      plugins: [
        postcssImport({
          path: ["src"],
        }),
        postcssPresetEnv(),
      ]
    },
  }
})

module.exports = {
  client: {
    entry: config.client.entry(),
    output: config.client.output(),
    resolve: {
      extensions: ['.js', '.json', '.html'],
      mainFields: ['svelte', 'module', 'browser', 'main']
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: {
            loader: 'svelte-loader',
            options: {
              dev,
              hydratable: true,
              hotReload: true,
              css: true,
              preprocess
              // preprocess: {
              //   style: ({ content, attributes, filename }) => {
              //     console.log("Client: Processing style:", { content, attributes, filename } )
              //     // if (attributes.type !== 'text/postcss') {
              //     //   return;
              //     // }
              //     return new Promise((resolve, reject) => {
              //       postcss([
              //         postcssImport({
              //           path: ["src"],
              //         }),
              //         postcssPresetEnv(),
              //       ]).process(content, {
              //           from: 'src',
              //           map: {
              //             inline: false,
              //           },
              //       }).then(result => {
              //         console.log(filename, '-->', result.css.toString())
              //         resolve({
              //           code: result.css.toString(),
              //           map: result.map.toString(),
              //         });
              //       }).catch(err => reject(err));
              //     });
              //   },
              // },

            }
          }
        }, {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: { modules: true, sourceMap: true }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  postcssImport({
                    path: ['src']
                  }),
                  postcssPresetEnv()
                ]
              }
            }
          ]
        }
      ]
    },
    mode,
    plugins: [
      dev && new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.browser': true,
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      // new MiniCssExtractPlugin(),
    ].filter(Boolean),
    devtool: dev && 'inline-source-map'
  },

  server: {
    entry: config.server.entry(),
    output: config.server.output(),
    target: 'node',
    resolve: {
      extensions: ['.js', '.json', '.html'],
      mainFields: ['svelte', 'module', 'browser', 'main']
    },
    externals: Object.keys(pkg.dependencies).concat('encoding'),
    module: {
      rules: [
        {
          test: /\.html$/,
          use: {
            loader: 'svelte-loader',
            options: {
              css: false,
              generate: 'ssr',
              dev,
              preprocess,
            }
          }
        }
      ]
    },
    mode: process.env.NODE_ENV,
    performance: {
      hints: false // it doesn't matter if server.js is large
    }
  },

  serviceworker: {
    entry: config.serviceworker.entry(),
    output: config.serviceworker.output(),
    mode: process.env.NODE_ENV
  }
};
