import { useUser } from '@clerk/clerk-expo'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'

export default function HomeScreen() {
    const { user } = useUser()
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Home</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome, {user?.emailAddresses[0].emailAddress}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.text, { color: colors.text }]}>Dashboard Overview</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, padding: 24 },
    header: { marginTop: 24 },
    title: { fontSize: 32, fontFamily: 'CinzelBlack', marginBottom: 8 },
    subtitle: { fontSize: 16, fontFamily: 'CinzelBlack' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 18, fontFamily: 'CinzelBlack', textAlign: 'center' },
})
