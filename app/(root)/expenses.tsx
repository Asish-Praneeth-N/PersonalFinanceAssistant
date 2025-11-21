import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

export default function ExpensesScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Expenses</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontFamily: 'CinzelBlack' },
})
