import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'

type ToggleSetting = {
    id: string
    label: string
    icon: string
    type: 'toggle'
    value: boolean
    onValueChange: (value: boolean) => void
}

type NavigateSetting = {
    id: string
    label: string
    icon: string
    type: 'navigate'
    onPress: () => void
}

type InfoSetting = {
    id: string
    label: string
    icon: string
    type: 'info'
    value: string
}

type SettingItem = ToggleSetting | NavigateSetting | InfoSetting

type SettingSection = {
    title: string
    items: SettingItem[]
}

export default function SettingsScreen() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { theme, colors, toggleTheme } = useTheme()
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    const settingsSections: SettingSection[] = [
        {
            title: 'Appearance',
            items: [
                {
                    id: 'theme',
                    label: 'Dark Mode',
                    icon: 'moon-outline',
                    type: 'toggle',
                    value: theme === 'dark',
                    onValueChange: toggleTheme,
                },
            ],
        },
        {
            title: 'Notifications',
            items: [
                {
                    id: 'notifications',
                    label: 'Enable Notifications',
                    icon: 'notifications-outline',
                    type: 'toggle',
                    value: notificationsEnabled,
                    onValueChange: setNotificationsEnabled,
                },
                {
                    id: 'notification-settings',
                    label: 'Notification Settings',
                    icon: 'settings-outline',
                    type: 'navigate',
                    onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
                },
            ],
        },
        {
            title: 'About',
            items: [
                {
                    id: 'version',
                    label: 'Version',
                    icon: 'information-circle-outline',
                    type: 'info',
                    value: '1.0.0',
                },
                {
                    id: 'terms',
                    label: 'Terms of Service',
                    icon: 'document-text-outline',
                    type: 'navigate',
                    onPress: () => Alert.alert('Terms of Service', 'Terms of service content will be displayed here'),
                },
                {
                    id: 'privacy',
                    label: 'Privacy Policy',
                    icon: 'shield-outline',
                    type: 'navigate',
                    onPress: () => Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here'),
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    id: 'help',
                    label: 'Help Center',
                    icon: 'help-circle-outline',
                    type: 'navigate',
                    onPress: () => Alert.alert('Help Center', 'Help center will be available soon'),
                },
                {
                    id: 'contact',
                    label: 'Contact Support',
                    icon: 'mail-outline',
                    type: 'navigate',
                    onPress: () => Alert.alert('Contact Support', 'Email: support@personalfinance.app'),
                },
                {
                    id: 'feedback',
                    label: 'Send Feedback',
                    icon: 'chatbubble-outline',
                    type: 'navigate',
                    onPress: () => Alert.alert('Send Feedback', 'Feedback form will be available soon'),
                },
            ],
        },
    ]

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            {/* Header with Back Button */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Pressable
                    style={[styles.backButton, { backgroundColor: colors.card }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {settingsSections.map((section, sectionIndex) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
                        <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
                            {section.items.map((item, index) => (
                                <View key={item.id}>
                                    {item.type === 'toggle' ? (
                                        <View style={styles.settingItem}>
                                            <View style={[styles.settingIconContainer, { backgroundColor: colors.iconBackground }]}>
                                                <Ionicons name={item.icon as any} size={22} color={colors.text} />
                                            </View>
                                            <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                                            <Switch
                                                value={item.value as boolean}
                                                onValueChange={item.onValueChange}
                                                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                                                thumbColor={item.value ? '#22C55E' : '#fff'}
                                            />
                                        </View>
                                    ) : item.type === 'info' ? (
                                        <View style={styles.settingItem}>
                                            <View style={[styles.settingIconContainer, { backgroundColor: colors.iconBackground }]}>
                                                <Ionicons name={item.icon as any} size={22} color={colors.text} />
                                            </View>
                                            <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                                            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{item.value}</Text>
                                        </View>
                                    ) : (
                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.settingItem,
                                                pressed && { backgroundColor: colors.background },
                                            ]}
                                            onPress={item.onPress}
                                        >
                                            <View style={[styles.settingIconContainer, { backgroundColor: colors.iconBackground }]}>
                                                <Ionicons name={item.icon as any} size={22} color={colors.text} />
                                            </View>
                                            <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                        </Pressable>
                                    )}
                                    {index < section.items.length - 1 && (
                                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: colors.text }]}>Personal Finance Assistant</Text>
                    <Text style={[styles.appCopyright, { color: colors.textSecondary }]}>© 2025 All rights reserved</Text>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontFamily: 'CinzelBlack',
    },
    scrollView: {
        flex: 1,
    },

    // Section Styles
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'CinzelBlack',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    sectionContent: {
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    // Setting Item Styles
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'CinzelBlack',
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'CinzelBlack',
    },
    divider: {
        height: 1,
        marginLeft: 64,
    },

    // App Info
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    appName: {
        fontSize: 16,
        fontFamily: 'CinzelBlack',
        marginBottom: 4,
    },
    appCopyright: {
        fontSize: 12,
        fontFamily: 'CinzelBlack',
    },
})
