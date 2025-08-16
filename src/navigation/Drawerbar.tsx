import React, { useRef ,useState} from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { IconButton, Menu, Appbar } from 'react-native-paper';
// import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpScreen from '../screens/HelpScreen';
import RecordsScreen from '../screens/RecordsScreen';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import HomeStack from '../screens/HomeStack';
const Tab = createBottomTabNavigator();
import ContactModal, { ContactUsModalRef } from '../screens/ContectUsModal';

export type MyTabParamList = {
  HomeScreen: undefined;
  RecordsScreen: undefined;
  HelpScreen: { userID: number };
  ProfileScreen: undefined;
  PeripheralDeviceScreen: { peripheralData: any };
};

const CustomHeader = ({ onContactPress }: { onContactPress: () => void }) => {

  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<MyTabParamList>>();

  return (
    <Appbar.Header style={{ backgroundColor: '#eca921ff' }}>
      {/* Left spacer to balance center title */}
      <View style={{ width: 48 }} />

      {/* Centered title */}
      <Appbar.Content
        title="INNOVATIVE INSTRUMENTS"
        titleStyle={{
          textAlign: 'center',
          fontWeight: 'bold',
          color: 'white',
          fontSize: 16,
        }}
      />

      {/* Right-aligned menu using IconButton */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item title="Contact Us" onPress={() => {
          setMenuVisible(false);
          onContactPress(); // trigger modal
        }} />
      </Menu>
    </Appbar.Header>
  );
};



const Drawer = createDrawerNavigator();

const AppDrawer = () => {
  const theme = useTheme();
  const contactModalRef = useRef<ContactUsModalRef>(null);

  return (
    <>
      <Drawer.Navigator
        screenOptions={{
              drawerType: 'permanent', // <- always visible
    swipeEnabled: false,     // <- disables swipe gesture
          headerShown: true,
          header: () => (
            <CustomHeader onContactPress={() => contactModalRef.current?.open()} />
          ),
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.onSurface,
          drawerStyle: {
            backgroundColor: theme.colors.surface,
          },
        }}
      >
        <Drawer.Screen
          name="HomeScreen1"
          component={HomeStack}
          options={{
            drawerLabel: 'Home',
            drawerIcon: ({ color, size }) => (
              <IconButton icon="home" size={size} iconColor={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="RecordsScreen"
          component={RecordsScreen}
          options={{
            drawerLabel: 'Records',
            drawerIcon: ({ color, size }) => (
              <IconButton icon="records" size={size} iconColor={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="HelpScreen"
          component={HelpScreen}
          initialParams={{ userID: 123 }}
          options={{
            drawerLabel: 'Help',
            drawerIcon: ({ color, size }) => (
              <IconButton icon="help" size={size} iconColor={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            drawerLabel: 'Profile',
            drawerIcon: ({ color, size }) => (
               <IconButton icon="account" size={size} iconColor={color} />
            ),
          }}
        />
      </Drawer.Navigator>
      
      <ContactModal ref={contactModalRef} />
    </>
  );
};

export default AppDrawer;
