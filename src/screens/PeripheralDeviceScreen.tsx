import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, PermissionsAndroid, Platform, Alert } from 'react-native';
import { Text, TextInput, IconButton, Snackbar } from 'react-native-paper';
import classifyArray from '../Components/arrClasiffy';
let RNFS: typeof import('react-native-fs') | undefined;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  RNFS = require('react-native-fs');
}
import { NativeModules } from 'react-native';
import { generateStyledPDF } from '../Components/singlePdfGenerator';
import DMMTitle from '../Components/Title';
const { ManageExternalStorage } = NativeModules;

// ✅ Use `require` instead of `import`
const BleManager = require('react-native-ble-manager').default;

// ✅ Import only types (for TypeScript support)
import type {
  PeripheralInfo,
  BleManagerDidUpdateValueForCharacteristicEvent,
} from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';

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
  const [userNote, setUserNote] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const notNotify=useRef(0);
  const requestPermission = () => {
    ManageExternalStorage.requestPermission();
  };
  const navigation = useNavigation();

  const printData = async (data: string[], note: string) => {
    const [timestamp, deviceId, moisture, temp, weight, commodity] = data;
    try {
      await generateStyledPDF({
        DeviceID: deviceId,
        commodityName: commodity,
        moisture: moisture,
        temperature: temp,
        time: timestamp,
        sampleQty: weight,
        note: note,
      });
    } catch (error) {
      console.error('Print error:', error);
      setSnackbarMessage('Error while printing');
      setSnackbarVisible(true);
    }
  };

  const saveToCSV = async (data: string[], note: string) => {
     if ((Platform.OS === 'ios' || Platform.OS === 'android') && RNFS) {
    const hasPermission = await requestStoragePermission();
    const hasExternalPermission = await ManageExternalStorage.hasPermission();

    if (hasExternalPermission) {
      let deviceName =
        peripheralData?.name || peripheralData?.advertising?.localName || 'NO_NAME';

      try {
        const folder = 'DMM123';
        const csvRow = [...data, note].map(val => `"${val}"`).join(',') + '\n';
        const safeName = deviceName.replace(/[^a-zA-Z0-9-_]/g, '_');
        const path = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/Data/${safeName}_${getFormattedDate()}.csv`;
        const fileExists = await RNFS.exists(path);

        if (!fileExists) {
          const BOM = '\uFEFF';
          const header = `"Date","Device ID","Moisture %","Temp °C","Weight (gm)","Commodity Name","Note"\n`;
          await RNFS.writeFile(path, BOM + header + csvRow, 'utf8');
        } else {
          await RNFS.appendFile(path, csvRow, 'utf8');
        }

        setSnackbarMessage('Data saved to CSV!');
        Alert.alert('Success', `CSV file saved successfully at:\n\n${path}`);
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Failed to save CSV:', error);
        setSnackbarMessage('Error saving CSV.');
        setSnackbarVisible(true);
      }
    } else {
      requestPermission();
    }
  }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && Number(Platform.Version) >= 30) {
      return true;
    }
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const readGranted = granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;
      const writeGranted = granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;

      return readGranted && writeGranted;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  useEffect(() => {
     if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        setSnackbarMessage('BLE features are not supported on this platform.');
        setSnackbarVisible(true);
        return;
      }
    let stopped = false;
    notNotify.current=0;
    const handleUpdateValueForCharacteristic = (

      data: BleManagerDidUpdateValueForCharacteristicEvent
    ) => {
      
            // setReceivedValues([]);
      console.log("started getting notify data");
      if (stopped){
        // setReceivedValues([]);
        console.log("stopped is true, exiting the function");
        return;
      } 
        console.log(data);
      let ascii = '';
      if (Array.isArray(data.value)) {
        ascii = String.fromCharCode(...data.value).slice(1);
      } else if (typeof data.value === 'string') {
        ascii = data.value;
      }
      console.log(ascii)
      setReceivedValues(prev => {
        if (prev.length === 0 || prev[prev.length - 1].ascii !== ascii) {
          const updated = [...prev, { ascii }];
          if (updated.length >= 3) {
            notNotify.current = 1;
            stopped = true;

            listener.remove();
          }
          return updated;
        }
        return prev;
      });

    };
    setTimeout(() => {
      if(notNotify.current===0){
        console.log("stopping the listener");
       BleManager.disconnect(peripheralData.id); 
        listener.remove();
        stopped = true;
        // Alert.alert("Warning ","Device is not connected"); 
        // useNavigation().navigate('homeScreen');
        navigation.goBack();
      }
      else{
        console.log("not stopping the listener");
      }
    }, 3000);
    const listener = BleManager.onDidUpdateValueForCharacteristic(
   
      handleUpdateValueForCharacteristic
    );

    return () => {
      console.log("unmounting the ....")
      stopped = true;
      //  BleManager.disconnect(peripheralData.id); 
      //  useNavigation('homeScreen',peripheralData);
      listener.remove();
    };
  }, []);

  const handleChange = (text: string) => {
    const plain = text.replace(/\n/g, '');
    const withNewlines = plain.match(/.{1,10}/g)?.join('\n') || '';
    setUserNote(withNewlines);
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <DMMTitle />

      <ScrollView contentContainerStyle={styles.container}>
        {receivedValues.length === 3 ? (() => {
          const asciiArrays = receivedValues.slice(0, 3).map(val =>
            val.ascii.split(',').map(s => s.trim())
            
          );
                  // setReceivedValues([]);
                console.log(asciiArrays)
          const { deviceIdArray, readingsArray, commodityArray } = classifyArray(asciiArrays);
    
          const formattedTime = getFormattedDateTime();
          const finalArray = [formattedTime, ...deviceIdArray, ...readingsArray, ...commodityArray];
          //  setReceivedValues([]);
          return (
            <>
              <View style={styles.iconRow}>
                <IconButton
                  icon="content-save"
                  size={24}
                  onPress={() => saveToCSV(finalArray, userNote)}
                />
                <IconButton
                  icon="printer"
                  size={24}
                  onPress={() => printData(finalArray, userNote)}
                />
              </View>

              <Text style={styles.label}><Text style={styles.bold}>Device ID:</Text> {finalArray[1]}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Item:</Text> {finalArray[5]}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Moisture:</Text> {finalArray[2]} %</Text>
              <Text style={styles.label}><Text style={styles.bold}>Weight:</Text> {finalArray[4]} {finalArray[4]?.toUpperCase() !== 'FULL' ? 'grams' : ''}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Temperature:</Text> {finalArray[3]} °C</Text>
              <Text style={styles.label}><Text style={styles.bold}>Timestamp:</Text> {finalArray[0]}</Text>

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
        // backgroundColor: '#ffffffff',
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
