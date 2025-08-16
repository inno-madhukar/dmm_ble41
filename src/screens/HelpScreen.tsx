import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const HelpScreen = () => {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Help & Info</Text>
      <Text style={{ marginTop: 16, textAlign: 'center' }}>
        This is the help screen. For support or documentation, please contact support or visit our website.
      </Text>
    </View>
  );
};

export default HelpScreen;
