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

export type MyTabParamList = {
  HomeScreen: undefined;
  RecordsScreen: undefined;
  HelpScreen: { userID: number };
  ProfileScreen: undefined;
  PeripheralDeviceScreen: { peripheralData: any };
};

const CustomHeader = ({ onContactPress }: { onContactPress: () => void }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

  return (
    <>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: lightTheme.colors.primary }}>
        {/* Left logo (clickable) */}
        <TouchableOpacity onPress={() => setImageVisible(true)}>
          <Image
            source={require("../assets/logo1.jpg")} // adjust path
            style={{
              width: 32,
              height: 32,
              marginLeft: 8,
              resizeMode: "contain",
              borderRadius: 4,
            }}
          />
        </TouchableOpacity>

        {/* Centered title */}
        <Appbar.Content
          title="INNOVATIVE INSTRUMENTS"
          titleStyle={{
            textAlign: "center",
            fontWeight: "bold",
            color: "white",
            fontSize: 19,
          }}
        />

        {/* Right menu */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              iconColor="white"
              size={20}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
           <Menu.Item
    title="Contact Us"
    leadingIcon="phone"   // optional: add an icon
    style={{
      backgroundColor: "#f0f0f0ff", // menu item background
      borderRadius: 6,
      marginHorizontal: 0,
    }}
    titleStyle={{
      fontWeight: "600",
      color: "#333",
      fontSize: 15,
    }}
    onPress={() => {
      setMenuVisible(false);
      onContactPress();
    }}
  />
        </Menu>
      </Appbar.Header>

      {/* Full-screen zoomable image modal */}
<Modal visible={imageVisible} transparent animationType="fade">
  <View style={styles.modalBackground}>
    <TouchableOpacity
      style={styles.modalBackground}
      activeOpacity={1}
      onPressOut={() => setImageVisible(false)}
    >
      <Image
        source={require("../assets/logo1.jpg")}  // ✅ fix path
        style={styles.fullImage}
      />
    </TouchableOpacity>
  </View>
</Modal>
    </>
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
});

export default BottomTabs;
