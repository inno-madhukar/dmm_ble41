import React, { useEffect, useState } from 'react';
import { View, TouchableHighlight, StyleSheet, Platform, PermissionsAndroid, FlatList, Alert, Permission } from 'react-native';
import { Button, Text, Card, TouchableRipple, Modal, Portal, Provider, IconButton, Divider } from 'react-native-paper';
import type { MyTabParamList } from '../navigation/BottomTabs'; // adjust path
import { NavigationProp } from '@react-navigation/core';
import DMMTitle from '../Components/Title';
let bleManager: any;
type BleDisconnectPeripheralEvent = any;
type Peripheral = any;
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  bleManager = require('react-native-ble-manager').default;

}

import { lightTheme } from '../../theme';
const SECONDS_TO_SCAN_FOR = 3;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

declare module 'react-native-ble-manager' {
  // enrich local contract with custom state properties needed by App.tsx
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}


const HomeScreen = ({ navigation }: { navigation: NavigationProp<MyTabParamList> }) => {
  if (!bleManager) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Bluetooth features are not supported on this platform.</Text>
      </View>
    );
  }

  const [visible, setVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanstate, setScanState] = useState(false);
  const [scanbtn, setScanbtn] = useState(false)
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral['id'], Peripheral>()
  );

  const hideModal = () => {
    setVisible(false);
  }
  const showModal = () => {
    setVisible(true);
  }

  const handleStopScan = () => {
    setIsScanning(false);
    // setScanState(false);
    console.debug('[handleStopScan] scan is stopped.');
  };

  const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
    setPeripherals((map) => {

      let p = map.get(event.peripheral);
      console.log(event)
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });
  };

  const handleConnectPeripheral = (_event: any) => { };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    console.log(peripheral)
    const deviceName = peripheral.name || peripheral.advertising?.localName;
    // Filter only devices that have a name length of 12
    if (deviceName?.length === 12) {
      peripheral.name = deviceName; // ensure name is set
      setPeripherals((map) => new Map(map.set(peripheral.id, peripheral)));

    }
  };


  const togglePeripheralConnection = async (peripheral: Peripheral) => {

    if (peripheral?.connected) {
      try {
        await bleManager.disconnect(peripheral.id);
      } catch (error) {
        console.error(`[togglePeripheralConnection][${peripheral.id}] disconnect error`, error);
      }
    } else {
      await connectPeripheral(peripheral);
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

      await bleManager.connect(peripheral.id);
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

      if (peripheralData.characteristics?.length) {
        const notifiableChar = peripheralData.characteristics.find(
          (char: any) => char.properties?.Notify || char.properties?.Indicate
        );
        if (notifiableChar) {
          console.log(
            `[connectPeripheral][${peripheral.id}] starting notification for ${notifiableChar.characteristic}`
          );
          try {
            await bleManager.startNotification(
              peripheral.id,
              notifiableChar.service,
              notifiableChar.characteristic
            );
          } catch { }
        }
      }

      navigation.navigate('PeripheralDeviceScreen', {
        peripheralData: peripheralData as any,
      });
      bleManager.stopScan()
    } catch (error) {
      console.error(`[connectPeripheral][${peripheral.id}] error`, error);
    }
  };

  const scanForDevices = async () => {
    try {
      console.log(peripherals.values())
      await handleAndroidPermissions();
      await bleManager.enableBluetooth();
      setIsScanning(true);
      setScanState(true);
      setScanbtn(true);
      setPeripherals(new Map());
      console.log(peripherals)
      bleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
        matchMode: 1, // BleScanMatchMode.Sticky
        scanMode: 2, // BleScanMode.LowLatency
        callbackType: 1, // BleScanCallbackType.AllMatches
      }).catch(console.error);

    } catch (error) {
      console.error('Error initializing BLE:', error);
    }
  };

  useEffect(() => {
    const initObservers = async () => {
      try {
        await bleManager.start({ showAlert: true });
        scanForDevices();
      } catch (error) {
        console.error('BLE Init error:', error);
      }
    };

    const listeners = [
      bleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
      bleManager.onStopScan(handleStopScan),
      bleManager.onConnectPeripheral(handleConnectPeripheral),
      bleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
    ];

    initObservers();
    return () => listeners.forEach((l) => l.remove());
  }, []);

  async function requestPermissions(permissions: Permission[]) {
    if (Platform.OS !== "android") return true;

    try {
      const results = await PermissionsAndroid.requestMultiple(permissions);

      // Check each result
      const allGranted = Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        console.warn("Some permissions denied:", results);
      }

      return allGranted; //  true if all granted,  false if any denied
    } catch (err) {
      console.error("Permission error:", err);
      return false;
    }
  }

  const handleAndroidPermissions = async () => {
    if (Platform.OS !== 'android') return;

    if (Platform.Version >= 23) {

      const ok = await requestPermissions([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      if (ok) {
        console.log(" All permissions granted");
      } else {
        console.log(" Some permissions denied");
      }
    }

  };

  const renderItem = ({ item }: { item: Peripheral }) => (
    <TouchableHighlight
      underlayColor={lightTheme.colors.primary}
      onPress={() => togglePeripheralConnection(item)}
    >
      <View>  
          <View style={styles.row}>
        <View style={styles.deviceInfo}>
          <Text variant="titleMedium" style={styles.deviceName}>
            {`Device ID : ${item.name || 'Unknown Device'}`}
          </Text>
          <Text variant="titleSmall" style={styles.macId}>
            {`MAC ID : ${item.id || 'Unknown MAC'}`}
          </Text>
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
  return (

    <View style={styles.container}>
      <DMMTitle />
      {
        <>
          {console.log("FlatList rendered, devices:", Array.from(peripherals))}
          <FlatList
            data={Array.from(peripherals.values())}

            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <Text variant="titleMedium" style={styles.header}>
                {scanstate ? ' List of Available Devices' : 'No Peripherals found.'}
              </Text>
            }
          />
          <Button
            mode="contained"
            onPress={scanForDevices}
            style={styles.button}
            disabled={isScanning}

          >
            {scanbtn ? ' Refresh' : 'Scan Devices'}
          </Button>

        </>

      }


      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
        <IconButton icon="alert" size={48} style={styles.modalIcon} />
        <Text variant="titleMedium" style={styles.modalText}>
          Bluetooth Disabled
        </Text>
        <Text style={styles.modalText}> Bluetooth is turned off. Please enable it to proceed.</Text>
        <Button
          mode="contained"
          onPress={hideModal}
          style={styles.modalButton}
        >
          Enable
        </Button>
        <Button
          mode="contained"
          onPress={hideModal}
          style={styles.modalButton}
        >
          Open Settings
        </Button>
        <Button
          mode="contained"
          onPress={hideModal}
          style={styles.modalButton}
        >
          Cancel
        </Button>
      </Modal>

    </View>

  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
    // backgroundColor: '#ffffffff',
  },
  subcontainer: {
    marginTop: '50%',
    paddingTop: '20%',

  },
  text: {
    marginBottom: 20,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    // width: '80%',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    marginHorizontal: 20,
    borderRadius: 10,

  },
  deviceInfo: {
    flexDirection: 'column',
    flex: 1, // take remaining space
  },
  macId: {
    color: '#888888ff',
    // marginTop: 2,
  },

  modalText: {
    marginBottom: 5,
    textAlign: 'center',
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 5,
  },
  modalButton: {
    marginTop: 5,
    alignSelf: 'center',
    width: '60%',
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 8,
    elevation: 2, // for shadow on Android
  },
  peripheralId: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  }, emptyRow: {
    marginTop: 40,
    alignItems: 'center',
  },
  noPeripherals: {
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  deviceName: {
    fontWeight: '600',
    
  },
  divider: {
    height: 1,
    backgroundColor: '#09070fff', // Purple line like in image
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 14,
    marginTop: 10,
    // fontWeight: 'bold',
    // color: '#121213ff',
   fontSize: 16, 
    textAlign: 'center',
  },
});
