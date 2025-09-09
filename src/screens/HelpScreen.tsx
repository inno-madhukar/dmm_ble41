import React, { useState } from "react";
import { View, Alert, Platform, ScrollView } from "react-native";
import { Text, Button, List, Divider } from "react-native-paper";
let RNFS: typeof import('react-native-fs') | undefined;
// console.log(RNFS);
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  RNFS = require('react-native-fs');
}
let FileViewer: any;
if (Platform.OS === "android") {
  FileViewer = require('react-native-file-viewer');
}

import DMMTitle from "../Components/Title";

const HelpScreen = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handlePress = (question: string) => {
    setExpanded(expanded === question ? null : question);
  };

  const handleOpenGuide = async () => {
    try {
      if(Platform.OS === "android" ) {
      let destPath = '';
      if ( RNFS) {
        destPath = `${RNFS.DocumentDirectoryPath}/DMM_B18_App_User_Guide.pdf`;
      }
      if (Platform.OS === "android" && RNFS) {
        // Copy PDF from assets to documents folder
        await RNFS.copyFileAssets("DMM_B18_App_User_Guide.pdf", destPath);
      } else {
        if (Platform.OS === "android" && RNFS) {
          // Copy PDF from bundle to documents folder on iOS
          const sourcePath = `${RNFS.MainBundlePath}/DMM_B18_App_User_Guide.pdf`;
          await RNFS.copyFile(sourcePath, destPath);
        }
      }


      await FileViewer.open(destPath);
    }
    } catch (error) {
      console.error("Error opening PDF:", error);
      Alert.alert("Error", "Could not open the PDF file.");
    }
  };

  const faqData = [
    {
      question: "How do I connect a new device?",
      answer:
        "Go to the Home tab, press the Scan Device button, and select your device from the list.",
    },
    {
      question: "Does Auto-connection possible?",
      answer:
        "Yes, the Saved device connected automaticaly when you send measurement from DMM Machine.",
    },
    {
      question: "Where are my CSV files stored?",
      answer:
        "CSV files are stored in System Storage -> Download -> Innovative_instruments -> Data Folder.  ",
    },
    {
      question: "How do I filter data?",
      answer:
        "Use the dropdown filter above the table to view records for a specific client or column.",
    },
    {
      question: "Can I export the filtered data only?",
      answer:
        "Yes. After applying a filter, click the Print/Share icon to export only the filtered rows.",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Title */}
      <DMMTitle />

      {/* Main content scrollable */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Welcome Section */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Welcome to the Help Center!
        </Text>

        <Text
          style={{
            marginBottom: 16,
            textAlign: "center",
            fontSize: 16,
            color: "#555",
          }}
        >
          If you’re new here, we recommend reading our{" "}
          <Text style={{ fontWeight: "bold" }}>User Guide</Text> to get started.
        </Text>

        {/* User Guide Button */}
        <Button
          mode="contained"
          icon="book-open-variant"
          onPress={handleOpenGuide}
          style={{ marginBottom: 24, alignSelf: "center", borderRadius: 10 }}
          contentStyle={{ paddingVertical: 4 }}
        >
          Open User Guide
        </Button>

        <Divider style={{ marginVertical: 10 }} />

        {/* FAQ Section */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 12,
            marginTop: 8,
          }}
        >
          Frequently Asked Questions
        </Text>

        {faqData.map((faq, index) => (
          <List.Accordion
            key={index}
            title={faq.question}
            expanded={expanded === faq.question}
            onPress={() => handlePress(faq.question)}
            style={{
              backgroundColor: "#f9f9f9",
              marginBottom: 8,
              borderRadius: 10,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#ddd",
            }}
            titleStyle={{ fontSize: 16, fontWeight: "500" }}
          >
            <View style={{ padding: 12, backgroundColor: "#fff" }}>
              <Text style={{ fontSize: 15, lineHeight: 20 }}>{faq.answer}</Text>
            </View>
          </List.Accordion>
        ))}
      </ScrollView>
    </View>
  );
};

export default HelpScreen;
