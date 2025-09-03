import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import RNFS from "react-native-fs";

interface Client {
  [key: string]: any;  // allow multiple values
}

const CLIENTS_FILE = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/userdata/clients.json`;

const ShowClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);

  // Load clients.json automatically when screen opens
  useEffect(() => {
    const loadClients = async () => {
      try {
        if (await RNFS.exists(CLIENTS_FILE)) {
          const content = await RNFS.readFile(CLIENTS_FILE, "utf8");
          const parsed: Client[] = JSON.parse(content);
          setClients(parsed);
        } else {
          setClients([]);
        }
      } catch (err) {
        console.error("Error reading clients.json:", err);
        setClients([]);
      }
    };

    loadClients();
  }, []);

  // Render Client Card
  const renderClient = ({ item }: { item: Client }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.name}>{item.clientName || "Unnamed Client"}</Text>

        {/* Location */}
        {item.location ? <Text style={styles.field}>📍Location: {item.location}</Text> : null}

        {/* Vendor ID */}
        {item.vendorId ? <Text style={styles.field}>🏷️ Vendor ID: {item.vendorId}</Text> : null}

        {/* Truck Numbers (as chips if array) */}
        {item.truckNumbers && Array.isArray(item.truckNumbers) && item.truckNumbers.length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={[styles.field, { marginBottom: 4 }]}>🚛 Truck Numbers:</Text>
            <View style={styles.chipContainer}>
              {item.truckNumbers.map((truck: string, idx: number) => (
                <Chip key={idx} style={styles.chip}>{truck}</Chip>
              ))}
            </View>
          </View>
        )}

        {/* Total Weight */}
        {item.totalWeight ? <Text style={styles.field}>⚖️ Total weight: {item.totalWeight} kg</Text> : null}

        {/* Remarks */}
        {item.remarks ? <Text style={styles.field}>📝 Remarks: {item.remarks}</Text> : null}
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
  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
    color: "#222",
  },
  field: {
    fontSize: 14,
    marginBottom: 4,
    color: "#444",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 6,
  },
  chip: {
    margin: 2,
    backgroundColor: "#e3f2fd",
  },
});

export default ShowClientsScreen;
