const path = require("path");
const ReactServerWebpackPlugin = require("react-server-dom-webpack/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: [path.resolve(__dirname, "./src/index.js")],
  output: {
    path: path.resolve(__dirname, "./public"),
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ReactServerWebpackPlugin({ isServer: false }),
    new HtmlWebpackPlugin({ template: "index.html" }),
  ],
};
