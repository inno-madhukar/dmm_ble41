// react-native.config.js
module.exports = {
  dependencies: {
    'react-native-print': {
      platforms: {
        windows: null, // ❌ disables Windows linking for this package
      },
    },
     'react-native-fs': {
      platforms: {
        windows: null, // ❌ disables Windows linking for this package
      },
    },
    'react-native-ble-manager': {
      platforms: {
        windows: null, // ❌ disables Windows linking for this package
      },
    },
    'react-native-permissions':{
      platforms: {
        windows: null, // ❌ disables Windows linking for this package
      },
    },
    'react-native-share':{
      platforms: {
        windows: null, // ❌ disables Windows linking for this package
      },
    },
  },
};
