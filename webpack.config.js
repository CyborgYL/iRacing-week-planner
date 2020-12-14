const path = require('path');
const webpack = require('webpack');
const cp = require('child_process');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';
const isDevelopment = env === 'development';

let version;

try {
  version = cp.execSync('git rev-parse HEAD', {
    cwd: __dirname,
    encoding: 'utf8',
  });
} catch (err) {
  console.log('Error getting revision', err); // eslint-disable-line no-console
  process.exit(1);
}

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: [autoprefixer],
  },
};

module.exports = {
  mode: env,
  devtool: env === 'development' ? 'inline-source-map' : false,
  entry: {
    main: './src/index',
    ie8: './src/ie8',
  },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: '[name].js',
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, 'src')],
        use: [
          'babel-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
            },
          },
          postcssLoader,
          'sass-loader',
        ],
        exclude: /\.module\.css$/
      },
      {
        test: /\.scss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-modules-flow-types-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: isDevelopment,
            },
          },
          postcssLoader,
          'sass-loader',
        ],
        include: /\.module\.css$/
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-modules-flow-types-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: isDevelopment,
            },
          },
          postcssLoader,
        ],
        include: /\.module\.css$/
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
            },
          },
          postcssLoader,
        ],
        exclude: /\.module\.css$/
      },
      {
        test: /\.(png|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
          },
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
    ],
  },
  plugins: env === 'production' ? [
    new webpack.DefinePlugin({
      __DEV__: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.CODE_VERSION': JSON.stringify(version),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de|es|fr|nl|pt|pl|da|it|sv|cs|fi|hu|ca/),
    // new BundleAnalyzerPlugin(),
  ] : [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.CODE_VERSION': JSON.stringify(version),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    compress: true,
    port,
    hot: true,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        test: /\.m?jso?n?(\?.*)?$/i,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
};
