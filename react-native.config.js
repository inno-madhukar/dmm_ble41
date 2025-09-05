// react-native.config.js
const os = require("os");
const isWindows = os.platform() === "win32";

module.exports = {
    assets: isWindows
    ? ["./node_modules/react-native-vector-icons/Fonts"]
    : [],
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
