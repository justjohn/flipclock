const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './www/css/app.less',
  output: {
    path: path.resolve(__dirname, 'www/css'),
    filename: 'app.css', // This output filename is a placeholder, as CSS is extracted
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'app.css',
    }),
  ],
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
  },
};
