import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useTheme } from 'react-native-paper';


const profileFilePath = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/userdata/profile.json`;

const ProfileScreen = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    image: '',
    company: '',
    email: '',
    phone: '',
    address: '',
  });

  const { colors } = useTheme();

  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        return granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  // Load profile data on mount
  useEffect(() => {
    RNFS.exists(profileFilePath).then((exists) => {
      if (exists) {
        RNFS.readFile(profileFilePath, 'utf8').then((data) => {
          setProfile(JSON.parse(data));
        });
      }
    });
  }, []);

  // Handle image pick
  const handlePickImage = async () => {
    const permission = await requestStoragePermission();
    if (!permission) {
      Alert.alert('Permission denied', 'Storage permission is required.');
      return;
    }

    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        includeExtra: true,
      },

      // (response) => {
      //   if (response.assets && response.assets[0]?.uri) {
      //     setProfile((prev) => ({ ...prev, image: response.assets?.[0]?.uri || '' }));
      //   }
      // }

      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to pick image.');
          return;
        }
  
        const asset = response.assets?.[0];
        const fileName = asset?.fileName || '';
        const isJpg = fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg') || fileName.toLowerCase().endsWith('.png');
  
        if (!isJpg) {
          Alert.alert('Invalid Image', 'Please select a JPG image only.');
          return;
        }
  
        if (asset?.uri) {
          setProfile((prev) => ({ ...prev, image: asset.uri || '' }));
        }
      }
      
    );
  };

  // Validate fields before saving
  const validateProfile = () => {
    const { image, company, email, phone, address } = profile;

    if (!image) {
      Alert.alert('Validation Error', 'Please select an image.');
      return false;
    }

    if (!company.trim()) {
      Alert.alert('Validation Error', 'Company name is required.');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email ID is required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return false;
    }

    if (phone.length < 10 || !/^\d+$/.test(phone)) {
      Alert.alert('Validation Error', 'Phone number must be at least 10 digits.');
      return false;
    }

    if (!address.trim()) {
      Alert.alert('Validation Error', 'Address is required.');
      return false;
    }

    return true;
  };

  // Save to JSON file
  const handleSave = async () => {
    if (!validateProfile()) return;

    try {
      await RNFS.writeFile(profileFilePath, JSON.stringify(profile), 'utf8');
      Alert.alert('Success', 'Profile saved successfully.');
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ color: '#2f3ceeff' }}>
        Digital Moisture Meter BLE
      </Text>

      <TouchableOpacity onPress={editing ? handlePickImage : undefined}>
        {profile.image ? (
          <Image source={{ uri: profile.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ color: '#888' }}>Pick Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        label="Company"
        value={profile.company}
        onChangeText={(text) => setProfile({ ...profile, company: text })}
        style={styles.input}
        mode="outlined"
        editable={editing}
      />
      <TextInput
        label="Email ID"
        value={profile.email}
        onChangeText={(text) => setProfile({ ...profile, email: text })}
        style={styles.input}
        mode="outlined"
        editable={editing}
        keyboardType="email-address"
      />
      <TextInput
        label="Phone Number"
        value={profile.phone}
        onChangeText={(text) => setProfile({ ...profile, phone: text })}
        style={styles.input}
        mode="outlined"
        editable={editing}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Address"
        value={profile.address}
        onChangeText={(text) => setProfile({ ...profile, address: text })}
        style={styles.input}
        mode="outlined"
        editable={editing}
        multiline
      />

<Button
  mode="contained"
  onPress={editing ? handleSave : () => setEditing(true)}
  textColor={editing ? colors.primary : 'white'}
      buttonColor={editing ? 'white' : colors.primary}
      style={[
        styles.button,
        editing && { borderWidth: 1.5, borderColor: colors.primary }
      ]}
>
  {editing ? 'Save' : 'Edit'}
</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
  },
  input: {
    marginTop: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 16,
    alignSelf: 'center',
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    alignSelf: 'center',
  },
  button: {
    marginTop: 24,
    width: '30%',
    alignSelf: 'center',
  },
});

export default ProfileScreen;
