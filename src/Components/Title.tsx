import {Text } from 'react-native-paper';
import { View } from 'react-native';
import { Dimensions, Image,PixelRatio } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = SCREEN_WIDTH / 390;
export function normalize(size: number) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
function DMMTitle(){
    return(
        <>
          <View style={{ alignItems: 'center' }}>
            <Image source={require('../assets/logo1.jpg')} style={{ width: 70, height: 70 }} />
            <Text variant="headlineMedium" style={{ color: '#121213ff', fontSize:normalize(24) }}>Digital Moisture Meter BLE</Text>
            <Text variant="bodyMedium" style={{ color: '#121213ff', fontSize:normalize(16) }}>Model : DMM B18</Text>
          </View>
        </>
    )
}

export default DMMTitle;