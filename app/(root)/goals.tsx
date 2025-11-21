import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { db } from '../config/firebase'
import { useTheme } from '../context/ThemeContext'

interface Goal {
    id: string
    title: string
    targetAmount: number
    currentAmount: number
    userId: string
    createdAt: any
}

export default function GoalsScreen() {
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()
    const { user } = useUser()

    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [newGoalTitle, setNewGoalTitle] = useState('')
    const [newGoalAmount, setNewGoalAmount] = useState('')
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (!user) return

        const q = query(collection(db, 'goals'), where('userId', '==', user.id))
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            const goalsList: Goal[] = []
            snapshot.forEach((doc: any) => {
                goalsList.push({ id: doc.id, ...doc.data() } as Goal)
            })
            setGoals(goalsList)
            setLoading(false)
        }, (error: any) => {
            console.error("Error fetching goals: ", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    const handleAddGoal = async () => {
        if (!newGoalTitle || !newGoalAmount) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        setAdding(true)
        try {
            await addDoc(collection(db, 'goals'), {
                title: newGoalTitle,
                targetAmount: parseFloat(newGoalAmount),
                currentAmount: 0,
                userId: user?.id,
                createdAt: new Date(),
            })
            setModalVisible(false)
            setNewGoalTitle('')
            setNewGoalAmount('')
        } catch (error) {
            console.error("Error adding goal: ", error)
            Alert.alert('Error', 'Failed to add goal')
        } finally {
            setAdding(false)
        }
    }

    const handleDeleteGoal = async (id: string) => {
        Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'goals', id))
                    } catch (error) {
                        console.error("Error deleting goal: ", error)
                        Alert.alert('Error', 'Failed to delete goal')
                    }
                },
            },
        ])
    }

    const renderGoalItem = ({ item }: { item: Goal }) => (
        <View style={[styles.goalCard, { backgroundColor: colors.card }]}>
            <View style={styles.goalHeader}>
                <Text style={[styles.goalTitle, { color: colors.text }]}>{item.title}</Text>
                <Pressable onPress={() => handleDeleteGoal(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
            </View>
            <Text style={[styles.goalAmount, { color: colors.textSecondary }]}>
                Target: ${item.targetAmount.toLocaleString()}
            </Text>
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            backgroundColor: colors.primary,
                            width: `${Math.min((item.currentAmount / item.targetAmount) * 100, 100)}%`,
                        },
                    ]}
                />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                ${item.currentAmount.toLocaleString()} saved
            </Text>
        </View>
    )

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>My Goals</Text>
                <Pressable
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color={colors.background} />
                </Pressable>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={goals}
                    renderItem={renderGoalItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No goals yet. Add one to get started!
                            </Text>
                        </View>
                    }
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Goal</Text>

                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                            placeholder="Goal Title (e.g., New Car)"
                            placeholderTextColor={colors.textSecondary}
                            value={newGoalTitle}
                            onChangeText={setNewGoalTitle}
                        />

                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                            placeholder="Target Amount"
                            placeholderTextColor={colors.textSecondary}
                            value={newGoalAmount}
                            onChangeText={setNewGoalAmount}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={handleAddGoal}
                                disabled={adding}
                            >
                                {adding ? (
                                    <ActivityIndicator color={colors.background} />
                                ) : (
                                    <Text style={[styles.buttonText, { color: colors.background }]}>Add Goal</Text>
                                )}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: 'CinzelBlack',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loader: {
        marginTop: 40,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    goalCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalTitle: {
        fontSize: 18,
        fontFamily: 'CinzelBlack',
    },
    goalAmount: {
        fontSize: 14,
        marginBottom: 12,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        textAlign: 'right',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'CinzelBlack',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'CinzelBlack',
    },
})
