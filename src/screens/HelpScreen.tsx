import React from 'react';
import { View, Linking } from 'react-native';
import { Text, Button } from 'react-native-paper';
import DMMTitle from '../Components/Title';

const HelpScreen = () => {
  const handleOpenGuide = () => {
    Linking.openURL("https://drive.google.com/file/d/1IU-xunbkml4njShWmi_IZ2jh7tInhcRL/view?usp=sharing"); // 👈 Replace with your actual link
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <DMMTitle />
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* <Text variant="headlineMedium">Help</Text> */}

        <Text style={{ marginTop: 16, textAlign: 'center' }}>
          Welcome to the Help Center!
        </Text>

        <Text style={{ marginTop: 8, textAlign: 'center' }}>
          If you’re new here, we recommend reading our{"\n"}
          <Text style={{ fontWeight: "bold" }}>User Guide</Text> to get started.
        </Text>


        <Button
          mode="contained"
          icon="book-open-variant"
          onPress={handleOpenGuide}
          style={{ marginTop: 24 }}
        >
          Open User Guide
        </Button>
      </View>
    </View>
  );
};

export default HelpScreen;
