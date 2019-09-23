const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
var path = require("path");

module.exports = {
  entry: {
    app: ["./src/js/ModelVisualizer.js"]
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "model-visualizer.js",
    library: "ModelVisualizer",
    libraryExport: "default"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.js$/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          "css-loader"
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "model-visualizer.css"
    }),
    new VueLoaderPlugin()
  ],
  externals: {
    "dagre-d3": "dagreD3",
    vue: "Vue"
  }
};
