import React, { useEffect, useState } from 'react';
import { View,TouchableHighlight, StyleSheet, Platform,PermissionsAndroid,FlatList, Alert } from 'react-native';
import { Button, Text, Card, TouchableRipple, Modal,  Portal, Provider, IconButton,Divider  } from 'react-native-paper';
import type { MyTabParamList } from '../navigation/BottomTabs'; // adjust path
import { NavigationProp } from '@react-navigation/core';    
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';

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

const HomeScreen = ({ navigation }:{navigation: NavigationProp<MyTabParamList>}) => {             //      navigation.navigate('PeripheralDeviceScreen', { peripheralData: {} });

  const [visible, setVisible] = useState(false);
  const [isenabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanstate, setScanState] = useState(false);
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
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });
  };

  const handleConnectPeripheral = (_event: any) => {};

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
  const deviceName = peripheral.name || peripheral.advertising?.localName;

  // Filter only devices that have a name length of 7
  if (deviceName?.length === 12) {
    peripheral.name = deviceName; // ensure name is set
    setPeripherals((map) => new Map(map.set(peripheral.id, peripheral)));
  }
};


  const togglePeripheralConnection = async (peripheral: Peripheral) => {
    if (peripheral?.connected) {
      try {
        await BleManager.disconnect(peripheral.id);
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

      await BleManager.connect(peripheral.id);
      await sleep(900);

      if (Platform.OS === 'android') {
        try {
          await BleManager.requestMTU(peripheral.id, 512);
        } catch {}
      }

      const peripheralData = await BleManager.retrieveServices(peripheral.id);

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
          (char) => char.properties?.Notify || char.properties?.Indicate
        );
        if (notifiableChar) {
          try {
            await BleManager.startNotification(
              peripheral.id,
              notifiableChar.service,
              notifiableChar.characteristic
            );
          } catch {}
        }
      }

      navigation.navigate('PeripheralDeviceScreen', {
        peripheralData: peripheralData as any,
      });
    } catch (error) {
      console.error(`[connectPeripheral][${peripheral.id}] error`, error);
    }
  };

 const scanForDevices = async () => {
    try {
      await handleAndroidPermissions();
      await BleManager.enableBluetooth();
      setIsScanning(true);
      setScanState(true);
      setPeripherals(new Map());
      BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
        matchMode: BleScanMatchMode.Sticky,
        scanMode: BleScanMode.LowLatency,
        callbackType: BleScanCallbackType.AllMatches,
      }).catch(console.error);
    } catch (error) {
      console.error('Error initializing BLE:', error);
    }
  };

     useEffect(() => {
    const initObservers = async () => {
      try {
        await BleManager.start({ showAlert: true });
        scanForDevices();
      } catch (error) {
        console.error('BLE Init error:', error);
      }
    };

    const listeners = [
      BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
      BleManager.onStopScan(handleStopScan),
      BleManager.onConnectPeripheral(handleConnectPeripheral),
      BleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
    ];

    initObservers();
    return () => listeners.forEach((l) => l.remove());
  }, []);

const handleAndroidPermissions = async () => {
  if (Platform.OS !== 'android') return;

  if (Platform.Version >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      // Add if advertising:
      // PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ]);

    if (
      granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== PermissionsAndroid.RESULTS.GRANTED ||
      granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.warn("Bluetooth permissions not granted");
    }

  } else if (Platform.Version >= 23) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn("Location permission not granted");
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
      <Text variant="titleMedium" style={styles.deviceName}>
        {item.name || 'Unknown Device'}
      </Text>
      <IconButton icon="bluetooth" size={24} onPress={() => togglePeripheralConnection(item)} />
    </View>
    <Divider style={styles.divider} />
  </View>
  </TouchableHighlight>
);
  return (
     
      <View style={styles.container}>
        <View style={{ alignItems: 'center'}}>
        <Text variant="headlineMedium" style={{color: '#2f3ceeff'}}>Digital Moisture Meter BLE</Text>
      </View>
       {/* <Divider style={styles.divider} /> */}
        {
          scanstate ? (
            <>                
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
               Refresh
            </Button>
      
      </>
          ) : (
           <View>

      <View style={styles.subcontainer}>
        <Text variant="labelSmall" style={styles.text}>
          Make sure your device is powered on and in pairing mode. Scanning may take a few seconds.
        </Text>
        <Button
          mode="contained"
          onPress={scanForDevices}
          style={styles.button}
          // disabled={isScanning}
        >
          Scan Devices
        </Button>
      </View>
        </View>
          )

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
    backgroundColor: '#ffffffff',
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
  },emptyRow: {
    marginTop: 40,
    alignItems: 'center',
  }, noPeripherals: {
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
    backgroundColor: '#3000ff', // Purple line like in image
    opacity: 0.7,
  },
    listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
