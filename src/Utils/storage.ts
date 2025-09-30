import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredDevice {
  id: string;
  name: string;
}

const STORAGE_KEY = "bleDevices";

export async function getStoredDevices(): Promise<StoredDevice[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) as StoredDevice[] : [];
}

export async function saveDevice(device: StoredDevice) {
  const devices = await getStoredDevices();
  console.log(devices);
  if (!devices.find(d => d.id === device.id)) {
    devices.push(device);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  }
}

export async function removeDevice(id: string) {
  const devices = await getStoredDevices();
  const updated: StoredDevice[] = devices.filter((d: StoredDevice) => d.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function removeAllDevices() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
