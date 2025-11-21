import { Stack } from 'expo-router'
import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function StackLayout() {
    const { colors } = useTheme()

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="settings" />
            <Stack.Screen name="change-password" />
        </Stack>
    )
}
