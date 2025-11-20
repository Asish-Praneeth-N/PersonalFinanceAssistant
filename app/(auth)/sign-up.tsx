import { useOAuth, useSignUp } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Href, Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser'

export default function SignUpScreen() {
    useWarmUpBrowser()
    const { isLoaded, signUp, setActive } = useSignUp()
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    const onSignUpPress = async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            await signUp.create({
                emailAddress,
                password,
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            setPendingVerification(true)
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].message)
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

            await setActive({ session: completeSignUp.createdSessionId })
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].message)
        } finally {
            setLoading(false)
        }
    }

    const onGoogleSignUpPress = async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/dashboard', { scheme: 'personalfinanceassistan' }),
            })

            if (createdSessionId) {
                setActive!({ session: createdSessionId })
            }
        } catch (err) {
            console.error('OAuth error', err)
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
                </View>

                <View style={styles.form}>
                    {!pendingVerification && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    value={emailAddress}
                                    placeholder="Enter email"
                                    onChangeText={(email) => setEmailAddress(email)}
                                    style={styles.input}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    value={password}
                                    placeholder="Enter password"
                                    secureTextEntry={true}
                                    onChangeText={(password) => setPassword(password)}
                                    style={styles.input}
                                />
                            </View>

                            <Pressable onPress={onSignUpPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                            </Pressable>

                            <View style={styles.divider}>
                                <View style={styles.line} />
                                <Text style={styles.orText}>OR</Text>
                                <View style={styles.line} />
                            </View>

                            <Pressable onPress={onGoogleSignUpPress} style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}>
                                <Text style={styles.googleButtonText}>Sign up with Google</Text>
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account?</Text>
                                <Link href={"/sign-in" as Href} asChild>
                                    <Pressable>
                                        <Text style={styles.link}>Sign In</Text>
                                    </Pressable>
                                </Link>
                            </View>
                        </>
                    )}

                    {pendingVerification && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Verification Code</Text>
                                <TextInput
                                    value={code}
                                    placeholder="Enter verification code"
                                    onChangeText={(code) => setCode(code)}
                                    style={styles.input}
                                />
                            </View>

                            <Pressable onPress={onPressVerify} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Email</Text>}
                            </Pressable>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 24, justifyContent: 'center' },
    header: { marginBottom: 32, alignItems: 'center' },
    title: { fontSize: 32, fontFamily: 'CinzelBlack', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', fontFamily: 'CinzelBlack' },
    form: { width: '100%' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, marginBottom: 8, fontFamily: 'CinzelBlack', color: '#333' },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonPressed: { opacity: 0.8 },
    buttonText: { color: '#fff', fontSize: 16, fontFamily: 'CinzelBlack' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    line: { flex: 1, height: 1, backgroundColor: '#eee' },
    orText: { marginHorizontal: 16, color: '#999', fontFamily: 'CinzelBlack' },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    googleButtonText: { color: '#000', fontSize: 16, fontFamily: 'CinzelBlack' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, alignItems: 'center' },
    footerText: { color: '#666', marginRight: 8, fontFamily: 'CinzelBlack' },
    link: { color: '#000', fontFamily: 'CinzelBlack', textDecorationLine: 'underline' },
})
