const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var path = require("path");

module.exports = {
  entry: {
    app: ["./src/js/ModelVisualizer.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "bundle.js",
    library: "ModelVisualizer",
    libraryExport:"default"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{
            loader:MiniCssExtractPlugin.loader,
        }, "css-loader"]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
    }),
  ], 
  externals: {
    "dagre-d3": 'dagreD3'
  }
};
