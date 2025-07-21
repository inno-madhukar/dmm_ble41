import React, { useState } from 'react';
import { View, Alert, StyleSheet, Button, ScrollView } from 'react-native';
import { Text, DataTable } from 'react-native-paper';
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
        headers.forEach((header: string, index: number) => {
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
        setCsvData(parsedData.data);
        setCsvHeaders(parsedData.headers);
        await RNFS.unlink(cachePath);
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
      const records: string[] = csvData.length > 0
        ? csvData.map((row: CSVRow) => Object.values(row).join(' - '))
        : ['Device 001 - Temp: 25°C', 'Device 002 - Temp: 26°C', 'Device 003 - Temp: 28°C'];

      const path: string = await generateSimplePDF(records);
      Alert.alert('PDF Created', `Saved at: ${path}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const sharePDF = async (): Promise<void> => {
    try {
      const path = `${RNFS.DownloadDirectoryPath}/example1.pdf`;
      await Share.open({ url: `file://${path}`, type: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'Failed to share PDF');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Records Screen</Text>

      <View style={styles.button}>
        <Button title="Select File" onPress={selectCSVFile} />
      </View>

      <View style={styles.button}>
        <Button title="Generate PDF" onPress={handleGeneratePDF} />
      </View>

      <View style={styles.button}>
        <Button title="Share PDF" onPress={sharePDF} />
      </View>

      {selectedFileName && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileInfoTitle}>Selected CSV File</Text>
          <Text><Text style={styles.label}>File Name:</Text> {selectedFileName}</Text>
          <Text><Text style={styles.label}>Records Count:</Text> {csvData.length}</Text>
        </View>
      )}

      {csvData.length > 0 && csvHeaders.length > 0 && (
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>CSV Data ({csvData.length} rows)</Text>

          {/* Horizontal Scroll */}
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

                {/* Vertical Scroll for rows */}
                <ScrollView style={{ maxHeight: 400 }}>
                  {csvData.map((row, rowIndex) => (
                    <DataTable.Row key={rowIndex}>
                      {csvHeaders.map((header, cellIndex) => (
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

          {csvData.length > 10 && (
            <Text style={styles.tableFooter}>
              Showing all {csvData.length} rows. Scroll to view more.
            </Text>
          )}
          
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    marginBottom: 20,
  },
  fileInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  fileInfoTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
  },
  tableContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 10,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  cell: {
    minWidth: 120, // Adjust this value based on expected data size
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  tableFooter: {
    padding: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});

export default RecordsScreen;
