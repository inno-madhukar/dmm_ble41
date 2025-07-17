// theme.js
import { DefaultTheme } from 'react-native-paper';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#EF7F1A',      // Your orange
    accent: '#f3a847',       // Lighter orange
    background: '#ffffff',   // App background
    surface: '#f9f9f9',      // Card/panel background
    text: '#222222',         // Body text
    disabled: '#bdbdbd',
    placeholder: '#727271',  // Custom grey
    onSurface: '#727271',    // Subtext/muted
    border: '#e0e0e0',       // Optional
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
  },
};