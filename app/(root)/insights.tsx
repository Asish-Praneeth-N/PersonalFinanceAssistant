import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'

export default function InsightsScreen() {
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={styles.content}>
                <Text style={[styles.text, { color: colors.text }]}>Insights Screen</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 24, fontFamily: 'CinzelBlack' },
})
