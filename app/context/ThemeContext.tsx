import * as SecureStore from 'expo-secure-store'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

type Theme = 'light' | 'dark'

type ThemeColors = {
    background: string
    card: string
    text: string
    textSecondary: string
    border: string
    primary: string
    danger: string
    success: string
    iconBackground: string
}

const lightColors: ThemeColors = {
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#F0F0F0',
    primary: '#000000',
    danger: '#EF4444',
    success: '#22C55E',
    iconBackground: '#F0F0F0',
}

const darkColors: ThemeColors = {
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    primary: '#FFFFFF',
    danger: '#EF4444',
    success: '#22C55E',
    iconBackground: '#333333',
}

type ThemeContextType = {
    theme: Theme
    colors: ThemeColors
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme()
    const [theme, setThemeState] = useState<Theme>('light')

    useEffect(() => {
        loadTheme()
    }, [])

    const loadTheme = async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync('user_theme')
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setThemeState(savedTheme)
            } else {
                setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light')
            }
        } catch (error) {
            console.log('Error loading theme:', error)
        }
    }

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme)
        try {
            await SecureStore.setItemAsync('user_theme', newTheme)
        } catch (error) {
            console.log('Error saving theme:', error)
        }
    }

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    const colors = theme === 'light' ? lightColors : darkColors

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
