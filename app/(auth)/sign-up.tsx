import { useOAuth, useSignUp } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser'
import { useTheme } from '../context/ThemeContext'

export default function SignUpScreen() {
    useWarmUpBrowser()
    const { isLoaded, signUp, setActive } = useSignUp()
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const onSignUpPress = async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress,
                password,
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setPendingVerification(true)
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
            Alert.alert('Error', err.errors?.[0]?.message || 'Sign up failed')
        } finally {
            setLoading(false)
        }
    }

    const onPressVerify = async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId })
                router.replace('/(root)/home')
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2))
                Alert.alert('Error', 'Verification failed. Please try again.')
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
            Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    const onGoogleSignUpPress = async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow()
            if (createdSessionId) {
                await setActive!({ session: createdSessionId })
                router.replace('/(root)/home')
            } else {
                Alert.alert('Error', 'Google Sign-Up failed. Please try again.')
            }
        } catch (err: any) {
            console.error('OAuth error', err)
            Alert.alert('Error', err.errors?.[0]?.message || 'An error occurred during Google Sign-Up')
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={[styles.appName, { color: colors.text }]}>Personal Finance Assistant</Text>
                    <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start your journey to financial freedom</Text>
                </View>

                {!pendingVerification ? (
                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={firstName}
                                        placeholder="First Name"
                                        placeholderTextColor={colors.textSecondary}
                                        onChangeText={setFirstName}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={lastName}
                                        placeholder="Last Name"
                                        placeholderTextColor={colors.textSecondary}
                                        onChangeText={setLastName}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    autoCapitalize="none"
                                    value={emailAddress}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.textSecondary}
                                    onChangeText={setEmailAddress}
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={password}
                                    placeholder="Create a password"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={!showPassword}
                                    onChangeText={setPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                                </Pressable>
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: colors.primary },
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={onSignUpPress}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={[styles.buttonText, { color: colors.background }]}>Sign Up</Text>
                            )}
                        </Pressable>

                        <View style={styles.dividerContainer}>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.googleButton,
                                { borderColor: colors.border, backgroundColor: colors.card },
                                pressed && { backgroundColor: colors.background },
                            ]}
                            onPress={onGoogleSignUpPress}
                        >
                            <Ionicons name="logo-google" size={20} color={colors.text} />
                            <Text style={[styles.googleButtonText, { color: colors.text }]}>Sign up with Google</Text>
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account?</Text>
                            <Link href="/(auth)/sign-in" asChild>
                                <Pressable>
                                    <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
                            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={code}
                                    placeholder="Enter verification code"
                                    placeholderTextColor={colors.textSecondary}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: colors.primary },
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={onPressVerify}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={[styles.buttonText, { color: colors.background }]}>Verify Email</Text>
                            )}
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        marginBottom: 16,
    },
    appName: {
        fontSize: 20,
        fontFamily: 'CinzelBlack',
        marginBottom: 8,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: 'CinzelBlack',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'CinzelBlack',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontFamily: 'CinzelBlack',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'CinzelBlack',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontFamily: 'CinzelBlack',
    },
    googleButton: {
        flexDirection: 'row',
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    googleButtonText: {
        fontSize: 16,
        fontFamily: 'CinzelBlack',
        marginLeft: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        marginRight: 4,
        fontFamily: 'CinzelBlack',
    },
    linkText: {
        fontSize: 14,
        fontFamily: 'CinzelBlack',
    },
})
