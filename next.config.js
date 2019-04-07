const webpack = require("webpack");
const path = require("path");
const glob = require("glob");

require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

module.exports = {
  useFileSystemPublicRoutes: true,

  webpack: config => {
    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.${curr}`] = JSON.stringify(process.env[curr]);
      return acc;
    }, {});

    config.module.rules.push(
      {
        test: /\.(css|scss)/,
        loader: "emit-file-loader",
        options: {
          name: "dist/[path][name].[ext]",
        },
      },
      {
        test: /\.css$/,
        use: ["babel-loader", "raw-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          "babel-loader",
          "raw-loader",
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              includePaths: ["styles", "node_modules"]
                .map(d => path.join(__dirname, d))
                .map(g => glob.sync(g))
                .reduce((a, c) => a.concat(c), []),
            },
          },
        ],
      },
    );

    config.plugins.push(new webpack.DefinePlugin(env));

    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: "empty",
    };

    return config;
  },
};
