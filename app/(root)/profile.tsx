import { useAuth, useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'

export default function ProfileScreen() {
    const { signOut } = useAuth()
    const { user } = useUser()
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogout = async () => {
        setShowLogoutModal(false)
        await signOut()
    }

    const getInitials = () => {
        const email = user?.emailAddresses[0].emailAddress || ''
        return email.charAt(0).toUpperCase()
    }

    const menuOptions = [
        {
            id: 'edit-profile',
            title: 'Edit Profile',
            subtitle: 'Update your name and avatar',
            icon: 'person-outline',
            onPress: () => Alert.alert('Coming Soon', 'Edit profile feature will be available soon'),
        },
        {
            id: 'change-password',
            title: 'Change Password',
            subtitle: 'Update your account password',
            icon: 'lock-closed-outline',
            onPress: () => router.push('/(stack)/change-password' as any),
        },
        {
            id: 'settings',
            title: 'Settings',
            subtitle: 'App preferences and configuration',
            icon: 'settings-outline',
            onPress: () => router.push('/(stack)/settings' as any),
        },
    ]

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
                </View>

                {/* Avatar Section */}
                <View style={[styles.avatarSection, { backgroundColor: colors.card }]}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.avatarText, { color: colors.background }]}>{getInitials()}</Text>
                    </View>
                    <Text style={[styles.displayName, { color: colors.text }]}>{user?.firstName || 'User'}</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.emailAddresses[0].emailAddress}</Text>
                </View>

                {/* Options List */}
                <View style={[styles.optionsContainer, { backgroundColor: colors.card }]}>
                    {menuOptions.map((option) => (
                        <Pressable
                            key={option.id}
                            style={({ pressed }) => [
                                styles.optionItem,
                                { borderBottomColor: colors.border },
                                pressed && { backgroundColor: colors.background }
                            ]}
                            onPress={option.onPress}
                        >
                            <View style={[styles.optionIconContainer, { backgroundColor: colors.iconBackground }]}>
                                <Ionicons name={option.icon as any} size={24} color={colors.text} />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                                <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </Pressable>
                    ))}
                </View>

                {/* Logout Button */}
                <Pressable
                    style={({ pressed }) => [styles.logoutButton, { backgroundColor: colors.danger }, pressed && styles.logoutButtonPressed]}
                    onPress={() => setShowLogoutModal(true)}
                >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </ScrollView>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={showLogoutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalIconContainer, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="log-out-outline" size={48} color={colors.danger} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Logout</Text>
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>Are you sure you want to logout?</Text>

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    { backgroundColor: colors.iconBackground },
                                    pressed && styles.buttonPressed
                                ]}
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    { backgroundColor: colors.danger },
                                    pressed && styles.buttonPressed
                                ]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.confirmButtonText}>Logout</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 32,
        fontFamily: 'CinzelBlack',
    },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        fontFamily: 'CinzelBlack',
    },
    displayName: {
        fontSize: 24,
        fontFamily: 'CinzelBlack',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        fontFamily: 'CinzelBlack',
    },

    // Options List
    optionsContainer: {
        marginHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    optionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontFamily: 'CinzelBlack',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 12,
        fontFamily: 'CinzelBlack',
    },

    // Logout Button
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'CinzelBlack',
        marginLeft: 8,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'CinzelBlack',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: 'CinzelBlack',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: 'CinzelBlack',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'CinzelBlack',
    },
})
