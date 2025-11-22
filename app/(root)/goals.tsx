import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { db } from '../config/firebase'
import { useTheme } from '../context/ThemeContext'

interface Goal {
    id: string
    title: string
    targetAmount: number
    currentAmount: number
    userId: string
    startDate: string
    endDate: string
    notes?: string
    createdAt: any
    currency?: string
}

const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'Pound' },
    { code: 'INR', symbol: '₹', label: 'Rupee' },
    { code: 'JPY', symbol: '¥', label: 'Yen' },
    { code: 'CNY', symbol: '¥', label: 'Yuan' },
    { code: 'KRW', symbol: '₩', label: 'Won' },
    { code: 'RUB', symbol: '₽', label: 'Ruble' },
    { code: 'BRL', symbol: 'R$', label: 'Real' },
]

export default function GoalsScreen() {
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()
    const { user } = useUser()

    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)

    // Modal State
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
    const [adding, setAdding] = useState(false)

    // Form State
    const [newGoalTitle, setNewGoalTitle] = useState('')
    const [newGoalAmount, setNewGoalAmount] = useState('')
    const [newGoalNotes, setNewGoalNotes] = useState('')
    const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0])
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    const [showStartDatePicker, setShowStartDatePicker] = useState(false)
    const [showEndDatePicker, setShowEndDatePicker] = useState(false)

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

    const resetForm = () => {
        setNewGoalTitle('')
        setNewGoalAmount('')
        setNewGoalNotes('')
        setSelectedCurrency(CURRENCIES[0])
        setStartDate(new Date())
        setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        setAddModalVisible(false)
    }

    const handleAddGoal = async () => {
        if (!newGoalTitle.trim() || !newGoalAmount.trim()) {
            Alert.alert('Error', 'Please fill in the title and target amount.')
            return
        }

        const target = parseFloat(newGoalAmount)
        if (isNaN(target) || target <= 0) {
            Alert.alert('Error', 'Please enter a valid target amount greater than 0.')
            return
        }

        if (startDate > endDate) {
            Alert.alert('Error', 'Start date cannot be after end date.')
            return
        }

        setAdding(true)
        try {
            await addDoc(collection(db, 'goals'), {
                title: newGoalTitle.trim(),
                targetAmount: target,
                currentAmount: 0,
                userId: user?.id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                notes: newGoalNotes.trim(),
                currency: selectedCurrency.symbol,
                createdAt: new Date().toISOString(),
            })
            resetForm()
        } catch (error) {
            console.error("Error adding goal: ", error)
            Alert.alert('Error', 'Failed to add goal')
        } finally {
            setAdding(false)
        }
    }

    const handleDeleteGoal = async () => {
        if (!selectedGoal) return
        Alert.alert(
            "Delete Goal",
            "Are you sure you want to delete this goal?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'goals', selectedGoal.id))
                            setDetailModalVisible(false)
                            setSelectedGoal(null)
                        } catch (error) {
                            console.error("Error deleting goal: ", error)
                            Alert.alert('Error', 'Failed to delete goal')
                        }
                    }
                }
            ]
        )
    }

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false)
        if (selectedDate) {
            setStartDate(selectedDate)
        }
    }

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false)
        if (selectedDate) {
            setEndDate(selectedDate)
        }
    }

    const openGoalDetails = (goal: Goal) => {
        setSelectedGoal(goal)
        setDetailModalVisible(true)
    }

    const renderGoalItem = ({ item }: { item: Goal }) => {
        const progress = Math.min((item.currentAmount / item.targetAmount) * 100, 100)
        const isMilestoneReached = progress >= 25
        const currencySymbol = item.currency || '$'

        return (
            <Pressable
                style={[styles.goalCard, { backgroundColor: colors.card }]}
                onPress={() => openGoalDetails(item)}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={[styles.goalTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.dateRange, { color: colors.textSecondary }]}>
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </Text>
                    </View>
                    {isMilestoneReached && (
                        <View style={styles.badgeContainer}>
                            <Ionicons name="trophy" size={16} color="#FFD700" />
                        </View>
                    )}
                </View>

                <View style={styles.amountContainer}>
                    <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>Target</Text>
                    <Text style={[styles.targetAmount, { color: colors.text }]}>
                        {currencySymbol}{item.targetAmount.toLocaleString()}
                    </Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    backgroundColor: colors.primary,
                                    width: `${progress}%`
                                }
                            ]}
                        />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {currencySymbol}{item.currentAmount.toLocaleString()} saved
                        </Text>
                        <Text style={[styles.percentText, { color: colors.primary }]}>
                            {progress.toFixed(0)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={[styles.viewDetails, { color: colors.primary }]}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </View>
            </Pressable>
        )
    }

    // Circular Progress Config for Details Modal
    const size = 200
    const strokeWidth = 15
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
                <Pressable
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => setAddModalVisible(true)}
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
                            <Ionicons name="flag-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Goals Yet</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Create your first goal to start saving!
                            </Text>
                            <Pressable
                                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                                onPress={() => setAddModalVisible(true)}
                            >
                                <Text style={[styles.emptyButtonText, { color: colors.background }]}>Create Goal</Text>
                            </Pressable>
                        </View>
                    }
                />
            )}

            {/* Add Goal Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={resetForm}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>New Goal</Text>
                            <Pressable onPress={resetForm}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Goal Name</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        placeholder="e.g., New Car"
                                        placeholderTextColor={colors.textSecondary}
                                        value={newGoalTitle}
                                        onChangeText={setNewGoalTitle}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Target Amount</Text>
                                    <View style={[styles.amountInputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                        <Text style={[styles.currencyPrefix, { color: colors.text }]}>{selectedCurrency.symbol}</Text>
                                        <TextInput
                                            style={[styles.amountInput, { color: colors.text }]}
                                            placeholder="0.00"
                                            placeholderTextColor={colors.textSecondary}
                                            value={newGoalAmount}
                                            onChangeText={setNewGoalAmount}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Currency</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.currencyScroll}>
                                        {CURRENCIES.map((currency) => (
                                            <Pressable
                                                key={currency.code}
                                                style={[
                                                    styles.currencyChip,
                                                    {
                                                        borderColor: selectedCurrency.code === currency.code ? colors.primary : colors.border,
                                                        backgroundColor: selectedCurrency.code === currency.code ? colors.primary : colors.background
                                                    }
                                                ]}
                                                onPress={() => setSelectedCurrency(currency)}
                                            >
                                                <Text style={[
                                                    styles.currencyChipText,
                                                    { color: selectedCurrency.code === currency.code ? colors.background : colors.text }
                                                ]}>
                                                    {currency.symbol} {currency.code}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>Start Date</Text>
                                        <Pressable
                                            style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                                            onPress={() => setShowStartDatePicker(true)}
                                        >
                                            <Text style={{ color: colors.text }}>{startDate.toLocaleDateString()}</Text>
                                        </Pressable>
                                        {showStartDatePicker && (
                                            <DateTimePicker
                                                value={startDate}
                                                mode="date"
                                                display="default"
                                                onChange={onStartDateChange}
                                            />
                                        )}
                                    </View>

                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>End Date</Text>
                                        <Pressable
                                            style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                                            onPress={() => setShowEndDatePicker(true)}
                                        >
                                            <Text style={{ color: colors.text }}>{endDate.toLocaleDateString()}</Text>
                                        </Pressable>
                                        {showEndDatePicker && (
                                            <DateTimePicker
                                                value={endDate}
                                                mode="date"
                                                display="default"
                                                onChange={onEndDateChange}
                                                minimumDate={startDate}
                                            />
                                        )}
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (Optional)</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        placeholder="Add some details..."
                                        placeholderTextColor={colors.textSecondary}
                                        value={newGoalNotes}
                                        onChangeText={setNewGoalNotes}
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <View style={styles.modalButtons}>
                                    <Pressable
                                        style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                                        onPress={resetForm}
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
                                            <Text style={[styles.buttonText, { color: colors.background }]}>Save Goal</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </KeyboardAvoidingView>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Goal Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, height: '95%' }]}>
                        {selectedGoal && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Goal Details</Text>
                                    <Pressable onPress={() => setDetailModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                                    </Pressable>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                    <View style={styles.titleContainer}>
                                        <Text style={[styles.goalTitle, { color: colors.text, textAlign: 'center' }]}>{selectedGoal.title}</Text>
                                        <Text style={[styles.dateRange, { color: colors.textSecondary, textAlign: 'center' }]}>
                                            {new Date(selectedGoal.startDate).toLocaleDateString()} - {new Date(selectedGoal.endDate).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    {/* Circular Progress */}
                                    <View style={styles.chartContainer}>
                                        <Svg width={size} height={size}>
                                            <Circle
                                                stroke={colors.border}
                                                fill="none"
                                                cx={size / 2}
                                                cy={size / 2}
                                                r={radius}
                                                strokeWidth={strokeWidth}
                                            />
                                            <Circle
                                                stroke={colors.primary}
                                                fill="none"
                                                cx={size / 2}
                                                cy={size / 2}
                                                r={radius}
                                                strokeWidth={strokeWidth}
                                                strokeDasharray={`${circumference} ${circumference}`}
                                                strokeDashoffset={circumference - (Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100) / 100) * circumference}
                                                strokeLinecap="round"
                                                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                            />
                                        </Svg>
                                        <View style={styles.chartTextContainer}>
                                            <Text style={[styles.chartPercent, { color: colors.text }]}>
                                                {Math.min((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100, 100).toFixed(0)}%
                                            </Text>
                                            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Completed</Text>
                                        </View>
                                    </View>

                                    {/* Breakdown Cards */}
                                    <View style={styles.statsRow}>
                                        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
                                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Target</Text>
                                            <Text style={[styles.statValue, { color: colors.text }]}>
                                                {selectedGoal.currency || '$'}{selectedGoal.targetAmount.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={[styles.statCard, { backgroundColor: colors.background }]}>
                                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
                                            <Text style={[styles.statValue, { color: colors.success }]}>
                                                {selectedGoal.currency || '$'}{selectedGoal.currentAmount.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.statCard, { backgroundColor: colors.background, marginTop: 12 }]}>
                                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
                                        <Text style={[styles.statValue, { color: colors.text }]}>
                                            {selectedGoal.currency || '$'}{Math.max(selectedGoal.targetAmount - selectedGoal.currentAmount, 0).toLocaleString()}
                                        </Text>
                                    </View>

                                    {/* Notes Section */}
                                    {selectedGoal.notes && (
                                        <View style={[styles.section, { backgroundColor: colors.background }]}>
                                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
                                            <Text style={[styles.notesText, { color: colors.textSecondary }]}>{selectedGoal.notes}</Text>
                                        </View>
                                    )}

                                    {/* Actions */}
                                    <Pressable
                                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                        onPress={() => {
                                            Alert.alert('Coming Soon', 'This will link to the Add Expense screen.')
                                        }}
                                    >
                                        <Ionicons name="add-circle-outline" size={24} color={colors.background} />
                                        <Text style={[styles.actionButtonText, { color: colors.background }]}>Add Funds</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.deleteButton, { borderColor: '#FF3B30' }]}
                                        onPress={handleDeleteGoal}
                                    >
                                        <Ionicons name="trash-outline" size={24} color={'#FF3B30'} />
                                        <Text style={[styles.deleteButtonText, { color: '#FF3B30' }]}>Delete Goal</Text>
                                    </Pressable>

                                </ScrollView>
                            </>
                        )}
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
        fontSize: 28,
        fontFamily: 'CinzelBlack',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    loader: {
        marginTop: 40,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    goalCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    goalTitle: {
        fontSize: 20,
        fontFamily: 'CinzelBlack',
        marginBottom: 4,
    },
    dateRange: {
        fontSize: 12,
    },
    badgeContainer: {
        padding: 4,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 8,
    },
    amountContainer: {
        marginBottom: 16,
    },
    targetLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    targetAmount: {
        fontSize: 24,
        fontWeight: '700',
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 13,
        fontWeight: '500',
    },
    percentText: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 4,
    },
    viewDetails: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'CinzelBlack',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'CinzelBlack',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencyPrefix: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
    },
    currencyScroll: {
        gap: 8,
        paddingRight: 20,
    },
    currencyChip: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    currencyChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dateButton: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        marginBottom: 20,
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
        fontWeight: '600',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    chartTextContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    chartPercent: {
        fontSize: 36,
        fontWeight: '700',
    },
    chartLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    section: {
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'CinzelBlack',
        marginBottom: 12,
    },
    notesText: {
        fontSize: 16,
        lineHeight: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 40,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 12,
        gap: 8,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
})
