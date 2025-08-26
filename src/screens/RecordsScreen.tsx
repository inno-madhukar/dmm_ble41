import React, { useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, DataTable, IconButton, Portal, Button, Dialog } from 'react-native-paper';
import DMMTitle from '../Components/Title';
import { Platform } from 'react-native';
let RNFS: typeof import('react-native-fs') | undefined;
let Share: typeof import('react-native-share') | undefined;
import RNPrint from 'react-native-print';
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  RNFS = require('react-native-fs');
  Share = require('react-native-share').default;
}

let DocumentPicker: any = null;
let types: any = null;


if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const DocumentPickerModule = require('@react-native-documents/picker');
    DocumentPicker = DocumentPickerModule.default || DocumentPickerModule;
    types = DocumentPickerModule.types || DocumentPickerModule.default?.types;
  } catch (error) {
    console.warn('Failed to import DocumentPicker:', error);
  }
}

import generateSimplePrintAndPDF from '../Components/printPdfGenerator';

interface CSVRow {
  [key: string]: string;
}

interface ParsedCSVData {
  headers: string[];
  data: CSVRow[];
}

interface DocumentPickerResponse {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}
const hederobj = ["Date", "DeviceID", "Moisture %", "Temp°C",  "Weight", "CommodityName", "Note"
]
const RecordsScreen: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');

  let parsedData: ParsedCSVData;

  const parseCSV = (csvText: string): ParsedCSVData => {
    const cleaned = csvText.replace(/"(.*?)"/gs, (match) =>
      match.replace(/[\r\n]+/g, ' ')
    );
    const lines: string[] = cleaned.split('\n');
    const headers: string[] = lines[0].split(',').map((header: string) => header.trim().replace(/"/g, ''));
    const data: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        const values: string[] = lines[i].split(',').map((value: string) => value.trim().replace(/"/g, ''));
        const row: CSVRow = {};
        hederobj.forEach((header: string, index: number) => {
          if (header == 'Note') {
            row[header] = values[index].replaceAll(" ", "\n") || '';
          }
          else if (header == 'Date') {
            row[header] = values[index].replaceAll(" ", "\n") || '';
          }
          else {
            row[header] = values[index] || '';
          }

        });
        data.push(row);
      }
    }
    return { headers, data };
  };

const scsv = async (): Promise<void> => {
  try {
    const { default: Dmmble4 } = await import('../NativeDmmble4');
    const data = await Dmmble4.readCsv();

    if (data.length === 0) {
      Alert.alert("CSV Reader", "No data found in CSV.");
      return;
    }

    Alert.alert("CSV Reader", `First cell: ${data[0][0]}`);
  } catch (err:any) {
    Alert.alert("Error", JSON.stringify(err));
  }
};

  const selectCSVFile = async (): Promise<void> => {
    
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
     await scsv()
      Alert.alert('Unsupported Platform', 'File selection is only supported on Android/iOS.');
      return;
    }
    try {
      if (!DocumentPicker || !DocumentPicker.pick) {
        throw new Error('DocumentPicker is not properly installed or imported');
      }

      const result: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [types?.csv || 'text/csv'],
        allowMultiSelection: false,
      });

      const file: DocumentPickerResponse = result[0];
      setSelectedFileName(file.name || 'Unknown file');
      console.log(file.uri)
      if (!RNFS) {
        Alert.alert('Error', 'File system not available on this platform.');
        return;
      }
      const fileExists = await RNFS.exists(file.uri);
      setSelectedFilePath(file.uri); // Save path for sharing
      if (!fileExists) {
        console.log(".........................................")
        const fileName = file.name || 'temp.csv';
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(file.uri, cachePath);
        const fileContent: string = await RNFS.readFile(file.uri, 'utf8');
        parsedData = parseCSV(fileContent);
        console.log(parsedData.data)
        setCsvData(parsedData.data);
        setCsvHeaders(parsedData.headers);
        await RNFS.unlink(cachePath);
        console.log(cachePath)
      } else {
        const fileContent: string = await RNFS.readFile(file.uri, 'utf8');
        parsedData = parseCSV(fileContent);
        setCsvData(parsedData.data);
        setCsvHeaders(parsedData.headers);
      }

      Alert.alert(
        'CSV File Selected',
        `File: ${file.name}`
      );

    } catch (error: any) {
      if (error?.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled file selection');
      } else {
        // Alert.alert('Error', `Failed to read CSV file.\nDetails: ${error?.message || 'Unknown error'}`);
        Alert.alert('Warning', `CSV file not Selected !`);

      }
    }
  };

  const handleGeneratePrint = async (): Promise<void> => {
    try {
      console.log(csvData)
      // const records: string[] = csvData.length > 0
      //   ? csvData.map((row: CSVRow) => Object.values(row).join(' - '))
      //   : ['Device 001 - Temp: 25°C', 'Device 002 - Temp: 26°C', 'Device 003 - Temp: 28°C'];
      type BLERecord = {
        "Date": string;
        "DeviceID": string;
        "Moisture": string;
        "Temp": string;
        "Weight": string;
        "CommodityName": string;
        "Note": string;
      };
      const path: string = await generateSimplePrintAndPDF(csvData as BLERecord[], "print");
      if (!RNPrint) {
        Alert.alert('Error', 'Printing not available on this platform.');
        return;
      }
      await RNPrint.print({ filePath: path });
    } catch (error) {
      console.log(error)
      Alert.alert("Info", 'Failed to generate PDF');
    }
  };

  const sharePDF = async (): Promise<void> => {

    try {
      type BLERecord = {
        "Date": string;
        "DeviceID": string;
        "Temp": string;
        "Moisture": string;
        "Weight": string;
        "CommodityName": string;
        "Note": string;
      };
      if(RNFS){
        const path = await generateSimplePrintAndPDF(csvData as BLERecord[], selectedFileName);
        const externalPath = `${RNFS.CachesDirectoryPath}/${selectedFileName.replace(".csv","")}.pdf`;
        await RNFS.copyFile(path, externalPath);
      console.log(path)
      // const path = `${RNFS.DownloadDirectoryPath}/demo.pdf`;
      if (!Share) {
        Alert.alert('Error', 'Sharing not available on this platform.');
        return;
      }
      await (Share as any).open({ url: `file://${externalPath}`, type: 'application/pdf' });
    }} catch (error) {
      Alert.alert('Error', 'Failed to share PDF');
    }
  };


  const shareCSV = async (): Promise<void> => {
    if (!selectedFilePath) {
      Alert.alert('No file', 'Please select a CSV file first.');
      return;
    }
    try {
      let pathToShare = selectedFilePath;

      // If the path is a content URI, copy it to cache first
      if (selectedFilePath.startsWith('content://')) {
        console.log("tejas")
        const fileName = selectedFileName || 'temp.csv';
        if (!RNFS) {
          Alert.alert('Error', 'File system not available on this platform.');
          return;
        }
        const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        // Copy file to accessible location
        await RNFS.copyFile(selectedFilePath, destPath);
        pathToShare = destPath;
      }

      if (!RNFS) {
        Alert.alert('Error', 'File system not available on this platform.');
        return;
      }
      const fileExists = await RNFS.exists(pathToShare);
      console.log(pathToShare)
      if (!fileExists) {
        Alert.alert('Error', 'File does not exist at:\n' + pathToShare);
        return;
      }

      if (!Share) {
        Alert.alert('Error', 'Sharing not available on this platform.');
        return;
      }
      await (Share as any).open({
        url: `file://${pathToShare}`,
        type: 'text/csv',
        failOnCancel: false,
      });
    } catch (error: any) {
      console.error('CSV Share Error:', error);
      Alert.alert('Share Error', 'Failed to share CSV file.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
     <DMMTitle />
    <View style={{ alignItems: 'center', marginBottom: 20 }}></View>
      <Button  mode="contained"  style={styles.sbutton} onPress={selectCSVFile}>
        Select File
      </Button>

      {selectedFileName ? (
        <View style={styles.fileRow}>
          <Text style={styles.selectedFile}>
            <Text style={{ fontWeight: 'bold' }}>Selected file:</Text> {selectedFileName}
          </Text>
          <View style={styles.iconRow}>
            <IconButton icon="share-variant" size={24} onPress={() => setShowShareDialog(true)} />
            <IconButton icon="printer" size={24} onPress={handleGeneratePrint} />
          </View>
        </View>
      ) : null}

      {csvData.length > 0 && csvHeaders.length > 0 && (
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <DataTable>

                {/* Table Headers */}
                <DataTable.Header>
                  {csvHeaders.map((header, index) => (
                    <DataTable.Title
                      key={index}
                      style={styles.cell}
                    >
                      <Text style={styles.headerText}>{header}</Text>
                    </DataTable.Title>
                  ))}
                </DataTable.Header>

                {/* Table Rows */}
                <ScrollView style={{ maxHeight: 400 }}>
                  {csvData.map((row, rowIndex) => (
                    <DataTable.Row key={rowIndex}>
                      {hederobj.map((header, cellIndex) => (
                        <DataTable.Cell
                          key={cellIndex}
                          style={styles.cell}
                        >
                          <Text
                            numberOfLines={2}
                            style={styles.cellText}
                          >
                            {row[header]}
                          </Text>
                        </DataTable.Cell>
                      ))}
                    </DataTable.Row>
                  ))}
                </ScrollView>

              </DataTable>
            </View>
          </ScrollView>
        </View>
      )}


      <Portal>
        <Dialog visible={showShareDialog} onDismiss={() => setShowShareDialog(false)}>
          <Dialog.Title>Share as</Dialog.Title>
          <Dialog.Content>
            <Button
              mode="contained"
              style={{ marginBottom: 10 }}
              onPress={() => {
                setShowShareDialog(false);
                sharePDF();
              }}
            >
              📄 Share as PDF
            </Button>
            <Button
              mode="contained"
              style={{ marginBottom: 10 }}
              onPress={() => {
                setShowShareDialog(false);
                shareCSV();
              }}
            >
              🧾 Share as CSV
            </Button>
            <Button
              mode="text"
              textColor="black"
              onPress={() => setShowShareDialog(false)}
            >
              Cancel
            </Button>
          </Dialog.Content>
        </Dialog>
      </Portal>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  selectButton: {
    // backgroundColor: '#FFA86B',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginBottom: 16,
  },
  sbutton: {
    alignSelf: 'center',
    // width: '80%',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedFile: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  iconRow: {
    flexDirection: 'row',
  },
  shareOption: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#f1a431ff',
  }
  ,
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },

  cell: {
    width: 80,                 // 👈 fixed width for all columns
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    flexWrap: 'wrap',
  },

  cellText: {
    textAlign: 'center',
    textAlignVertical: 'center', // Only affects Android
    fontSize: 11,
  },

  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13,
  },



});

export default RecordsScreen;
