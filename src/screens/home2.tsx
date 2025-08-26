import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  View,
  TouchableHighlight,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  FlatList,
  SectionList,
  Permission,
} from 'react-native';
import { Button, Text, IconButton, Divider ,ActivityIndicator } from 'react-native-paper';
import type { MyTabParamList } from '../navigation/BottomTabs';
import { NavigationProp } from '@react-navigation/core';
import DMMTitle from '../Components/Title';
import { lightTheme } from '../../theme';
import { getStoredDevices, removeAllDevices, saveDevice } from '../Utils/storage';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
let bleManager: any;
type BleDisconnectPeripheralEvent = any;
type Peripheral = any;

if (Platform.OS === 'android' || Platform.OS === 'ios') {
  bleManager = require('react-native-ble-manager').default;
}

const SECONDS_TO_SCAN_FOR = 6;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

declare module 'react-native-ble-manager' {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

const HomeScreen = ({ navigation }: { navigation: NavigationProp<MyTabParamList> }) => {
  if (!bleManager) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Bluetooth not supported on this platform.</Text>
      </View>
    );
  }

  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(new Map<Peripheral['id'], Peripheral>());
  const [storedDevices, setStoredDevices] = useState<any[]>([]);

  // 👉 Key fix: keep latest storedDevices in a ref to avoid stale-closure in event handler
  const flagRef = useRef(false);
  const storedDevicesRef = useRef<any[]>([]);
  useEffect(() => {
    storedDevicesRef.current = storedDevices;
  }, [storedDevices]);


  // useFocusEffect(
  //   useCallback(() => {
  //     if (flagRef.current) {
  //       scanForDevices();
  //     }
  //     return () => {
  //       console.log("📴 Screen unfocused → stop scanning");
  //       bleManager.stopScan()
  //         .then(() => console.log("Scan stopped"))
  //         .catch((err: any) => console.error("Stop scan failed", err));
  //     };
  //   }, [])
  // );
  const handleStopScan = () => {
    setIsScanning(false);
    console.debug('[handleStopScan] scan stopped.');
  };

  const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
    setPeripherals((map) => {
      let p = map.get(event.peripheral);
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });
  };

  const handleDiscoverPeripheral = async (peripheral: Peripheral) => {
    const deviceName = peripheral.name || peripheral.advertising?.localName;
    if (!deviceName) return;
    console.log("sc..", peripheral)
    // setPeripherals((map) => map.set(peripheral.id, peripheral));
    // ✅ Update state immutably to ensure re-render
    // setPeripherals(new Map());
    setPeripherals((map) => new Map(map.set(peripheral.id, peripheral)));

    // 🔧 Use ref (latest value) instead of closed-over state
    const match = storedDevicesRef.current.find(
      (d) => d.id === peripheral.id || d.name === deviceName
    );

    if (match) {
      // bleManager.stopScan();    
      console.log('Auto-connecting to stored device:', match);
      await connectPeripheral(peripheral);
    }
  };

  const togglePeripheralConnection = async (peripheral: Peripheral) => {
    try {
      const per = peripherals.get(peripheral.id);
      console.log("Peripheral fetched:", per);
      if (!per) {
        // Device not currently available
        Alert.alert(
          "Device Not Available",
          "Please turn on the device and keep it nearby, then try again."
        );
        return;
      }

      if (peripheral?.connected) {
        try {
          await bleManager.disconnect(peripheral.id);
          await connectPeripheral(peripheral);
        } catch (error) {
          console.error(`[togglePeripheralConnection][${peripheral.id}] error`, error);
        }
      } else {
        await connectPeripheral(peripheral);
      }
    } catch (error) {
      console.error("Error fetching peripheral:", error);
      return;
    }
  };

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  const connectPeripheral = async (peripheral: Peripheral) => {
    try {

      setPeripherals((map) => {
        let p = map.get(peripheral.id);
        if (p) {
          p.connecting = true;
          return new Map(map.set(p.id, p));
        }
        return map;
      });

      try {
        await bleManager.connect(peripheral.id);
        console.log("Connected to", peripheral.id);
        Alert.alert("Connected", `Successfully connected to device \n ${peripheral.name || peripheral.id}`);
      } catch (err) {
        console.error("Connect attempt failed:", err);
        Alert.alert(
          "Connection Failed",
          "The device stopped advertising or is unavailable. Please try again."
        );
      }
      await sleep(900);

      if (Platform.OS === 'android') {
        try {
          await bleManager.requestMTU(peripheral.id, 512);
        } catch { }
      }

      const peripheralData = await bleManager.retrieveServices(peripheral.id);

      setPeripherals((map) => {
        let p = map.get(peripheral.id);
        if (p) {
          p.connecting = false;
          p.connected = true;
          return new Map(map.set(p.id, p));
        }
        return map;
      });

      // ✅ Persist + sync in-memory state (no duplicates)
      const newDevice = { id: peripheral.id, name: peripheral.name || 'Unknown' };
      await saveDevice(newDevice);
      setStoredDevices((prev) => {
        if (prev.some((d) => d.id === newDevice.id)) return prev;
        const updated = [...prev, newDevice];
        return updated;
      });

      // (Optional) If you want to see the updated list, log via an effect below

      if (peripheralData.characteristics?.length) {
        const notifiableChar = peripheralData.characteristics.find(
          (char: any) => char.properties?.Notify || char.properties?.Indicate
        );
        if (notifiableChar) {
          try {
            await bleManager.startNotification(
              peripheral.id,
              notifiableChar.service,
              notifiableChar.characteristic
            );
          } catch { }
        }
      }

      bleManager.stopScan();
      navigation.navigate('PeripheralDeviceScreen', {
        peripheralData: peripheralData as any,
      });

    } catch (error) {
      Alert.alert(
        "Device Not Available",
        "Please turn on the device and keep it nearby, then try again."
      );
      console.error(`[connectPeripheral][${peripheral.id}] error`, error);
    }
  };

  const scanForDevices = async () => {
    try {
      console.log("scanning stated.......")
      await handleAndroidPermissions();
      await bleManager.enableBluetooth();
      setIsScanning(true);
      setPeripherals(new Map());

      bleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES).catch(console.error);
    } catch (error) {
      console.error('Error initializing BLE:', error);
    }
  };

  useEffect(() => {
    const initObservers = async () => {
      try {
        await bleManager.start({ showAlert: true });
        const devices = (await getStoredDevices()) || [];
        setStoredDevices(devices);
        await scanForDevices();
      } catch (error) {
        console.error('BLE Init error:', error);
      }
    };

    // Register listeners ONCE — handlers use refs to see latest state
    const listeners = [
      bleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
      bleManager.onStopScan(handleStopScan),
      bleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
    ];

    initObservers();
    flagRef.current = true; // mark as initialized
    return () => listeners.forEach((l) => l.remove());
  }, []);

  // Optional: observe updates to storedDevices
  useEffect(() => {
    console.log('Stored devices (state) updated:', storedDevices);
  }, [storedDevices]);

  async function requestPermissions(permissions: Permission[]) {
    if (Platform.OS !== 'android') return true;
    try {
      const results = await PermissionsAndroid.requestMultiple(permissions);
      return Object.values(results).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }

  const handleAndroidPermissions = async () => {
    if (Platform.OS !== 'android') return;
    if (Platform.Version >= 23) {
      await requestPermissions([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };
  const clearSavedDevices = async () => {
     await removeAllDevices();
     Alert.alert("Success", "All saved devices have been removed.");
      setStoredDevices([]);
  };
  // ----------------- UI Render -----------------
  const renderItem = ({ item, section }: { item: Peripheral | { id: string; name: string }, section: any }) => {
    const isSaved = section.title === 'Saved Devices';
    return (
      <TouchableHighlight
        underlayColor={lightTheme.colors.primary}
        onPress={() => togglePeripheralConnection(item)}
      >
        <View >
          <View style={styles.row}>
            <View style={styles.deviceInfo}>
              <Text variant="titleMedium" style={styles.deviceName}>
                {item.name || 'Unknown Device'}
              </Text>
              <Text variant="titleSmall" style={styles.macId}>
                {`ID : ${item.id || 'Unknown ID'}`}
              </Text>

              {/* Saved badge in bottom-right corner */}
              {isSaved && (
                <Text style={styles.savedTag}>Saved</Text>
              )}
            </View>
            <IconButton
              icon="bluetooth"
              size={24}
              onPress={() => togglePeripheralConnection(item)}
            />
          </View>
          <Divider style={styles.divider} />
        </View>
      </TouchableHighlight>
    );
  };
  const available = Array.from(peripherals.values()).filter(
    (p) => !storedDevices.some((d) => d.id === p.id) // exclude saved devices
  );

  const sections = [
    {
      title: 'Available Devices',
      data: available,
    },
    {
      title: 'Saved Devices',
      data: storedDevices,
    },
  ];
  return (
    <View style={styles.container}>
      <DMMTitle />
      <View style={styles.scanHeader}>
        <Text style={styles.scanStatus}>
         Scanning for devices...
        </Text>
        <ActivityIndicator animating={true} style={{ marginLeft: 8 }} />
        <Button
          mode="contained-tonal"
          onPress={scanForDevices}
          compact
          style={styles.scanButton}
          disabled={isScanning}
        >
          {isScanning ? 'Scanning...' : 'Scan Devices'}
        </Button>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }: { section: any }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.title === 'Saved Devices' && section.data.length > 0 && (
              <Button
                mode="contained"
                onPress={clearSavedDevices}
                compact
                style={styles.clearButton}
                labelStyle={{ fontSize: 12 }}
              >
                Clear
              </Button>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
      {/* <Button mode="contained" onPress={scanForDevices} style={styles.button} disabled={isScanning}> 
        {isScanning ? 'Scanning...' : 'Scan Devices'}
      </Button> */}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', backgroundColor: '#ffffffff', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  deviceInfo: { flexDirection: 'column', flex: 1 },
  deviceName: { fontWeight: '600' },
  macId: { color: '#888' },
  divider: { height: 1, backgroundColor: '#09070f', opacity: 0.7 },
  listContainer: { padding: 16 },
  header: { marginBottom: 14, marginTop: 10, fontSize: 16, textAlign: 'center' },
  button: { alignSelf: 'center', marginTop: 10 },
  savedTag: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sectionHeader: {
    // borderBlockColor: '#dddcdcff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    // backgroundColor: '#ebebebff',
    marginTop: 40,
    
  },
    scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
   scanStatus: {
    fontSize: 14,
    opacity: 0.8,
  },
  scanButton: {
    marginLeft: 'auto',
    borderRadius: 16,
  },
   rowWrapper: {
    borderRadius: 16,
    marginVertical: 6,
    overflow: 'hidden',
    // subtle card look
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    marginRight: 4,

  },

});
