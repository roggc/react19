const path = require("path");
const ReactServerWebpackPlugin = require("react-server-dom-webpack/plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: [
    // path.resolve(
    //   __dirname,
    //   "./node_modules/react19-setup-module/dist/client.js"
    // ),
    path.resolve(__dirname, "./setup/client.jsx"),
  ],
  output: {
    path: path.resolve(__dirname, "./public"),
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ReactServerWebpackPlugin({ isServer: false }),
    new HtmlWebpackPlugin({ template: "index.html" }),
  ],
};
