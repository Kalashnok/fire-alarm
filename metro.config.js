const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    stream: require.resolve('stream-browserify'),
    events: require.resolve('events'),
    process: require.resolve('process/browser'),
  };
  return config;
})();
