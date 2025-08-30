import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import BottomTabs from './src/navigation/BottomTabs';
import AppDrawer from './src/navigation/Drawerbar';
import { lightTheme } from './theme';
import { PermissionsAndroid, Platform } from 'react-native';

let RNFS: typeof import('react-native-fs') | undefined;
if (Platform.OS === 'android') {
  RNFS = require('react-native-fs');
}
import HelpScreen from './src/screens/HelpScreen';
const App = () => {
  useEffect(() => {
    const createDownloadFolder = async () => {
      if (Platform.OS === 'android' && RNFS) {
        try {
          const folderPath = `${RNFS.DownloadDirectoryPath}/Innovative_instrument`;
          const userFolderPath = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/userdata`;
          const dataFolderPath = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/Data`;
          const exists = await RNFS.exists(folderPath);
          if (!exists) {
            await RNFS.mkdir(folderPath);
            await RNFS.mkdir(userFolderPath);
            await RNFS.mkdir(dataFolderPath);
            console.log('Download folder created:', folderPath);
          } else {
            console.log('Download folder already exists:', folderPath);
          }
        } catch (err) {
          console.error('Error requesting permission or creating folder:', err);
        }
      }
    };
    createDownloadFolder();
  }, []);

  
  return (
    <PaperProvider theme={lightTheme}>
      <NavigationContainer>
        {Platform.OS === 'windows' ? (
          <AppDrawer />
        ) : (
          <BottomTabs />
        )
          }
      </NavigationContainer> 
    </PaperProvider>
  );
};

export default App;
