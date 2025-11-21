import { useOAuth, useSignIn } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser'
import { useTheme } from '../context/ThemeContext'


export default function SignInScreen() {
    useWarmUpBrowser()
    const { signIn, setActive, isLoaded } = useSignIn()
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const onSignInPress = useCallback(async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/(root)/home')
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
                Alert.alert('Error', 'Log in failed. Please try again.')
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
            Alert.alert('Error', err.errors?.[0]?.message || 'Log in failed')
        } finally {
            setLoading(false)
        }
    }, [isLoaded, emailAddress, password])

    const onGoogleSignInPress = useCallback(async () => {
        Alert.alert('Coming Soon', 'Google Sign-In is currently being configured.')
    }, [])

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop' }}
                        style={styles.logo}
                    />
                    <Text style={[styles.appName, { color: colors.text }]}>Personal Finance Assistant</Text>
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue your financial journey</Text>
                </View>

                <View style={styles.form}>
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
                                placeholder="Enter your password"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry={!showPassword}
                                onChangeText={setPassword}
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                    </View>

                    <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotPassword}>
                        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            { backgroundColor: colors.primary },
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onSignInPress}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <Text style={[styles.buttonText, { color: colors.background }]}>Sign In</Text>
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
                        onPress={onGoogleSignInPress}
                    >
                        <Ionicons name="logo-google" size={20} color={colors.text} />
                        <Text style={[styles.googleButtonText, { color: colors.text }]}>Continue with Google</Text>
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account?</Text>
                        <Link href="/(auth)/sign-up" asChild>
                            <Pressable>
                                <Text style={[styles.linkText, { color: colors.primary }]}>Sign Up</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
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
        fontFamily: 'CinzelBlack',
        height: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontFamily: 'CinzelBlack',
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
