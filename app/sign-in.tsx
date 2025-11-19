// app/sign-in.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function SignInScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>Sign In</Text>
        <Text style={styles.subtitle}>This is a placeholder. Clerk auth will be integrated later.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fbff' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#444', textAlign: 'center' },
});
