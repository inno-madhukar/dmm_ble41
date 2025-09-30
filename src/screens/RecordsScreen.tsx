import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity, FlatList

} from 'react-native';
import { Text, DataTable, IconButton, Portal, Button, Dialog, Menu, TextInput } from 'react-native-paper';

import DMMTitle from '../Components/Title';
import { Platform } from 'react-native';
// import Dmm_ble4 from '../NativeDmm_ble4';
let RNFS: typeof import('react-native-fs') | undefined;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  RNFS = require('react-native-fs');
}
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
const hederobj = ["Date", 'Device ID', 'Moisture %', 'Temperature °C', 'Weight (gm)', 'Commodity Name', 'Client Name', 'Client Address', 'Truck Number', 'Vendor ID', 'Total Weight (kg)', 'Remarks'
]
const RecordsScreen: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('AllFILE');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionMenuVisible, setSuggestionMenuVisible] = useState(false);

  let parsedData: ParsedCSVData;

  useEffect(() => {
    if (selectedFileName == "AllFILE") {
      loadAllCSVs(); // loads all stored CSVs
      // setSelectedFileName("notall")
    }
  }, [selectedFileName]);


  const loadAllCSVs = async () => {
    try {
      if ((Platform.OS === 'ios' || Platform.OS === 'android') && RNFS) {
        const folderPath = `${RNFS.DownloadDirectoryPath}/Innovative_instrument/Data`; // your folder
        const files = await RNFS.readDir(folderPath);
        console.log(folderPath)
        // filter only .csv files
        const csvFiles = files.filter((f) => f.isFile() && f.name.endsWith(".csv"));

        let mergedHeaders: string[] = [];
        let mergedData: CSVRow[] = [];

        for (const file of csvFiles) {
          const fileContent = await RNFS.readFile(file.path, "utf8");
          const parsed = parseCSV(fileContent);

          if (parsed.headers.length > 0 && mergedHeaders.length === 0) {
            mergedHeaders = parsed.headers; // take headers from first file
          }

          mergedData = [...mergedData, ...parsed.data];
        }

        // update state
        setCsvHeaders(mergedHeaders);
        setCsvData(mergedData);
        // setFilteredData(mergedData);
      }
      else {
        console.log("no files")
      }
    } catch (err) {
      console.error("Error loading CSVs:", err);
    }
  };

  const toggleRowSelection = (rowIndex: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex) // unselect
        : [...prev, rowIndex] // select
    );
  };
  // Utility: normalize headers → safe keys for objects
  const normalizeHeader = (header: string) =>
    header
      .trim()
  // .replace(/"/g, "")
  // .replace(/\s+/g, "_")      // spaces → underscore
  // .replace(/[()%°]/g, "")    // remove special chars
  // .replace(/_+/g, "_")       // collapse multiple underscores
  // .toLowerCase();            // lower case for consistency

  const parseCSV = (csvText: string): ParsedCSVData => {
    // Replace line breaks inside quotes with space
    const cleaned = csvText.replace(/"(.*?)"/gs, (match) =>
      match.replace(/[\r\n]+/g, " ")
    );

    const lines = cleaned.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return { headers: [], data: [] };

    // Original headers (for UI)
    const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    // Normalized headers (for keys)
    const headers = rawHeaders.map(normalizeHeader);

    const data: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((value) => value.trim().replace(/"/g, ""));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        // safe fallback if column missing
        row[header] = values[index] ?? "";
      });

      data.push(row);
    }


    return { headers, data };
  };

  const selectCSVFile = async (): Promise<void> => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      // let num=Dmm_ble4.createFolder("C://Users");
      // Alert.alert('Unsupported Platform', 'File selection is only'+num.then((val)=>{return val}));
      return;
    }

    try {
      if (!DocumentPicker || !DocumentPicker.pick) {
        throw new Error('DocumentPicker is not properly installed or imported');
      }

      const results: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [types?.csv || 'text/csv'],
        allowMultiSelection: true,
      });

      if (!RNFS) {
        Alert.alert('Error', 'File system not available on this platform.');
        return;
      }

      // UI: Show all file names
      const fileNames = results.map(f => f.name || 'Unknown file').join(', ');
      setSelectedFileName(fileNames);

      const allData: any[] = [];
      let headers: string[] = [];

      for (const file of results) {
        const fileUri = file.uri;
        const fileName = file.name || 'temp.csv';

        // Some Android URIs are not "real files" → copy them to cache
        let filePath = fileUri;
        const fileExists = await RNFS.exists(fileUri);

        if (!fileExists) {
          const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
          await RNFS.copyFile(fileUri, cachePath);
          filePath = cachePath;
        }

        // Read & parse
        const fileContent: string = await RNFS.readFile(filePath, 'utf8');
        const parsed = parseCSV(fileContent);

        if (parsed.headers?.length && headers.length === 0) {
          headers = parsed.headers; // keep first file's headers
        }

        allData.push(...parsed.data);

        // If copied → cleanup
        if (!fileExists) {
          await RNFS.unlink(filePath);
        }
      }

      // Save all parsed data & headers
      setCsvData(allData);
      setCsvHeaders(headers);
      console.log(allData)
      console.log(headers);
      Alert.alert('CSV Files Selected', `Files: ${fileNames}`);

    } catch (error: any) {
      if (error?.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled file selection');
      } else {
        console.error('CSV Read Error:', error);
        Alert.alert('Warning', `CSV file not selected!`);
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
      const rowsToPrint =
        selectedRows.length > 0
          ? selectedRows.map((i) => filteredData[i])
          : filteredData;
      const path: string = await generateSimplePrintAndPDF(rowsToPrint as BLERecord[], "print");
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

      if (RNFS) {

        const rowsToPrint =
          selectedRows.length > 0
            ? selectedRows.map((i) => filteredData[i])
            : filteredData;

              const now = new Date();
          const dd = String(now.getDate()).padStart(2, '0');
          const mm = String(now.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
          const yy = String(now.getFullYear()).slice(-2);
          const hh = String(now.getHours()).padStart(2, '0');
          const min = String(now.getMinutes()).padStart(2, '0');
          const ss = String(now.getSeconds()).padStart(2, '0');

          const timestamp = `${dd}${mm}${yy}_${hh}${min}${ss}`;
        const fileName = `${timestamp}_Records.pdf`;
        const path = await generateSimplePrintAndPDF(rowsToPrint as BLERecord[], selectedFileName);
        const externalPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(path, externalPath);
        console.log(path)
        // const path = `${RNFS.DownloadDirectoryPath}/demo.pdf`;
        if (!Share) {
          Alert.alert('Error', 'Sharing not available on this platform.');
          return;
        }
        await (Share as any).open({ url: `file://${externalPath}`, type: 'application/pdf' });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share PDF');
    }
  };



  const shareCSV = async (): Promise<void> => {
    try {
      // Determine which rows to export
      const rowsToExport =
        selectedRows.length > 0
          ? selectedRows.map((i) => filteredData[i]) // only selected rows
          : filteredData; // otherwise, everything in table

      if (!rowsToExport || rowsToExport.length === 0) {
        Alert.alert("No Data", "There is no data to share.");
        return;
      }

      // Build CSV string
      const csvHeadersLine = csvHeaders.join(","); // keep original headers
      const csvRows = rowsToExport.map((row) =>
        csvHeaders.map((h) => `"${row[h] ?? ""}"`).join(",")
      );
      const csvContent = [csvHeadersLine, ...csvRows].join("\n");

      if (!RNFS) {
        Alert.alert("Error", "File system not available on this platform.");
        return;
      }
                  const now = new Date();
          const dd = String(now.getDate()).padStart(2, '0');
          const mm = String(now.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
          const yy = String(now.getFullYear()).slice(-2);
          const hh = String(now.getHours()).padStart(2, '0');
          const min = String(now.getMinutes()).padStart(2, '0');
          const ss = String(now.getSeconds()).padStart(2, '0');

          const timestamp = `${dd}${mm}${yy}_${hh}${min}${ss}`;
        const fileName = `${timestamp}_Records.csv`;
      // Save to a temporary CSV file
      // const fileName =
      //   selectedFileName.replace(/\.csv$/, "") || "exported_table";
      const exportPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.writeFile(exportPath, csvContent, "utf8");

      if (!Share) {
        Alert.alert("Error", "Sharing not available on this platform.");
        return;
      }

      // Share the generated CSV
      await (Share as any).open({
        url: `file://${exportPath}`,
        type: "text/csv",
        failOnCancel: false,
      });
    } catch (error) {
      console.error("CSV Share Error:", error);
      Alert.alert("Share Error", "Failed to share CSV.");
    }
  };


  const filteredData = csvData.filter((row) => {
    if (!filterText) return true; // no filter, show all

    if (selectedColumn === "All") {
      // Search across all columns
      return csvHeaders.some((header) =>
        row[header]?.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    if (selectedColumn) {
      return row[selectedColumn]?.toLowerCase().includes(filterText.toLowerCase());
    }

    return true;
  });

  useEffect(() => {
    if (selectedColumn === "Client Name" && filterText.length > 1) {
      const matches = csvData
        .map(r => r["Client Name"])
        .filter(name => name?.toLowerCase().includes(filterText.toLowerCase()))
        .filter((v, i, arr) => arr.indexOf(v) === i) // unique
        .slice(0, 5); // limit 5
      setSuggestions(matches);
      setSuggestionMenuVisible(matches.length > 0);
    } else {
      setSuggestions([]);
      setSuggestionMenuVisible(false);
    }
  }, [filterText, selectedColumn, csvData]);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DMMTitle />
      <View style={{ alignItems: 'center', marginBottom: 20 }}></View>
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
        {/* Select File */}
        <Button mode="contained" style={styles.sbutton} onPress={selectCSVFile}>
          Select File
        </Button>

        {/* Select All Files */}
        <Button
          mode="contained"
          style={[styles.sbutton, { marginLeft: 10 }]}
          onPress={() => { setSelectedFileName("AllFILE"); loadAllCSVs() }}
        >
          Select All Files
        </Button>
      </View>

      {selectedFileName ? (
        <View style={styles.fileRow}>
          <Text style={styles.selectedFile}>
            <Text style={{ fontWeight: 'bold' }}>Selected files:</Text> {"  "}
            {selectedFileName === "AllFILE" ? "All Files" : selectedFileName}
          </Text>
          <View style={styles.iconRow}>
            <IconButton icon="share-variant" size={24} onPress={() => setShowShareDialog(true)} />
            <IconButton icon="printer" size={24} onPress={handleGeneratePrint} />
          </View>
        </View>
      ) : null}

      {csvHeaders.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisible(true)}>
                {selectedColumn || "Select Column"}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedColumn("All");
                setMenuVisible(false);
              }}
              title="All"
            />
            {csvHeaders.map((header, index) => (
              <Menu.Item
                key={index}
                onPress={() => {
                  setSelectedColumn(header);
                  setMenuVisible(false);
                }}
                title={header}
              />
            ))}
          </Menu>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Menu
              visible={suggestionMenuVisible}
              onDismiss={() => setSuggestionMenuVisible(false)}
              anchor={
                <View style={{ flex: 1 }}>
                  <TextInput
                    label="Filter value"
                    mode="outlined"
                    value={filterText}
                    onChangeText={setFilterText}
                    style={{ width: "100%" }}
                  />
                </View>
              }
              style={{ width: "80%" }} // optional, controls dropdown width
            >
              {suggestions.map((s, i) => (
                <Menu.Item
                  key={i}
                  title={s}
                  onPress={() => {
                    setFilterText(s);
                    setSuggestionMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
          </View>
        </View>
      )}


      {filteredData.length > 0 && csvHeaders.length > 0 && (
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <DataTable>

                {/* Table Headers */}
                <DataTable.Header>
                  {csvHeaders.map((header, index) => (
                    <DataTable.Title key={index} style={styles.cell}>
                      <Text style={styles.headerText}>{header}</Text>
                    </DataTable.Title>
                  ))}
                </DataTable.Header>

                {/* Table Rows */} 
                <FlatList
                  data={filteredData}
                  keyExtractor={(_, index) => index.toString()}
                  nestedScrollEnabled
                  style={{ maxHeight: 400 }}
                  renderItem={({ item: row, index: rowIndex }) => {
                  const isSelected = selectedRows.includes(rowIndex); 
                    return (
                      <DataTable.Row
                        onPress={() => toggleRowSelection(rowIndex)}
                        style={{
                          backgroundColor: isSelected ? "#d0ebff" : "transparent",
                        }}
                      >
                        {hederobj.map((header, cellIndex) => (
                          <DataTable.Cell key={cellIndex} style={styles.cell}>
                            <Text numberOfLines={2} style={styles.cellText}>
                              {row[header]}
                            </Text>
                          </DataTable.Cell>
                        ))}
                      </DataTable.Row>
                    );
                  }}
                />
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
