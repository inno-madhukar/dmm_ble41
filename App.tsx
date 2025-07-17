import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, Text } from 'react-native-paper';
import BottomTabs from './src/navigation/BottomTabs';
import { lightTheme } from './theme';

const App = () => {
  return (
    <PaperProvider theme={lightTheme}>
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
