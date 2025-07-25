import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView,PermissionsAndroid, Platform, Alert } from 'react-native';
import { Text, TextInput, IconButton, Snackbar } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import type { MyTabParamList } from '../navigation/BottomTabs'; // adjust path
import BleManager, {
  PeripheralInfo,
  BleManagerDidUpdateValueForCharacteristicEvent,
} from 'react-native-ble-manager';
import classifyArray from '../Components/arrClasiffy'; // adjust path
import RNPrint from 'react-native-print';
import { NativeModules } from 'react-native';
import {generateStyledPDF} from '../Components/singlePdfGenerator';
const { ManageExternalStorage } = NativeModules;

interface PeripheralDetailsProps {
  route: {
    params: {
      peripheralData: PeripheralInfo;
    };
  };
}

function getFormattedDate(): string {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day}_${month}_${year}`;
}
function getFormattedDateTime(): string {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}


const PeripheralDeviceScreen = ({ route }: PeripheralDetailsProps) => {

  const peripheralData = route.params.peripheralData;
  const [receivedValues, setReceivedValues] = useState<{ ascii: string }[]>([]);
  const [inputs, setInputs] = useState<string[]>(Array(5).fill(''));
  const [userNote, setUserNote] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  // const checker=useRef()
// async function checkPermission() {
//   const hasPermission = await ManageExternalStorage.hasPermission();
//   if (!hasPermission) {
//     console.log(hasPermission)
//     requestPermission();
    
//   }
//   // else{return true}
// }

  function requestPermission() {

  ManageExternalStorage.requestPermission();
 
}


const printData = async (data: string[], note: string) => {
  const [timestamp, deviceId, temp, moisture, weight, commodity] = data;
  console.log(note)
  try {
    const path=generateStyledPDF({
DeviceID: deviceId,
  commodityName: commodity,
  moisture: moisture,
  temperature: temp,
  time: timestamp,
  sampleQty: weight,
  note:note,
})
  } catch (error) {
    console.error('Print error:', error);
    setSnackbarMessage('Error while printing');
    setSnackbarVisible(true);
  }
};

  const saveToCSV = async (data: string[], note: string) => {
   
  const hasPermission = await requestStoragePermission();
  const hasPermission1 = await ManageExternalStorage.hasPermission();
// console.log(hasPermission1)
   if (hasPermission1 ) { 
    let deviceName =
      peripheralData?.name || peripheralData?.advertising?.localName || 'NO_NAME';
      try {
        const folder='DMM123'
            // const csvLine = .join(',') + '\n';
      const csvRow = [...data, note].map(val => `"${val}"`).join(',') + '\n';
      console.log(csvRow)
      console.log(note)
      const safeName = deviceName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const path = `${RNFS.DownloadDirectoryPath}/DMMData/${safeName}_${getFormattedDate()}.csv`;
      console.log(path)
      // const path = `${RNFS.DocumentDirectoryPath}/ble_readings.csv`;
      const fileExists = await RNFS.exists(path);
      console.log(fileExists)
      if (!fileExists) {
        const header = `"Date","Device ID","Temp °C","Moisture %","Weight (gm)","Commodity Name","Note"\n`;
        await RNFS.writeFile(path, header + csvRow, 'utf8');
      } else {
        await RNFS.appendFile(path, csvRow, 'utf8');
      }

      setSnackbarMessage('Data saved to CSV! ');
      Alert.alert('csv file path',path)
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Failed to save CSV:', error);
      setSnackbarMessage('Error saving CSV.');
      setSnackbarVisible(true);
    }
  } else {
    requestPermission()
    // setSnackbarMessage('Storage permission denied');
    // setSnackbarVisible(true);
  }
  
  };

const requestStoragePermission = async (): Promise<boolean> => {

if (Platform.OS === 'android' && Number(Platform.Version) >= 30) {
  console.log('dfgh')
  return true;
}
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const readGranted =
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;
      const writeGranted =
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;

      return readGranted && writeGranted;
    } catch (err) {
      console.warn('Permission error:', err);
      console.log(err)
      return false;
    }
  };


  useEffect(() => {
    let stopped = false;
    const handleUpdateValueForCharacteristic = (
      data: BleManagerDidUpdateValueForCharacteristicEvent
    ) => {
      if (stopped) return;
      let ascii = '';
      if (Array.isArray(data.value)) {
        ascii = String.fromCharCode(...data.value).slice(1);
      } else if (typeof data.value === 'string') {
        ascii = data.value;
      }

      setReceivedValues(prev => {
        if (prev.length === 0 || prev[prev.length - 1].ascii !== ascii) {
          const updated = [...prev, { ascii }];
          if (updated.length >= 3) {
            stopped = true;
            listener.remove();
          }
          return updated;
        }
        return prev;
      });
    };

    const listener = BleManager.onDidUpdateValueForCharacteristic(
      handleUpdateValueForCharacteristic
    );

    return () => {
      stopped = true;
      listener.remove();
    };
  }, []);

  const handleChange = (text: string) => {
    // Remove existing line breaks first
    const plain = text.replace(/\n/g, '');

    // Insert a line break every 10 characters
    const withNewlines = plain.match(/.{1,10}/g)?.join('\n') || '';

    setUserNote(withNewlines);
  };
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Text variant="headlineMedium" style={{ color: '#2f3ceeff' }}>
          Digital Moisture Meter BLE
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {receivedValues.length === 3 ? (() => {
          const asciiArrays = receivedValues.slice(0, 3).map(val =>
            val.ascii.split(',').map(s => s.trim())
          );

          const { deviceIdArray, readingsArray, commodityArray } = classifyArray(asciiArrays);
          const formattedTime = getFormattedDateTime();
          const finalArray = [formattedTime, ...deviceIdArray, ...readingsArray, ...commodityArray];
 
          return (
            <>
              <View style={styles.iconRow}>
                <IconButton
                  icon="content-save"
                  size={24}
                  onPress={() => saveToCSV(finalArray, userNote) }  //
                />
               
                <IconButton icon="printer" size={24}   onPress={() => printData(finalArray, userNote)} />
              </View>

              <Text style={styles.label}>
                <Text style={styles.bold}>Device ID:</Text> {finalArray[1]}
              </Text>
              <Text style={styles.label}>
                <Text style={styles.bold}>Item:</Text> {finalArray[5]}
              </Text>
              <Text style={styles.label}>
                <Text style={styles.bold}>Moisture:</Text> {finalArray[3]} %
              </Text>
              <Text style={styles.label}>
                <Text style={styles.bold}>Weight:</Text> {finalArray[4]}{' '}
                {finalArray[4].toUpperCase() !== 'FULL' ? 'grams' : ''}
              </Text>
              <Text style={styles.label}>
                <Text style={styles.bold}>Temperature:</Text> {finalArray[2]} °C
              </Text>
              <Text style={styles.label}>
                <Text style={styles.bold}>Timestamp:</Text> {finalArray[0]}
              </Text>

              <TextInput
                label="Note"
                mode="outlined"
                value={userNote}
                multiline
                onChangeText={handleChange}
                style={styles.input}
                 maxLength={50}
              />
              
            </>
          );
        })() : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Waiting for data...
          </Text>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  input: {
    marginTop: 6,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default PeripheralDeviceScreen;
