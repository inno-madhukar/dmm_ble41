import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, PermissionsAndroid, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, TextInput, IconButton, Snackbar, Icon } from 'react-native-paper';
import classifyArray from '../Components/arrClasiffy';
let RNFS: typeof import('react-native-fs') | undefined;
// console.log(RNFS);
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  RNFS = require('react-native-fs');
}
import { NativeModules } from 'react-native';
import { generateStyledPDF } from '../Components/singlePdfGenerator';
import DMMTitle from '../Components/Title';

const { ManageExternalStorage } = NativeModules;
let Share: typeof import('react-native-share') | undefined;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  Share = require('react-native-share').default;
}
// ✅ Use `require` instead of `import`
const BleManager = require('react-native-ble-manager').default;

import type {
  PeripheralInfo,
  BleManagerDidUpdateValueForCharacteristicEvent,
} from 'react-native-ble-manager';
import { useNavigation, useRoute } from '@react-navigation/native';

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
  const notNotify = useRef(0);

  const [clientName, setClientName] = useState('');
  const [truckNumber, setTruckNumber] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [remarks, setRemarks] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [truckSuggestions, setTruckSuggestions] = useState<string[]>([]);
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  interface Client {
    clientName: string;
    location: string;
    truckNumbers: string[];
    vendorId: string;
    totalWeight: string;
    remarks: string;
  }

  const requestPermission = () => {
    ManageExternalStorage.requestPermission();
  };
  const navigation = useNavigation();
  // const route = useRoute<>();\

  const printData = async (data: string[], note: string, clientName: string, location: string, truckNumber: string, vendorId: string, totalWeight: string, remarks: string) => {
    const [timestamp, deviceId, moisture, temp, weight, commodity] = data;
    try {

      if (RNFS) {
        const path = await generateStyledPDF({
          DeviceID: deviceId,
          commodityName: commodity,
          moisture: moisture,
          temperature: temp,
          time: timestamp,
          sampleQty: weight,
          note: note,
          ClientName: clientName,
          Location: location,
          TruckNumber: truckNumber,
          VendorId: vendorId,
          TotalWeight: totalWeight,
          Remarks: remarks
        });
        if (note == "share") {
          const peripheralName = route.params.peripheralData.name || "testpdf";
          // Get current date and time
          const now = new Date();
          const dd = String(now.getDate()).padStart(2, '0');
          const mm = String(now.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
          const yy = String(now.getFullYear()).slice(-2);
          const hh = String(now.getHours()).padStart(2, '0');
          const min = String(now.getMinutes()).padStart(2, '0');
          const ss = String(now.getSeconds()).padStart(2, '0');

          const externalPath = `${RNFS.CachesDirectoryPath}/${peripheralName}_${dd}${mm}${yy}_${hh}${min}${ss}${clientName.length == 0 ? "" : "_" + clientName}.pdf`;
          await RNFS.copyFile(path, externalPath);
          console.log(path)
          // const path = `${RNFS.DownloadDirectoryPath}/demo.pdf`;
          if (!Share) {
            Alert.alert('Error', 'Sharing not available on this platform.');
            return;
          }
          await (Share as any).open({ url: `file://${externalPath}`, type: 'application/pdf' });
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      // setSnackbarMessage('printing failed.');
      // setSnackbarVisible(true);
    }
  };

  const saveClientData = async (client: Client) => {
    try {
      let clients: Client[] = [];
      if (RNFS) {
        const CLIENTS_FILE = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/userdata/clients.json`;

        if (await RNFS.exists(CLIENTS_FILE)) {
          const content = await RNFS.readFile(CLIENTS_FILE, "utf8");
          clients = JSON.parse(content);
        }

        // Find existing client
        const existingIndex = clients.findIndex(
          (c) => c.clientName.toLowerCase() === client.clientName.toLowerCase()
        );

        if (existingIndex >= 0) {
          // Existing client → merge truck numbers + update fields
          const existing = clients[existingIndex];

          client.truckNumbers.forEach((truck) => {
            if (!existing.truckNumbers.includes(truck)) {
              existing.truckNumbers.push(truck);
            }
          });

          // Update other fields (optional: only if new values provided)
          existing.location = client.location || existing.location;
          existing.vendorId = client.vendorId || existing.vendorId;
          existing.totalWeight = client.totalWeight || existing.totalWeight;
          existing.remarks = client.remarks || existing.remarks;

          clients[existingIndex] = existing;
          setAllClients(prev => {
            const updated = [...prev];
            updated[existingIndex] = existing;
            return updated;
          });
        } else {
          // New client → add directly
          clients.push(client);
          setAllClients(prev => [...prev, client]);  // ✅ update suggestions instantly

        }

        // Save back to file
        await RNFS.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), "utf8");

        console.log("✅ Client saved:", client.clientName);
      }
    } catch (err) {
      console.error("❌ Error saving client:", err);
    }

  };

  const saveToCSV = async (data: string[], note: string, clientName: string, location: string, truckNumber: string, vendorId: string, totalWeight: string, remarks: string) => {
    if ((Platform.OS === 'ios' || Platform.OS === 'android') && RNFS) {
      const hasPermission = await requestStoragePermission();
      const hasExternalPermission = await ManageExternalStorage.hasPermission();

      if (hasExternalPermission) {
        let deviceName =
          peripheralData?.name || peripheralData?.advertising?.localName || 'NO_NAME';

        try {
          const folder = 'DMM123';
          const csvRow = [...data, clientName, location, truckNumber, vendorId, totalWeight, remarks].map(val => `"${val}"`).join(',') + '\n';
          const safeName = deviceName.replace(/[^a-zA-Z0-9-_]/g, '_');
          const path = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/Data/${safeName}_${getFormattedDate()}.csv`;
          const fileExists = await RNFS.exists(path);
          if (!fileExists) {
            const BOM = '\uFEFF';
            const header = `"Date","Device ID","Moisture %","Temperature °C","Weight (gm)","Commodity Name","Client Name","Client Address","Truck Number","Vendor ID","Total Weight (kg)","Remarks"\n`;
            await RNFS.writeFile(path, header + csvRow, 'utf8');
          } else {
            await RNFS.appendFile(path, csvRow, 'utf8');
          }

          const client: Client = {
            clientName,
            location,
            "truckNumbers": [truckNumber],
            vendorId,
            totalWeight,
            remarks,
          };
          if (client.clientName.trim().length > 0) {
            await saveClientData(client);
          }


          setSnackbarMessage('Data saved to CSV!');
          setClientName('')
          setLocation('')
          setTruckNumber('')
          setVendorId('')
          setTotalWeight('')
          setRemarks('')
          Alert.alert('Success', `CSV file saved successfully at:\n\n${path}`);
          setSnackbarVisible(true);
        } catch (error) {
          console.error('Failed to save CSV:', error);
          // setSnackbarMessage('Error saving CSV.');
          // setSnackbarVisible(true);
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
    if (peripheralData.id == "test") {
      setReceivedValues([
        { ascii: "DMMBLE010320" },
        { ascii: "00.0,30.9,125" },
        { ascii: "WHEAT" }
      ]);

      return;
    }

    setReceivedValues([])
    setClientName('')
    setLocation('')
    setTruckNumber('')
    setVendorId('')
    setTotalWeight('')
    setRemarks('')
    notNotify.current = 0;
    const handleUpdateValueForCharacteristic = (

      data: BleManagerDidUpdateValueForCharacteristicEvent
    ) => {

      // setReceivedValues([]);
      console.log("started getting notify data");

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
            listener.remove();
            setSnackbarMessage('Data Received Successfully');
            setSnackbarVisible(true);
          }
          return updated;
        }
        return prev;
      });

    };
    setTimeout(() => {
      if (notNotify.current === 0) {
        console.log("stopping the listener");
        BleManager.disconnect(peripheralData.id);
        listener.remove();
        navigation.goBack();
      }
      else {
        console.log("not stopping the listener");
      }
    }, 3000);
    const listener = BleManager.onDidUpdateValueForCharacteristic(

      handleUpdateValueForCharacteristic
    );
    if (peripheralData.id = "test") {
      // setReceivedValues()
    }
    return () => {
      console.log("unmounting the ....")
      listener.remove();
      // BleManager.disconnect(peripheralData.id);
    };
  }, [route.params?.peripheralData]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        if (RNFS) {
          const CLIENTS_FILE = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/userdata/clients.json`;
          if (RNFS && await RNFS.exists(CLIENTS_FILE)) {
            const content = await RNFS.readFile(CLIENTS_FILE, "utf8");
            setAllClients(JSON.parse(content));
          }
        }
      } catch (err) {
        console.error("Error loading clients:", err);
      }
    };
    loadClients();
  }, []);  // ✅ only once


  // On typing client name
  const handleClientNameChange = (text: string) => {
    setClientName(text);

    if (text.length >= 2) {
      const filtered = allClients.filter(c =>
        c.clientName.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // When suggestion selected
  const handleSelectClient = (client: Client) => {
    setClientName(client.clientName);
    setLocation(client.location || "");
    setVendorId(client.vendorId || "");
    setTotalWeight(client.totalWeight || "");
    setRemarks(client.remarks || "");

    // default truck handling
    if (client.truckNumbers?.length > 0) {
      setTruckNumber(client.truckNumbers[0]); // pick first one
    }

    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleTruckInputChange = (text: string) => {
    setTruckNumber(text);

    // Find the selected client by name
    const client = allClients.find(
      (c) => c.clientName.toLowerCase() === clientName.toLowerCase()
    );

    if (client && Array.isArray(client.truckNumbers)) {
      const matches = client.truckNumbers.filter((t) =>
        t.toLowerCase().includes(text.toLowerCase())
      );
      setTruckSuggestions(matches);
      setShowTruckDropdown(matches.length > 0);
    } else {
      setTruckSuggestions([]);
      setShowTruckDropdown(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <DMMTitle />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
          <Text style={{ color: 'red', textAlign: 'center', marginRight:5}}>
            Note:Click
          </Text>
          <Icon source="content-save" size={20} color="red" />
          <Text style={{ color: 'red', textAlign: 'center', marginLeft:5}}>
             to save Record if it's required
          </Text>
        </View>

        {receivedValues.length === 3 ? (() => {
          // {true ? (() => {
          const asciiArrays = receivedValues.slice(0, 3).map(val =>
            val.ascii.split(',').map(s => s.trim())

          );
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
                  onPress={() => saveToCSV(finalArray, userNote, clientName, location, truckNumber, vendorId, totalWeight, remarks)}
                />
                <IconButton
                  icon="printer"
                  size={24}
                  onPress={() => printData(finalArray, "notshare", clientName, location, truckNumber, vendorId, totalWeight, remarks)}
                />
                <IconButton icon="share-variant" size={24} onPress={() => { printData(finalArray, "share", clientName, location, truckNumber, vendorId, totalWeight, remarks) }} />
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Device ID </Text>
                <Text style={styles.value}>{":  " + finalArray[1]}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Commodity Name </Text>
                <Text style={styles.value}>{":  " + finalArray[5]}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Moisture </Text>
                <Text style={styles.value}>{":  " + finalArray[2]} %</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Weight </Text>
                <Text style={styles.value}>
                  {":  " + finalArray[4]} {finalArray[4]?.toUpperCase() !== "FULL" ? "grams" : ""}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Temperature </Text>
                <Text style={styles.value}>{":  " + finalArray[3]} °C</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Date </Text>
                <Text style={styles.value}>{":  " + finalArray[0]}</Text>
              </View>


              <TextInput
                label="Client Name"
                mode="outlined"
                value={clientName}
                onChangeText={handleClientNameChange}
                style={styles.input}
                maxLength={150}
              />
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                  {suggestions.map((c, i) => (
                    <Text
                      key={i}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectClient(c)}
                    >
                      {c.clientName}
                    </Text>
                  ))}
                </View>
              )}


              <TextInput
                label="Client Address"
                mode="outlined"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                maxLength={150}
              />
              <TextInput
                label="Truck Number"
                mode="outlined"
                value={truckNumber}
                onChangeText={handleTruckInputChange}
                style={styles.input}
                maxLength={50}
              />
              {showTruckDropdown && (
                <View style={styles.dropdown}>
                  {truckSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setTruckNumber(item);
                        setShowTruckDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItem}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TextInput
                label="Vendor ID"
                mode="outlined"
                value={vendorId}
                onChangeText={setVendorId}
                style={styles.input}
                maxLength={50}
              />
              <TextInput
                label="Total Weight"
                mode="outlined"
                value={totalWeight}
                onChangeText={setTotalWeight}
                style={styles.input}
                maxLength={50}
              />
              <TextInput
                label="Remarks"
                mode="outlined"
                value={remarks}
                onChangeText={setRemarks}
                style={styles.input}
                maxLength={150}
              />
            </>
          );

        })() : (
          // if(){}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  label: {
    width: 140, // 👈 same width for all labels so values align
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  value: {
    flex: 1,
    fontSize: 15,
    // marginRight:
    //  textAlign: "left",
    color: "#000",
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
  suggestionBox: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 2,
    elevation: 4,
  },
  suggestionItem: {
    padding: 10,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  truckOption: {
    padding: 6,
    backgroundColor: "#e3f2fd",
    marginTop: 4,
    borderRadius: 6,
  },
  dropdown: {
    maxHeight: 150,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 2,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

});

export default PeripheralDeviceScreen;
