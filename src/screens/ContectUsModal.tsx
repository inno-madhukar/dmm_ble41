import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet,Linking } from 'react-native';
import { Modal, Portal, Text, Button, Divider } from 'react-native-paper';
import ShowClientsModal from '../Components/showClients';
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

   const handleLinkPress = () => {
    Linking.openURL('https://www.innovative-instruments.in');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => setVisible(false)}
        contentContainerStyle={styles.container}
      >
       
        <Divider style={{ marginVertical: 12 }} />

        <Text variant="titleMedium" style={styles.heading}>Contact Us</Text>

        <Text style={styles.label}>Address</Text>
        <Text style={styles.text}>125 Mahajan Society</Text>
        <Text style={styles.text}>Behind convent school</Text>
        <Text style={styles.text}>Fatehgunj, Vadodara 390002</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.text}>+91 265 2791184</Text>

        <Text style={styles.label}>SMS/WhatsApp/Call</Text>
        <Text style={styles.text}>+91 63566 15024</Text>

        <Text style={styles.label}>Website</Text>
 <Text
        style={styles.textl}
        onPress={handleLinkPress}
      >
        www.innovative-instruments.in
      </Text>
        <Button mode="contained" style={{ marginTop: 20, alignSelf: 'center' }} onPress={() => setVisible(false)}>
          Close
        </Button>
      <ShowClientsModal />
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
    //  textDecorationLine: 'underline',
    // fontSize: 16,
  },
    textl: {
    textAlign: 'center',
    marginBottom: 2,
     textDecorationLine: 'underline',
    // fontSize: 16,
  },
});

export default ContactUsModal;
