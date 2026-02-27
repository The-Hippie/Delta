import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Completa todos los campos");
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Al tener éxito, AppNavigator cambiará automáticamente a Home
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error de Acceso", "Credenciales inválidas o sin permisos de red.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DELTA <Text style={{color: '#FFF'}}>MASTER</Text></Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Admin Email"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#020617" /> : <Text style={styles.buttonText}>INICIAR PANEL</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', padding: 25 },
  logo: { color: '#10B981', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 50 },
  inputContainer: { marginBottom: 20 },
  input: { 
    backgroundColor: '#0F172A', 
    color: '#FFF', 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#1E293B' 
  },
  button: { 
    backgroundColor: '#10B981', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  buttonText: { color: '#020617', fontWeight: 'bold', fontSize: 16 }
});