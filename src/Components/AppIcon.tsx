import React from "react";
import { Platform } from "react-native";

// Mobile: use vector icons
let MaterialCommunityIcons: any = null;
if (Platform.OS === "ios" || Platform.OS === "android") {
  // Only load vector icons on mobile
  MaterialCommunityIcons = require("react-native-vector-icons/MaterialCommunityIcons").default;
}
// Windows: use SVG
import { SvgXml } from "react-native-svg";

const windowsIcons: Record<string, string> = {
  home: `<svg ...your home icon svg... />`,
  settings: `<svg ...your settings icon svg... />`,
  // add more icons as needed
};

type Props = {
  name: string;
  size?: number;
  color?: string;
};

export default function AppIcon({ name, size = 24, color = "black" }: Props) {
  if (Platform.OS === "windows") {
    const xml = windowsIcons[name];
    if (!xml) return null;
    return <SvgXml xml={xml} width={size} height={size} fill={color} />;
  }

  // Default (Android/iOS)
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
