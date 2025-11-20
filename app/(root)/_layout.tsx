import { useAuth } from '@clerk/clerk-expo'
import { Href, Redirect, Stack } from 'expo-router'

export default function RootLayout() {
    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
        return <Redirect href={'/sign-in' as Href} />
    }

    return (
        <Stack>
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        </Stack>
    )
}
