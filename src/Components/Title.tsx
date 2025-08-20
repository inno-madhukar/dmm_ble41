import {Text } from 'react-native-paper';
import { View } from 'react-native';


function DMMTitle(){
    return(
        <>
          <View style={{ alignItems: 'center' }}>
        <Text variant="headlineMedium" style={{ color: '#2f3ceeff' }}>Digital Moisture Meter BLE</Text>
        <Text variant="bodyMedium" style={{ color: '#2f3ceeff' }}>Model : DMM B18</Text>
      </View>
        </>
    )
}

export default DMMTitle;