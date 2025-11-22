import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import React, { useEffect, useMemo, useState } from 'react'
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
    TouchableOpacity,
    View
} from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { db } from '../config/firebase'
import { useTheme } from '../context/ThemeContext'

interface Expense {
    id: string
    userId: string
    merchant: string
    amount: number
    date: string
    category: string
    notes?: string
    createdAt: string
    currency?: string
}

const CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: 'restaurant' },
    { id: 'transport', name: 'Transportation', icon: 'car' },
    { id: 'shopping', name: 'Shopping', icon: 'cart' },
    { id: 'entertainment', name: 'Entertainment', icon: 'game-controller' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'flash' },
    { id: 'health', name: 'Health & Fitness', icon: 'fitness' },
    { id: 'travel', name: 'Travel', icon: 'airplane' },
    { id: 'education', name: 'Education', icon: 'school' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal' },
]

const CURRENCIES = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'EUR' },
    { symbol: '£', name: 'GBP' },
    { symbol: '₹', name: 'INR' },
    { symbol: '¥', name: 'JPY' },
    { symbol: 'CA$', name: 'CAD' },
    { symbol: 'AU$', name: 'AUD' },
]

export default function ExpensesScreen() {
    const insets = useSafeAreaInsets()
    const { colors } = useTheme()
    const { user } = useUser()
    const router = useRouter()

    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
    const [filterMonth, setFilterMonth] = useState(new Date())
    const [showMonthPicker, setShowMonthPicker] = useState(false)

    // Add/Edit Modal State
    const [modalVisible, setModalVisible] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [merchant, setMerchant] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date())
    const [category, setCategory] = useState(CATEGORIES[0].id)
    const [notes, setNotes] = useState('')
    const [currency, setCurrency] = useState(CURRENCIES[0].symbol)
    const [showDatePicker, setShowDatePicker] = useState(false)

    useEffect(() => {
        if (!user) return

        const startOfMonth = new Date(filterMonth.getFullYear(), filterMonth.getMonth(), 1)
        const endOfMonth = new Date(filterMonth.getFullYear(), filterMonth.getMonth() + 1, 0, 23, 59, 59)

        // Simplified query to avoid composite index requirement
        const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.id)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const expensesList: Expense[] = []
            snapshot.forEach((doc) => {
                const data = doc.data() as Omit<Expense, 'id'>
                // Client-side filtering for date range
                const expenseDate = new Date(data.date)
                if (expenseDate >= startOfMonth && expenseDate <= endOfMonth) {
                    expensesList.push({ id: doc.id, ...data } as Expense)
                }
            })

            // Client-side sorting
            expensesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            setExpenses(expensesList)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching expenses: ", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user, filterMonth])

    const filteredExpenses = useMemo(() => {
        let result = [...expenses]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(e =>
                e.merchant.toLowerCase().includes(query) ||
                e.notes?.toLowerCase().includes(query)
            )
        }

        if (selectedCategory) {
            result = result.filter(e => e.category === selectedCategory)
        }

        if (sortOrder === 'oldest') {
            result.reverse()
        }

        return result
    }, [expenses, searchQuery, selectedCategory, sortOrder])

    const handleSaveExpense = async () => {
        if (!merchant.trim() || !amount.trim()) {
            Alert.alert('Error', 'Please fill in merchant and amount.')
            return
        }

        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount.')
            return
        }

        setSubmitting(true)
        try {
            if (isEditing && editingId) {
                // Update existing expense
                const docRef = doc(db, 'expenses', editingId)
                await updateDoc(docRef, {
                    merchant: merchant.trim(),
                    amount: numAmount,
                    date: date.toISOString(),
                    category: category,
                    notes: notes.trim(),
                    currency: currency,
                })
                Alert.alert('Success', 'Expense updated successfully')
            } else {
                // Add new expense
                await addDoc(collection(db, 'expenses'), {
                    userId: user?.id,
                    merchant: merchant.trim(),
                    amount: numAmount,
                    date: date.toISOString(),
                    category: category,
                    notes: notes.trim(),
                    currency: currency,
                    createdAt: new Date().toISOString(),
                })
            }
            resetForm()
        } catch (error) {
            console.error("Error saving expense: ", error)
            Alert.alert('Error', isEditing ? 'Failed to update expense' : 'Failed to add expense')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteExpense = async (id: string) => {
        Alert.alert(
            "Delete Expense",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'expenses', id))
                        } catch (error) {
                            console.error("Error deleting expense: ", error)
                            Alert.alert('Error', 'Failed to delete expense')
                        }
                    }
                }
            ]
        )
    }

    const openEditModal = (expense: Expense) => {
        setMerchant(expense.merchant)
        setAmount(expense.amount.toString())
        setDate(new Date(expense.date))
        setCategory(expense.category)
        setNotes(expense.notes || '')
        setCurrency(expense.currency || CURRENCIES[0].symbol)
        setEditingId(expense.id)
        setIsEditing(true)
        setModalVisible(true)
    }

    const resetForm = () => {
        setMerchant('')
        setAmount('')
        setDate(new Date())
        setCategory(CATEGORIES[0].id)
        setCurrency(CURRENCIES[0].symbol)
        setNotes('')
        setIsEditing(false)
        setEditingId(null)
        setModalVisible(false)
    }

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setDate(selectedDate)
        }
    }

    const renderLeftActions = (item: Expense) => {
        return (
            <TouchableOpacity
                style={styles.editAction}
                onPress={() => openEditModal(item)}
            >
                <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
        )
    }

    const renderRightActions = (id: string) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDeleteExpense(id)}
            >
                <Ionicons name="trash-outline" size={24} color="#fff" />
            </TouchableOpacity>
        )
    }

    const renderExpenseItem = ({ item }: { item: Expense }) => {
        const categoryItem = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[8]

        return (
            <View style={{ marginBottom: 12 }}>
                <Swipeable
                    renderRightActions={() => renderRightActions(item.id)}
                    renderLeftActions={() => renderLeftActions(item)}
                >
                    <Pressable
                        style={[styles.expenseCard, { backgroundColor: colors.card }]}
                        onPress={() => openEditModal(item)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                            <Ionicons name={categoryItem.icon as any} size={24} color={colors.primary} />
                        </View>
                        <View style={styles.expenseDetails}>
                            <Text style={[styles.merchantText, { color: colors.text }]}>{item.merchant}</Text>
                            <Text style={[styles.categoryDateText, { color: colors.textSecondary }]}>
                                {new Date(item.date).toLocaleDateString()} • {categoryItem.name}
                            </Text>
                        </View>
                        <Text style={[styles.amountText, { color: colors.text }]}>
                            {item.currency || '$'}{item.amount.toLocaleString()}
                        </Text>
                    </Pressable>
                </Swipeable>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Expenses</Text>
                <Pressable
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        resetForm() // Ensure clean state for new expense
                        setModalVisible(true)
                    }}
                >
                    <Ionicons name="add" size={24} color={colors.background} />
                </Pressable>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <View style={styles.searchRow}>
                    <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search merchant or note"
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <Pressable
                        style={[styles.monthButton, { backgroundColor: colors.card }]}
                        onPress={() => setShowMonthPicker(true)}
                    >
                        <Text style={{ color: colors.text }}>
                            {filterMonth.toLocaleString('default', { month: 'short', year: '2-digit' })}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                    <Pressable
                        style={[
                            styles.chip,
                            { backgroundColor: selectedCategory === null ? colors.primary : colors.card }
                        ]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={[styles.chipText, { color: selectedCategory === null ? colors.background : colors.text }]}>All</Text>
                    </Pressable>
                    {CATEGORIES.map(cat => (
                        <Pressable
                            key={cat.id}
                            style={[
                                styles.chip,
                                { backgroundColor: selectedCategory === cat.id ? colors.primary : colors.card }
                            ]}
                            onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                        >
                            <Text style={[styles.chipText, { color: selectedCategory === cat.id ? colors.background : colors.text }]}>{cat.name}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredExpenses}
                    renderItem={renderExpenseItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Expenses</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Tap the + button to record your first expense for this period.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Add/Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={resetForm}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {isEditing ? 'Edit Expense' : 'New Expense'}
                            </Text>
                            <Pressable onPress={resetForm}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Merchant</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        placeholder="e.g., Starbucks"
                                        placeholderTextColor={colors.textSecondary}
                                        value={merchant}
                                        onChangeText={setMerchant}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Currency</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                                        {CURRENCIES.map((curr) => (
                                            <Pressable
                                                key={curr.name}
                                                style={[
                                                    styles.categoryChip,
                                                    {
                                                        borderColor: currency === curr.symbol ? colors.primary : colors.border,
                                                        backgroundColor: currency === curr.symbol ? colors.primary : colors.background
                                                    }
                                                ]}
                                                onPress={() => setCurrency(curr.symbol)}
                                            >
                                                <Text style={[
                                                    styles.categoryChipText,
                                                    { color: currency === curr.symbol ? colors.background : colors.text }
                                                ]}>
                                                    {curr.symbol} - {curr.name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        placeholder="0.00"
                                        placeholderTextColor={colors.textSecondary}
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
                                    <Pressable
                                        style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={{ color: colors.text }}>{date.toLocaleDateString()}</Text>
                                    </Pressable>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="default"
                                            onChange={onDateChange}
                                        />
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                                        {CATEGORIES.map((cat) => (
                                            <Pressable
                                                key={cat.id}
                                                style={[
                                                    styles.categoryChip,
                                                    {
                                                        borderColor: category === cat.id ? colors.primary : colors.border,
                                                        backgroundColor: category === cat.id ? colors.primary : colors.background
                                                    }
                                                ]}
                                                onPress={() => setCategory(cat.id)}
                                            >
                                                <Ionicons
                                                    name={cat.icon as any}
                                                    size={16}
                                                    color={category === cat.id ? colors.background : colors.textSecondary}
                                                    style={{ marginRight: 4 }}
                                                />
                                                <Text style={[
                                                    styles.categoryChipText,
                                                    { color: category === cat.id ? colors.background : colors.text }
                                                ]}>
                                                    {cat.name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (Optional)</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                        placeholder="Add details..."
                                        placeholderTextColor={colors.textSecondary}
                                        value={notes}
                                        onChangeText={setNotes}
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
                                        onPress={handleSaveExpense}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator color={colors.background} />
                                        ) : (
                                            <Text style={[styles.buttonText, { color: colors.background }]}>
                                                {isEditing ? 'Update' : 'Save'}
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </KeyboardAvoidingView>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Month Picker Modal */}
            {showMonthPicker && (
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showMonthPicker}
                    onRequestClose={() => setShowMonthPicker(false)}
                >
                    <Pressable style={styles.modalOverlay} onPress={() => setShowMonthPicker(false)}>
                        <View style={[styles.pickerContent, { backgroundColor: colors.card }]}>
                            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Month</Text>
                            <View style={styles.monthGrid}>
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const date = new Date(filterMonth.getFullYear(), i, 1)
                                    const isSelected = i === filterMonth.getMonth()
                                    return (
                                        <Pressable
                                            key={i}
                                            style={[
                                                styles.monthItem,
                                                { backgroundColor: isSelected ? colors.primary : colors.background }
                                            ]}
                                            onPress={() => {
                                                setFilterMonth(date)
                                                setShowMonthPicker(false)
                                            }}
                                        >
                                            <Text style={{ color: isSelected ? colors.background : colors.text }}>
                                                {date.toLocaleString('default', { month: 'short' })}
                                            </Text>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </View>
                    </Pressable>
                </Modal>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    filterContainer: {
        paddingBottom: 12,
    },
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    monthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        gap: 4,
    },
    chipsContainer: {
        paddingHorizontal: 20,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loader: {
        marginTop: 40,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        // marginBottom: 12, // Moved to wrapper view
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    expenseDetails: {
        flex: 1,
    },
    merchantText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    categoryDateText: {
        fontSize: 12,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
    },
    deleteAction: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 16,
        // marginBottom: 12, // Removed to fix overlap
        marginLeft: 12,
    },
    editAction: {
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 16,
        marginRight: 12,
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    dateButton: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
    },
    categoryScroll: {
        gap: 8,
        paddingRight: 20,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
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
    pickerContent: {
        margin: 20,
        borderRadius: 24,
        padding: 24,
        alignSelf: 'center',
        width: '90%',
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    monthItem: {
        width: '30%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
})
