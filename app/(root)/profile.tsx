import { useAuth, useUser } from '@clerk/clerk-expo'
import React from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

export default function ProfileScreen() {
    const { signOut } = useAuth()
    const { user } = useUser()

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <Text style={styles.subtitle}>{user?.emailAddresses[0].emailAddress}</Text>
                </View>

                <Pressable onPress={() => signOut()} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 24, justifyContent: 'space-between' },
    header: { marginTop: 24, alignItems: 'center' },
    title: { fontSize: 32, fontFamily: 'CinzelBlack', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', fontFamily: 'CinzelBlack' },
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonPressed: { opacity: 0.8 },
    buttonText: { color: '#fff', fontSize: 16, fontFamily: 'CinzelBlack' },
})
