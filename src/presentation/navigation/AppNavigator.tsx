import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; 

// Pantallas
import LoginScreen from '../screens/auth/LoginScreen'; // Asegúrate de crear este archivo
import HomeScreen from '../screens/main/HomeScreen';
import BuildingDetailScreen from '../screens/main/BuildingDetailScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Suscribirse al estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return unsubscribe;
  }, []);

  // Pantalla de carga mientras Firebase verifica si hay sesión activa
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // --- RUTAS PROTEGIDAS (Solo si está logueado) ---
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="BuildingDetail" component={BuildingDetailScreen} />
        </>
      ) : (
        // --- RUTAS DE AUTENTICACIÓN ---
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};