import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Href, Redirect, Tabs } from 'expo-router'

export default function RootLayout() {
    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
        return <Redirect href={'/(auth)/sign-in' as Href} />
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#888',
                tabBarLabelStyle: { fontFamily: 'CinzelBlack', fontSize: 10 },
                tabBarStyle: { borderTopWidth: 1, borderTopColor: '#eee', height: 60, paddingBottom: 8, paddingTop: 8 },
            }}
        >
            <Tabs.Screen
                name="expenses"
                options={{
                    title: 'Expenses',
                    tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="goals"
                options={{
                    title: 'Goals',
                    tabBarIcon: ({ color, size }) => <Ionicons name="trophy" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={32} color={color} />,
                    tabBarLabelStyle: { fontFamily: 'CinzelBlack', fontSize: 12, fontWeight: 'bold' },
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    title: 'Insights',
                    tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    )
}
