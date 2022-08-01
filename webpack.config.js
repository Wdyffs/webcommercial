const path = require("path");
const nodeExternals = require("webpack-node-externals");
const MarkoPlugin = require("@marko/webpack/plugin").default;
const SpawnServerPlugin = require('spawn-server-webpack-plugin');
const CSSExtractPlugin = require('mini-css-extract-plugin');

const spawnedServer = new SpawnServerPlugin({})

const markoPlugin = new MarkoPlugin();
const filenameTemplate = `[name].[contenthash:8]`;

module.exports = [
  compiler({
    name: "browser",
    target: "web",
    devtool: 'inline-source-map',
    output: {
      filename: `${filenameTemplate}.js`,
      path: path.join(__dirname, "dist/assets"),
    },
    devServer: {
          hot: false,
          static: false,
          host: "0.0.0.0",
          allowedHosts: "all",
          port: process.env.PORT || 4000,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          ...spawnedServer.devServerConfig,
        },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/,
          use: [CSSExtractPlugin.loader,"css-loader", "sass-loader"],
        },
        {
          test: /\.(jpg|jpeg|gif|png|svg)$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      markoPlugin.browser,
      new CSSExtractPlugin({
        filename: `${filenameTemplate}.css`,
        ignoreOrder: true,
      }),
    ],
  }),
  compiler({
    name: "server",
    target: "async-node",
    devtool: "source-map",
    externals: [
      // Exclude node_modules, but ensure non js files are bundled.
      // Eg: `.marko`, `.css`, etc.
      nodeExternals({
        allowlist: [/\.(?!(?:js|json)$)[^.]+$/],
      }),
    ],
    optimization: {
      minimize: false,
    },
    output: {
      libraryTarget: "commonjs2",
      path: path.join(__dirname, "dist"),
      // devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    module: {
      rules: [
        {
          test: /\.(jpg|jpeg|gif|png|svg)$/,
          generator: { emit: false },
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      spawnedServer,
      markoPlugin.server,
    ],
  }),
];

// Shared config for both server and client compilers.
function compiler(config) {
  return {
    ...config,
    mode: "development",
    stats: "normal",
    cache: {
      type: "filesystem",
    },
    output: {
      ...config.output,
      publicPath: "/assets/",
      assetModuleFilename: `${filenameTemplate}[ext][query]`,
    },
    resolve: {
      extensions: [".js", ".json"],
    },
    module: {
      rules: [
        ...config.module.rules,
        {
          test: /\.marko$/,
          loader: "@marko/webpack/loader",
        },
      ],
    },
    plugins: config.plugins.filter(Boolean),
  };
}
