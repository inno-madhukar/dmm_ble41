import React, { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Image, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import { IconButton, Menu, useTheme, Appbar } from 'react-native-paper';
// import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpScreen from '../screens/HelpScreen';
import RecordsScreen from '../screens/RecordsScreen';
import HomeStack from '../screens/HomeStack';
const Tab = createBottomTabNavigator();
import ContactModal, { ContactUsModalRef } from '../screens/ContectUsModal';
import { lightTheme } from '../../theme';
import ShowClientsModal from '../Components/showClients';
export type MyTabParamList = {
  HomeScreen: undefined;
  RecordsScreen: undefined;
  HelpScreen: { userID: number };
  ProfileScreen: undefined;
  PeripheralDeviceScreen: { peripheralData: any };
};

const CustomHeader = ({ onContactPress }: { onContactPress: () => void }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.header}>
      {/* Left logo */}
      <Image
        source={require("../assets/Asset1.png")}
        style={styles.logo}
      />

      {/* Right menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={22}
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item
          title="Contact Us"
          leadingIcon="phone"
          style={styles.menuItem}
          titleStyle={styles.menuTitle}
          onPress={() => {
            setMenuVisible(false);
            onContactPress();
          }}
        />
        
        
      </Menu>
    </View>
  );
};




const BottomTabs = () => {
  const theme = useTheme();
  const contactModalRef = useRef<ContactUsModalRef>(null);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          // passing props
          header: () => <CustomHeader onContactPress={() => contactModalRef.current?.open()} />,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurface,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            // borderTopColor: theme.colors.border,
          },
        }}
      >
        <Tab.Screen
          name="HomeScreen1"
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <IconButton icon="home" size={size} iconColor={color} />
            ),
          }}
        />

        <Tab.Screen
          name="RecordsScreen"
          component={RecordsScreen}
          options={{ 
            tabBarLabel: 'Records',
            tabBarIcon: ({ color, size }) => (
              <IconButton icon="file-document" size={size} iconColor={color} />
            ),
          }}
        />
        <Tab.Screen
          name="HelpScreen"
          component={HelpScreen}
          initialParams={{ userID: 123 }}
          options={{
            tabBarLabel: 'Help',
            tabBarIcon: ({ color, size }) => (
              <IconButton icon="help" size={size} iconColor={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <IconButton icon="account" size={size} iconColor={color} />
            ),
          }}
        />
   <Tab.Screen
          name="Clients"
          component={ShowClientsModal}
          options={{
          
            tabBarLabel: 'Clients',
            tabBarIcon: ({ color, size }) => (
              <IconButton icon="account-box" size={size} iconColor={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <ContactModal ref={contactModalRef} />
    </>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.42)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    // width: "10%",
    height: "33%",
    resizeMode: "contain",
  },
    header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: lightTheme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 4,
  },
  logo: {
    width: "90%",
    height: "90%",
    resizeMode: "stretch",
    borderRadius: 6,
  },
  menuItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  menuTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
  },
});

export default BottomTabs;
