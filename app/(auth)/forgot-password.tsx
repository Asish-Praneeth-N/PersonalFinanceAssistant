import { useSignIn } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'

export default function ForgotPasswordScreen() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [successfulCreation, setSuccessfulCreation] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [countdown, setCountdown] = useState(3)

    // Animation values
    const scaleValue = useRef(new Animated.Value(0)).current
    const opacityValue = useRef(new Animated.Value(0)).current

    // Request a password reset code by email
    const onRequestReset = async () => {
        if (!isLoaded) return

        if (!emailAddress) {
            Alert.alert('Error', 'Please enter your email address')
            return
        }

        setLoading(true)
        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: emailAddress,
            })
            setSuccessfulCreation(true)
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].message)
        } finally {
            setLoading(false)
        }
    }

    // Reset the password with the code and the new password
    const onReset = async () => {
        if (!isLoaded) return

        if (!code || !password) {
            Alert.alert('Error', 'Please enter the code and a new password')
            return
        }

        setLoading(true)
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            })

            if (result.status === 'complete') {
                // Do not set active session, just show success modal
                setShowSuccessModal(true)
            } else {
                console.log(result)
                Alert.alert('Error', 'Failed to reset password. Please try again.')
            }
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].message)
        } finally {
            setLoading(false)
        }
    }

    // Handle Success Modal Animation and Timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>

        if (showSuccessModal) {
            // Start Animation
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 10,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start()

            // Start Countdown
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [showSuccessModal])

    // Handle Navigation when countdown hits 0
    useEffect(() => {
        if (showSuccessModal && countdown === 0) {
            handleSuccessNavigation()
        }
    }, [countdown, showSuccessModal])

    const handleSuccessNavigation = () => {
        setShowSuccessModal(false)
        router.replace('/sign-in')
    }

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        {successfulCreation ? 'Enter the code sent to your email' : 'Enter your email to reset password'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {!successfulCreation ? (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    value={emailAddress}
                                    placeholder="Enter email"
                                    onChangeText={setEmailAddress}
                                    style={styles.input}
                                />
                            </View>

                            <Pressable onPress={onRequestReset} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Reset Code</Text>
                                <TextInput
                                    value={code}
                                    placeholder="Enter code"
                                    onChangeText={setCode}
                                    style={styles.input}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <TextInput
                                    value={password}
                                    placeholder="Enter new password"
                                    secureTextEntry={true}
                                    onChangeText={setPassword}
                                    style={styles.input}
                                />
                            </View>

                            <Pressable onPress={onReset} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                            </Pressable>
                        </>
                    )}

                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Back to Sign In</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue }}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="checkmark" size={50} color="#fff" />
                            </View>
                        </Animated.View>

                        <Text style={styles.modalTitle}>Password Reset Successful!</Text>
                        <Text style={styles.modalText}>Password successfully reset. Please login again to access your account.</Text>
                        <Text style={styles.modalText}>Redirecting in {countdown} seconds...</Text>

                        <Pressable onPress={handleSuccessNavigation} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, padding: 24, justifyContent: 'center' },
    header: { marginBottom: 32, alignItems: 'center' },
    title: { fontSize: 28, fontFamily: 'CinzelBlack', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', fontFamily: 'CinzelBlack', textAlign: 'center' },
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
    backButton: { marginTop: 20, alignItems: 'center' },
    backButtonText: { color: '#000', fontFamily: 'CinzelBlack', textDecorationLine: 'underline' },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'CinzelBlack',
        textAlign: 'center',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'CinzelBlack',
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'CinzelBlack',
    },
})
