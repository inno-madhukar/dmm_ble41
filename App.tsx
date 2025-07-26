import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import BottomTabs from './src/navigation/BottomTabs';
import { lightTheme } from './theme';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';

const App = () => {
  useEffect(() => {
    const createDownloadFolder = async () => {
      if (Platform.OS === 'android') {
        
        try {
          // const granted = await PermissionsAndroid.request(
          //   PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          //   {
          //     title: 'Storage Permission Required',
          //     message: 'hi',
          //     buttonNeutral: 'Ask Me Later',
          //     buttonNegative: 'Cancel',
          //     buttonPositive: 'OK',
          //   },
          // );
          if (true) {
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
          } else {
            console.warn('Storage permission denied');
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
        <BottomTabs />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
