import React from 'react';
import { View,StyleSheet } from 'react-native';
import { Text ,Divider} from 'react-native-paper';

const ProfileScreen = () => {
  return (
  <View style={styles.container}>
     <View style={{ alignItems: 'center'}}>
            <Text variant="headlineMedium" style={{color: '#2f3ceeff'}}>Digital Moisture Meter BLE</Text>
          </View>

      <Text variant="titleMedium" style={styles.heading}>Contact Us</Text>

      <Text style={styles.label}>Address</Text>
      <Text style={styles.text}>125 Mahajan Society</Text>
      <Text style={styles.text}>Behind convent school</Text>
      <Text style={styles.text}>Fatehgunj, Vadodara 39000d</Text>

      <Text style={styles.label}>Phone</Text>
      <Text style={styles.text}>+91 265 2791184</Text>

      <Text style={styles.label}>SMS/WhatsApp</Text>
      <Text style={styles.text}>+91 63566 15024</Text>

      <Text style={styles.label}>Website</Text>
      <Text style={styles.text}>www.innovative-instruments.in</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  text: {
    textAlign: 'center',
    marginBottom: 2,
  },
});
export default ProfileScreen;
