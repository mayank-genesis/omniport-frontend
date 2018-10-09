const path = require('path')
const webpack = require('webpack')

require('@babel/polyfill')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const PRODUCTION = process.env.NODE_ENV === 'production'

/*
  Webpack uses `publicPath` to determine where the app is being served from

  In development, we always serve from the root, which makes config easier
 */
const PUBLIC_PATH = PRODUCTION ? '' : '/'

/*
  The base directory, an absolute path, for resolving entry points
  and loaders from configuration
 */
const context = path.resolve(__dirname, '../core')

/*
  This is the Webpack common config

  Both dev and prod configs are cascadingly derived from this
 */
module.exports = {
  // This context is required to be here for CSS Modules Babel plugin to work
  context,

  /*
    These are the 'entry points' to our application, which means
    they will be the 'root' imports that are included in JS bundle

    The first two entry points enable "hot" CSS and auto-refreshes for JS
   */
  entry: {
    core: ['@babel/polyfill', 'core/index.js']
  },

  // Because JavaScript can be written for both server and browser
  target: 'web',

  /*
    The stats option lets you precisely control what bundle
    information gets displayed
   */
  stats: 'minimal',

  /*
    The top-level output key contains set of options instructing Webpack on
    how it should output your bundles, assets and everything else
   */
  output: {
    path: path.resolve(__dirname, '../', 'build'),
    filename: 'js/[name]-bundle.js',
    publicPath: PUBLIC_PATH
  },

  module: {
    rules: [
      // HTML

      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader'
        }
      },

      // JavaScript

      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react', '@babel/preset-env'],

          plugins: [
            'transform-react-jsx',
            [
              'react-css-modules',
              {
                context, // CSS Modules Babel plugin requires this to be here
                generateScopedName: '[hash:base64:7]'
                // Class hashes generated by CSS Modules are in the form [hash:base64:5]
              }
            ]
          ]
        }
      },

      // Stylesheets

      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader?importLoaders=1&modules&localIdentName=[hash:base64:7]'
          // Class hashes generated by CSS Modules are in the form [hash:base64:7]
        ]
      },

      {
        test: /\.json$/,
        type: 'javascript/auto',
        loader: 'file-loader',
        include: /\.\/config/
      },

      // Assets

      {
        test: /\.ico$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },

      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]'
        }
      },

      {
        test: /\.(ttf|eot|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      },

      // Ignored

      {
        test: /\.md$/,
        loader: 'null-loader'
      }
    ]
  },

  // Set Node path
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'core'), // Enable absolute imports from core
      path.resolve(__dirname, 'formula_one'), // Enable absolute imports from formula_one
      path.resolve(__dirname, 'services'), // Enable absolute imports from services
      path.resolve(__dirname, 'apps') // Enable absolute imports from apps
    ],
    extensions: ['.js', '.json', '.jsx', '.css'],
    alias: {
      core: path.resolve(__dirname, '../', 'core'),
      formula_one: path.resolve(__dirname, '../', 'formula_one'),
      services: path.resolve(__dirname, '../', 'services'),
      apps: path.resolve(__dirname, '../', 'apps')
    }
  },

  // Toggles performance suggestions
  performance: {
    hints: false
  },

  // The default behavior of the SplitChunksPlugin
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  plugins: [
    // Enables Hot Module Replacement, otherwise known as HMR */
    new webpack.HotModuleReplacementPlugin(),

    // Removes or cleans your build folders before building
    new CleanWebpackPlugin(['build']),

    // Skips the emitting phase whenever there are errors while compiling
    new webpack.NoEmitOnErrorsPlugin(),

    // Causes the relative path of the module to be displayed when HMR is enabled
    new webpack.NamedModulesPlugin(),

    // Allows you to create global constants configurable at compile time
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env.NODE_ENV),
      __DEV__: true
    }),

    // The following will cause those locale files to be ignored (to reduce bundle size)
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    // Simplifies creation of HTML files to serve your webpack bundles
    new HtmlWebpackPlugin({
      title: 'Production',
      template: '../core/public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      inject: true
    })
  ]
}