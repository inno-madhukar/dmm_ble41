import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { MyTabParamList } from '../navigation/BottomTabs'; // adjust path

type HelpScreenRouteProp = RouteProp<MyTabParamList, 'HelpScreen'>;

const HelpScreen = () => {
  const route = useRoute<HelpScreenRouteProp>();
  const { userID } = route.params;

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text variant="headlineMedium">{`User ID: ${userID}`} Help</Text>
      {/* <Text></Text> */}
    </View>
  );
};

export default HelpScreen;
