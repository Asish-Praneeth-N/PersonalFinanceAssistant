import { useUser } from '@clerk/clerk-expo'
import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
    const { user } = useUser()

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Home</Text>
                    <Text style={styles.subtitle}>Welcome, {user?.emailAddresses[0].emailAddress}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.text}>Dashboard Overview</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 24 },
    header: { marginTop: 24 },
    title: { fontSize: 32, fontFamily: 'CinzelBlack', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', fontFamily: 'CinzelBlack' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 18, fontFamily: 'CinzelBlack', textAlign: 'center' },
})
