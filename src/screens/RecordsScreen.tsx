import React, { useState } from 'react';
import { Platform, View, Alert, StyleSheet, Button } from 'react-native';
import { Text } from 'react-native-paper';
import { pick, types, pickDirectory } from '@react-native-documents/picker'
import RNFS from 'react-native-fs';
const RecordsScreen = () => {
  const initialUri =
    Platform.OS === 'android'
      ? RNFS.ExternalStorageDirectoryPath + '/DMM1'
      : undefined;
  return (
    <Button
      title="open directory"
      onPress={async () => {
        try {
          const res = await pick({
            mode: 'open',
            initialUri, // only a *hint*, user can still navigate away
          });
          console.log(res)
          // do something with the uri
        } catch (err) {
          // see error handling section
          console.error(err)
        }
      }}
    />
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    marginBottom: 20,
  },
  fileInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  fileInfoTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
  },
});

export default RecordsScreen;



// i am create one Image Editor application and for that i have some requirements that user can Edit that image that present in App Internal path (data/data/com.myapp/files)

// for that i have done open gallery and import (copy) in inside data/data/com.myapp/files/Master folder and thats work fine i am using RNFS for copy that images

// for edit i have requirement that user can select only and only from that data/data/com.myapp/files/Master path

// how to open Document Picker or File Picker from data/data/com.myapp/files/Master specific folder ?