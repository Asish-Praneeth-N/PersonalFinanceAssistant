
import { useAuth } from '@clerk/clerk-expo'
import { Href, Redirect, Stack } from 'expo-router'

export default function AuthLayout() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return <Redirect href={'/dashboard' as Href} />
    }

    return (
        <Stack>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        </Stack>
    )
}
