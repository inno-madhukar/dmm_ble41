import React from 'react';
import { View, Dimensions, Image, PixelRatio, Platform, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
 
let scale=0;
// Scale factor based on design width (390 is typical for mobile)
if(Platform.OS === 'android' || Platform.OS === 'ios' ) {
scale = SCREEN_WIDTH / 360;

}
else{
  scale = SCREEN_WIDTH / 990;
}
// Normalization function to scale font sizes
export function normalize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

function DMMTitle() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo1.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text variant="headlineMedium" style={styles.title}>
        Digital Moisture Meter BLE
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Model : DMM B18
      </Text>
    </View>
  );
}

// Responsive styles
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: scale * 10,
    marginTop: scale * 20,
  },
  logo: {
    width: scale * 70,
    height: scale * 70,
    marginBottom: scale * 10,
  },
  title: {
    color: '#121213ff',
    fontSize: normalize(24),
    textAlign: 'center',
  },
  subtitle: {
    color: '#121213ff',
    fontSize: normalize(16),
    textAlign: 'center',
    marginTop: scale * 5,
  },
});

export default DMMTitle;
