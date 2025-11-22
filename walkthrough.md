# Walkthrough - Fixes and Enhancements

## Changes

### 1. Firebase Permissions
- Updated `firestore.rules` to allow read/write access to the `expenses` collection. This resolves the "Missing or insufficient permissions" error.

### 2. Routing Fixes
- Modified `app/(root)/_layout.tsx` to explicitly hide the `expense` route from the tab bar using `href: null`. This prevents the "extra tab" issue where the expense detail screen was appearing as a tab.

### 3. Currency Selection
- Updated `app/(root)/expenses.tsx` to:
    - Add a `CURRENCIES` constant with common currencies.
    - Add a currency selection UI (horizontal scroll chips) to the "Add Expense" modal.
    - Store the selected currency in the `expenses` collection.
    - Display the correct currency symbol in the expense list.
- Updated `app/(root)/expense/[id].tsx` to display the stored currency symbol in the expense detail view.

## Verification Results

### Automated Checks
- `firestore.rules` now includes a match block for `/expenses/{expenseId}`.
- `app/(root)/_layout.tsx` now includes `<Tabs.Screen name="expense" options={{ href: null }} />`.
- `app/(root)/expenses.tsx` and `app/(root)/expense/[id].tsx` correctly handle the `currency` field.

### Manual Verification Steps
1.  **Fetch Expenses:** The app should now successfully fetch expenses without the permission error.
2.  **Tabs:** The "Expense" tab (singular) or any extra tab should no longer appear in the bottom navigation. Only "Expenses", "Goals", "Home", "Insights", and "Profile" should be visible.
3.  **Add Expense:**
    - Open the "Add Expense" modal.
    - Verify the "Currency" selection section appears.
    - Select a currency (e.g., EUR).
    - Add an expense.
    - Verify the expense appears in the list with the correct currency symbol (e.g., €).
4.  **Expense Details:**
    - Tap on the new expense.
    - Verify the detail screen shows the correct currency symbol.
