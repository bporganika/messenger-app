import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './design-system';
import { RootNavigator } from './navigation/RootNavigator';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
