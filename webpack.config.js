const path = require('path');
const webpack = require('webpack');
const fallback = {};
Object.assign(fallback, {
  stream: require.resolve('stream-browserify'),
  querystring: require.resolve('querystring-es3')
});
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'swagger-snippet-generator.min.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'production',
  resolve: {
    fallback
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser.js'
    })
  ]
};
