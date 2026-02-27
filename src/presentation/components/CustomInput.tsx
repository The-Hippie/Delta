import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  onChangeText: (text: string) => void;
  value: string;
}

export const CustomInput = ({ label, placeholder, secureTextEntry, onChangeText, value }: Props) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      secureTextEntry={secureTextEntry}
      onChangeText={onChangeText}
      value={value}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { color: "#94A3B8", fontSize: 14, marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    fontSize: 16,
  }
});