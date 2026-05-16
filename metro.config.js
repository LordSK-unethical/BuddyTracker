const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const webchannelWrapperExports = {
  '@firebase/webchannel-wrapper/webchannel-blob':
    '@firebase/webchannel-wrapper/dist/webchannel-blob/webchannel_blob_es2018.js',
  '@firebase/webchannel-wrapper/bloom-blob':
    '@firebase/webchannel-wrapper/dist/bloom-blob/bloom_blob_es2018.js',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mapped = webchannelWrapperExports[moduleName];
  if (mapped) {
    return context.resolveRequest(context, mapped, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
