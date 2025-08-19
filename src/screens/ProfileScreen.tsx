import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  Permission,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
let ImagePicker: typeof import('react-native-image-picker') | undefined;
let RNFS: typeof import('react-native-fs') | undefined;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  ImagePicker = require('react-native-image-picker');
  RNFS = require('react-native-fs');
}
import { useTheme } from 'react-native-paper';


// const profileFilePath = `${RNFS.DocumentDirectoryPath}/profile.json`;
const profileFilePath = (Platform.OS === 'ios' || Platform.OS === 'android') && RNFS
  ? `${RNFS.DocumentDirectoryPath}/profile.json`
  : '';

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

  async function requestPermission(permission: Permission) {
    if (Platform.OS !== "android") return true;

    try {
      const result = await PermissionsAndroid.request(permission);

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true; // ✅ granted
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        console.warn(`Permission ${permission} denied`);
        return false; // ❌ denied
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.warn(`Permission ${permission} set to never ask again`);
        return false; // ❌ permanently denied
      }
    } catch (err) {
      console.error("Permission error:", err);
      return false;
    }
  }

  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      const ok = await requestPermission(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (ok) {
        console.log("✅ Camera granted");
        return ok;
      }
      else{
        return false;
      }
    }
    return true;
  }

  // Load profile data on mount
  useEffect(() => {
    if ((Platform.OS === 'ios' || Platform.OS === 'android') && RNFS) {
      RNFS.exists(profileFilePath).then((exists: boolean) => {
        if (exists) {
          RNFS.readFile(profileFilePath, 'utf8').then((data: string) => {
            setProfile(JSON.parse(data));
          });
        }
      });
    }
  }, []);

  // Handle image pick
  const handlePickImage = async () => {
    const permission = await requestStoragePermission();
    if (!permission) {
      Alert.alert('Permission denied', 'Storage permission is required.');
      return;
    }
    if ((Platform.OS === 'ios' || Platform.OS === 'android') && ImagePicker) {
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: 1,
          includeExtra: true,
        },
        (response: any) => {
          if (response.didCancel) return;
          if (response.errorCode) {
            Alert.alert('Error', 'Failed to pick image.');
            return;
          }
          const asset = response.assets?.[0];
          const fileName = asset?.fileName || '';
          const isImage = fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg') || fileName.toLowerCase().endsWith('.png');
          if (!isImage) {
            Alert.alert('Invalid Image', 'Please select image only.');
            return;
          }
          if (asset?.uri) {
            setProfile((prev) => ({ ...prev, image: asset.uri || '' }));
          }
        }
      );
    }
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
    if ((Platform.OS === 'ios' || Platform.OS === 'android') && RNFS) {
      try {
        await RNFS.writeFile(profileFilePath, JSON.stringify(profile), 'utf8');
        Alert.alert('Success', 'Profile saved successfully.');
        setEditing(false);
      } catch (e) {
        Alert.alert('Error', 'Failed to save profile.');
      }
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
