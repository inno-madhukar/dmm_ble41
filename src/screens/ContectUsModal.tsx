import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Divider } from 'react-native-paper';

export type ContactUsModalRef = {
  open: () => void;
  close: () => void;
};

const ContactUsModal = forwardRef<ContactUsModalRef>((_, ref) => {
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => setVisible(false)}
        contentContainerStyle={styles.container}
      >
        <View style={{ alignItems: 'center' }}>
          <Text variant="headlineMedium" style={{ color: '#2f3ceeff', textAlign: 'center' }}>
            Digital Moisture Meter BLE
          </Text>
        </View>

        <Divider style={{ marginVertical: 12 }} />

        <Text variant="titleMedium" style={styles.heading}>Contact Us</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.text}>125 Mahajan Society</Text>
        <Text style={styles.text}>Behind convent school</Text>
        <Text style={styles.text}>Fatehgunj, Vadodara 390000</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.text}>+91 265 2791184</Text>

        <Text style={styles.label}>SMS/WhatsApp</Text>
        <Text style={styles.text}>+91 63566 15024</Text>

        <Text style={styles.label}>Website</Text>
        <Text style={styles.text}>www.innovative-instruments.in</Text>

        <Button mode="contained" style={{ marginTop: 20 }} onPress={() => setVisible(false)}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 24,
    padding: 24,
    borderRadius: 12,
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default ContactUsModal;
