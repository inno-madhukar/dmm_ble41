import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, FlatList, Platform, Alert } from "react-native";
import { Text, Button,Card,Portal,Modal, Chip, IconButton } from "react-native-paper";
import { useFocusEffect } from '@react-navigation/native';

let RNFS: typeof import('react-native-fs') | undefined;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  RNFS = require('react-native-fs');
}

interface Client {
  [key: string]: any; // allow multiple fields
}

let CLIENTS_FILE: string = "";
if (RNFS) {
  CLIENTS_FILE = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/userdata/clients.json`;
}

const ShowClientsScreen = () => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>This feature is only available on iOS and Android devices.</Text>
      </View>
    );
  }


  const [clients, setClients] = useState<Client[]>([]);
  const [visible, setVisible] = useState(false);
  const [selectedclient,setSelectedClient]=useState<any>({})
 const showModal = (item:any) =>{ 

  setSelectedClient(item)
  setVisible(true)
};
  const hideModal = () => setVisible(false);
  const clientname=useRef('');
  const loadClients = async () => {
    try {
      if (RNFS) {
        if (await RNFS.exists(CLIENTS_FILE)) {
          const content = await RNFS.readFile(CLIENTS_FILE, "utf8");
          const parsed: Client[] = JSON.parse(content);
          setClients(parsed);
        } else {
          setClients([]);
        }
      }
    } catch (err) {
      console.error("Error reading clients.json:", err);
      Alert.alert("Info", "Clients data not found.");
      setClients([]);
    }
  };
  useFocusEffect(
    useCallback(() => {
      // Perform actions when focused
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        loadClients();
      }

      return () => {
        console.log('Clients screen unfocused');
      };
    }, [])
  );
  useEffect(() => {
    const loadClients = async () => {
      try {
        if (RNFS) {
          if (await RNFS.exists(CLIENTS_FILE)) {
            const content = await RNFS.readFile(CLIENTS_FILE, "utf8");
            const parsed: Client[] = JSON.parse(content);
            setClients(parsed);
          } else {
            setClients([]);
          }
        }
      } catch (err) {
        console.error("Error reading clients.json:", err);
        Alert.alert("Info", "Clients data not found.");
        setClients([]);
      }
    };
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      loadClients();
    }
  }, []);

  const saveClients = async (updatedClients: Client[]) => {
    try {
      if (RNFS) {
        await RNFS.writeFile(CLIENTS_FILE, JSON.stringify(updatedClients), "utf8");
      }
    } catch (err) {
      console.error("Error saving clients.json:", err);
      Alert.alert("Error", "Could not update client data.");
    }
  };

  const deleteClient = (index: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this client?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedClients = [...clients];
            updatedClients.splice(index, 1);
            setClients(updatedClients);
            saveClients(updatedClients);
          }
        }
      ]
    );
  };

  const renderClient = ({ item, index }: { item: Client; index: number }) => (

    <Card style={styles.card} onPress={(e)=>{showModal(item)}}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{item.clientName || "Unnamed Client"}</Text>
          <IconButton
            icon="delete"
            size={20}
            // color="#e53935"
            onPress={() => deleteClient(index)}
            style={styles.deleteButton}
          />
        </View>
   {/* Location */}
        {/* {item.location ? <Text style={styles.field}>📍Location: {item.location}</Text> : null} */}

        {/* Vendor ID */}
        {/* {item.vendorId ? <Text style={styles.field}>🏷️ Vendor ID: {item.vendorId}</Text> : null} */}

        {/* Truck Numbers */}
        {/* {item.truckNumbers && Array.isArray(item.truckNumbers) && item.truckNumbers.length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={[styles.field, { marginBottom: 4 }]}>🚛 Truck Numbers:</Text>
            <View style={styles.chipContainer}>
              {item.truckNumbers.map((truck: string, idx: number) => (
                <Chip key={idx} style={styles.chip}>{truck}</Chip>
              ))}
            </View>
          </View>
        )} */}
     

        {/* Total Weight */}
        {/* {item.totalWeight ? <Text style={styles.field}>⚖️ Total weight: {item.totalWeight} kg</Text> : null} */}

        {/* Remarks */}
        {/* {item.remarks ? <Text style={styles.field}>📝 Remarks: {item.remarks}</Text> : null} */}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Clients</Text>

      <FlatList
        data={clients}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderClient}
        contentContainerStyle={{ paddingBottom: 20 }}
        
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 12,
          }}
        >
          <View style={styles.modalHeader}>
          <IconButton
            icon="account"
            size={23}
          />
          <Text style={styles.name}>{selectedclient.clientName}</Text>
          </View>
         <Text style={styles.field}>📍Location: {selectedclient.location}</Text>
         <Text style={styles.field}>🏷️ Vendor ID: {selectedclient.vendorId}</Text> 
         {selectedclient.truckNumbers && selectedclient.truckNumbers.length > 0 && (
          <View style={{ marginTop: 3 }}>
            <Text style={[styles.field, { marginBottom: 4 }]}>{`${selectedclient.truckNumbers[0].length > 0 ? '🚛 Truck Numbers:' : ' '}`} </Text>
            <View style={styles.chipContainer}>
              {(selectedclient.truckNumbers && selectedclient.truckNumbers.length > 0 && selectedclient.truckNumbers[0].length > 0) ? (
                selectedclient.truckNumbers.map((truck: string, idx: number) => (
                  <Chip key={idx} style={styles.chip}>{truck}</Chip>
                ))
              ) : (
                console.log('No truck numbers available')
              )}
            </View>
          </View>
        )} 
          <Button mode="contained" onPress={hideModal}>
            Close
          </Button>
        </Modal>
      </Portal>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f0f2f5" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",       // place items in a row
    alignItems: "center",       // vertically center icon + text
    paddingVertical: 5,        // some vertical padding
    paddingHorizontal: 0,      // left/right padding
    // backgroundColor:"#ecececff"
    
  },
  name: {
  fontSize: 18,
  fontWeight: "500",
  marginRight: 30,  
  color: "#333",
  width: 170,
  // flex: 1, 
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    // overflow: 'visible',
  },
 deleteButton: {
  margin:0,              // 👌 removes extra spacing from IconButton
},
  field: {
    fontSize: 14,
    marginBottom: 4,
    color: "#444",
    marginLeft:7
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 6,
    marginLeft:15
  },
  chip: {
    margin: 2,
    backgroundColor: "#e3f2fd",
  },
});

export default ShowClientsScreen;
