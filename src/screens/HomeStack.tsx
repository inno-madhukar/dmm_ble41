import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import type { MyTabParamList } from '../navigation/BottomTabs'; // adjust path
import HomeScreen from '../screens/HomeScreen';
import PeripheralDeviceScreen from '../screens/PeripheralDeviceScreen';

console.log('App.tsx: module loaded');

// Define and export the stack param list
export type RootStackParamList = {
  ScanDevices: undefined;
  PeripheralDetails: { peripheralData: any };
  ShowFiles: undefined;
};

const Stack = createNativeStackNavigator<MyTabParamList>();

const HomeStack = () => {
  console.log('App.tsx: App component rendered');
  return (
 
      <Stack.Navigator>
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: true, title: ' ' }}
        />
        <Stack.Screen
          name="PeripheralDeviceScreen"
          component={PeripheralDeviceScreen}
          options={{ headerShown: true, title: 'Back' }}
        />
      </Stack.Navigator>
  );
};

export default HomeStack;