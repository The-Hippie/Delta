import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { BuildingProvider } from './src/core/store/BuildingContext';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <BuildingProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </BuildingProvider>
  );
}