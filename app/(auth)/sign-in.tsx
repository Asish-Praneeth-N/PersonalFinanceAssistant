import { useOAuth, useSignIn } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Href, Link, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser'

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
    useWarmUpBrowser()
    const { signIn, setActive, isLoaded } = useSignIn()
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const onSignInPress = useCallback(async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            })

            // This is an important step that shows the user is logged in
            await setActive({ session: completeSignIn.createdSessionId })
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].message)
        } finally {
            setLoading(false)
        }
    }, [isLoaded, emailAddress, password])

    const onGoogleSignInPress = useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/dashboard', { scheme: 'personalfinanceassistan' }),
            })

            if (createdSessionId) {
                setActive!({ session: createdSessionId })
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error('OAuth error', err)
        }
    }, [])

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <View style={styles.form}>
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

                    <View style={{ alignItems: 'flex-end', marginBottom: 20 }}>
                        <Link href={"/forgot-password" as Href} asChild>
                            <Pressable>
                                <Text style={{ color: '#666', fontFamily: 'CinzelBlack', fontSize: 14 }}>Forgot Password?</Text>
                            </Pressable>
                        </Link>
                    </View>

                    <Pressable onPress={onSignInPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                    </Pressable>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    <Pressable onPress={onGoogleSignInPress} style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}>
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <Link href={"/sign-up" as Href} asChild>
                            <Pressable>
                                <Text style={styles.link}>Sign Up</Text>
                            </Pressable>
                        </Link>
                    </View>
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
