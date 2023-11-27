'use strict';

module.exports = {
  plugins: ['typescript', 'scss'],
  options: {
    buildType: 'iso'
  },
  modifyWebpackConfig({
    env: {
      target,
      dev,
    },
    webpackConfig,
    webpackObject,
    options: {
      pluginOptions,
      razzleOptions,
      webpackOptions,
    },
    paths,
  }) {
    //output path configuration
    webpackConfig.output.path = paths.appBuild; //appBuild path

    //devtool
    webpackConfig.devtool = dev ? 'source-map' : false;

    return webpackConfig;
  }
};
