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
    <View style={{ flex: 1,  justifyContent: 'center', margin: 'auto' }}>
      <Text variant="headlineMedium">Help </Text>
      {/* <Text></Text> */}
    </View>
  );
};

export default HelpScreen;
