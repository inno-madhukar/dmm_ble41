import React, { useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, DataTable, IconButton } from 'react-native-paper';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

let DocumentPicker: any = null;
let types: any = null;

try {
  const DocumentPickerModule = require('@react-native-documents/picker');
  DocumentPicker = DocumentPickerModule.default || DocumentPickerModule;
  types = DocumentPickerModule.types || DocumentPickerModule.default?.types;
} catch (error) {
  console.warn('Failed to import DocumentPicker:', error);
}

import generateSimplePDF from '../Components/pdfGenerator';

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
const hederobj = ["Date", "DeviceID","Temp", "Moisture", "Weight","CommodityName","Note"
]
const RecordsScreen: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
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
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    return { headers, data };
  };

  const selectCSVFile = async (): Promise<void> => {
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

      const fileExists = await RNFS.exists(file.uri);

      if (!fileExists) {
        const fileName = file.name || 'temp.csv';
        const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(file.uri, cachePath);
        const fileContent: string = await RNFS.readFile(file.uri, 'utf8');
        parsedData = parseCSV(fileContent);
        console.log(parsedData)
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
        `File: ${file.name}\nRows: ${parsedData.data.length}\nColumns: ${parsedData.headers.length}`
      );

    } catch (error: any) {
      if (error?.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled file selection');
      } else {
        Alert.alert('Error', `Failed to read CSV file.\nDetails: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const handleGeneratePDF = async (): Promise<void> => {
    try {
      console.log(csvData)
      // const records: string[] = csvData.length > 0
      //   ? csvData.map((row: CSVRow) => Object.values(row).join(' - '))
      //   : ['Device 001 - Temp: 25°C', 'Device 002 - Temp: 26°C', 'Device 003 - Temp: 28°C'];
              type BLERecord = {
          "Date": string;
          "DeviceID": string;
          "Temp": string;
          "Moisture": string;
          "Weight": string;
          "CommodityName": string;
          "Note": string;
        };
      const path: string = await generateSimplePDF(csvData as BLERecord[]);
      Alert.alert('PDF Created', `Saved at: ${path}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const sharePDF = async (): Promise<void> => {

    try {
      const path = `${RNFS.DownloadDirectoryPath}/demo.pdf`;
      await Share.open({ url: `file://${path}`, type: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'Failed to share PDF');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.selectButton} onPress={selectCSVFile}>
        <Text style={styles.selectButtonText}>SELECT A FILE</Text>
      </TouchableOpacity>

      {selectedFileName ? (
        <View style={styles.fileRow}>
          <Text style={styles.selectedFile}>
            <Text style={{ fontWeight: 'bold' }}>Selected file:</Text> {selectedFileName}
          </Text>
          <View style={styles.iconRow}>
            <IconButton icon="share-variant" size={24} onPress={sharePDF} />
            <IconButton icon="printer" size={24} onPress={handleGeneratePDF} />
          </View>
        </View>
      ) : null}

      {csvData.length > 0 && csvHeaders.length > 0 && (
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <DataTable>
                <DataTable.Header>
                  {csvHeaders.map((header, index) => (
                    <DataTable.Title key={index} style={styles.cell}>
                      {header}
                    </DataTable.Title>
                  ))}
                </DataTable.Header>

                <ScrollView style={{ maxHeight: 400 }}>
                  {csvData.map((row, rowIndex) => (
                    <DataTable.Row key={rowIndex}>
                      {hederobj.map((header, cellIndex) => (
                        <DataTable.Cell key={cellIndex} style={styles.cell}>
                          {row[header]}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  selectButton: {
    backgroundColor: '#FFA86B',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginBottom: 16,
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
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
  cell: {
    minWidth: 120,
    justifyContent: 'center',
  },
});

export default RecordsScreen;
