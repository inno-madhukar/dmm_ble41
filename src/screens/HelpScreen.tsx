import React, { useState } from "react";
import { View, Alert, Platform, ScrollView } from "react-native";
import { Text, Button, List, Divider, IconButton } from "react-native-paper";
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

// The Helpscreen Contains User Guide and FAQs
const HelpScreen = () => {
  //state variable to set expand
  const [expanded, setExpanded] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en"); // 👈 language state

  // this button handles on press expand and shrink of answer element
  const handlePress = (question: string) => {
    setExpanded(expanded === question ? null : question);
  };
  // this function use to open user guide in pdf view
  const handleOpenGuide = async () => {
    try {
      if (Platform.OS === "android") {
        let destPath = '';
        if (RNFS) {
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
  //the FAQ array of objects with question and answer keys and values.
  const faqData = [
    {
      question: " How do I connect to my DMM-B18 device?",
      answer:
        "1. Go to the Home tab.\n" +
        "2. Tap Scan Device.\n" +
        "3. Select your device from the list.\n\n" +
        "💡 Tip: If the device was previously saved, it will connect automatically.",
    },
    {
      question: "🔍 What should I do if I can't find my DMM-B18?",
      answer:
        "🔁 Restart the app and follow the steps in **\" How do I connect to my DMM-B18 device?\"** again.\n" +
        "Make sure Bluetooth is turned on and the device is powered.",
    },
    {
      question: "📂 How do I find my saved data?",
      answer:
        "You can access your saved data in your device storage:\n\n" +
        "System Storage → Download → Innovative_instruments → Data",
    },
    {
      question: "📤 How do I share my saved data?",
      answer:
        "You can share data as PDF or CSV files:\n" +
        "1. Go to the Records tab.\n" +
        "2. Tap the 📁 Select File button and choose the file you want to share.\n" +
        "3. Tap the 📤 Share icon to share the data via email or other apps.",
    },
    {
      question: "💾 What data can I save?",
      answer:
        "You can save data for each client separately. Each record includes:\n" +
        "📅 Date | ⏰ Time | ⚖️ Weight | 🌡️ Temperature | 💧 Humidity | 👤 Client details.",
    },
  ];

  const faqDataHi = [
  {
    question: "📶 मैं अपने DMM-B18 डिवाइस से कैसे कनेक्ट करूँ?",
    answer:
      "1. होम टैब पर जाएं।\n" +
      "2. स्कैन डिवाइस पर टैप करें।\n" +
      "3. सूची में से अपना डिवाइस चुनें।\n\n" +
      "💡 टिप: अगर डिवाइस पहले से सेव है, तो वह अपने-आप कनेक्ट हो जाएगा।",
  },
  {
    question: "🔍 अगर मेरा DMM-B18 नहीं मिल रहा है तो क्या करें?",
    answer:
      "🔁 ऐप को दोबारा शुरू करें और फिर से \"मैं अपने DMM-B18 डिवाइस से कैसे कनेक्ट करूँ?\" वाले स्टेप्स फॉलो करें।\n" +
      "सुनिश्चित करें कि ब्लूटूथ ऑन है और डिवाइस चालू है।",
  },
  {
    question: "📂 मैं अपना सेव किया हुआ डेटा कहाँ पा सकता हूँ?",
    answer:
      "आप अपना डेटा यहाँ पा सकते हैं:\n\n" +
      "System Storage → Download → Innovative_instruments → Data",
  },
  {
    question: "📤 मैं अपना सेव किया हुआ डेटा कैसे शेयर करूँ?",
    answer:
      "आप अपना डेटा PDF या CSV फाइल के रूप में शेयर कर सकते हैं:\n" +
      "1. रिकॉर्ड्स टैब पर जाएं।\n" +
      "2. 📁 फाइल चुनें बटन पर टैप करें और फाइल चुनें।\n" +
      "3. 📤 शेयर आइकन पर टैप करें और ईमेल या अन्य ऐप से शेयर करें।",
  },
  {
    question: "💾 मैं कौन-सा डेटा सेव कर सकता हूँ?",
    answer:
      "आप हर क्लाइंट के लिए अलग-अलग डेटा सेव कर सकते हैं। हर रिकॉर्ड में शामिल होगा:\n" +
      "📅 तारीख | ⏰ समय | ⚖️ वजन | 🌡️ तापमान | 💧 नमी | 👤 क्लाइंट की जानकारी।",
  },
];

  const currentFaq = language === "en" ? faqData : faqDataHi; // 👈 pick based on language

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: "bold" }}>
            Frequently Asked Questions
          </Text>

          {/* 👇 Language Toggle Button */}
          <Button
            mode="outlined"
            onPress={() => setLanguage(language === "en" ? "hi" : "en")}
          >
            {language === "en" ? "हिंदी" : "English"}
          </Button>
        </View>

        {/* map over currentFaq and show FAQ. */}
        {currentFaq.map((faq, index) => (
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
