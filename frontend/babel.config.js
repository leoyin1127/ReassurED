module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }],
      '@babel/plugin-transform-export-namespace-from',
      '@babel/plugin-transform-template-literals',
      'react-native-reanimated/plugin'
    ]
  };
};
