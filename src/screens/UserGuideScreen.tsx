// screens/UserGuideScreen.tsx
import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import Pdf from "react-native-pdf";

const UserGuideScreen = () => {
  return (
    <Pdf
      source={require("../assets/help.pdf")} // 👈 directly load from assets
      style={styles.pdf}
    />
  );
};

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default UserGuideScreen;
