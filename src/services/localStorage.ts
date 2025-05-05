
import { Group, Expense, Transaction, ThemeSettings, Member } from '../types';

// Keys for localStorage
const GROUPS_KEY = 'splitchain_groups';
const EXPENSES_KEY = 'splitchain_expenses';
const TRANSACTIONS_KEY = 'splitchain_transactions';
const THEME_SETTINGS_KEY = 'splitchain_theme_settings';
const SAVED_MEMBERS_KEY = 'splitchain_saved_members';

// Group methods
export const getGroups = (): Group[] => {
  const groups = localStorage.getItem(GROUPS_KEY);
  return groups ? JSON.parse(groups) : [];
};

export const saveGroup = (group: Group): void => {
  const groups = getGroups();
  const existingGroupIndex = groups.findIndex(g => g.id === group.id);
  
  if (existingGroupIndex !== -1) {
    groups[existingGroupIndex] = group;
  } else {
    groups.push(group);
  }
  
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

export const getGroupById = (id: string): Group | undefined => {
  const groups = getGroups();
  return groups.find(group => group.id === id);
};

export const deleteGroup = (id: string): void => {
  const groups = getGroups();
  const updatedGroups = groups.filter(group => group.id !== id);
  localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));
};

// Save and retrieve members
export const getSavedMembers = (): Member[] => {
  const members = localStorage.getItem(SAVED_MEMBERS_KEY);
  return members ? JSON.parse(members) : [];
};

export const saveMembersToStorage = (members: Member[]): void => {
  localStorage.setItem(SAVED_MEMBERS_KEY, JSON.stringify(members));
};

// Add a new member to saved members if not already exists
export const addMemberToSaved = (member: Member): void => {
  const savedMembers = getSavedMembers();
  const exists = savedMembers.some(m => 
    m.address.toLowerCase() === member.address.toLowerCase()
  );
  
  if (!exists) {
    savedMembers.push(member);
    saveMembersToStorage(savedMembers);
  }
};

// Expense methods
export const getExpenses = (): Expense[] => {
  const expenses = localStorage.getItem(EXPENSES_KEY);
  return expenses ? JSON.parse(expenses) : [];
};

export const saveExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  const existingExpenseIndex = expenses.findIndex(e => e.id === expense.id);
  
  if (existingExpenseIndex !== -1) {
    expenses[existingExpenseIndex] = expense;
  } else {
    expenses.push(expense);
  }
  
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const getExpenseById = (id: string): Expense | undefined => {
  const expenses = getExpenses();
  return expenses.find(expense => expense.id === id);
};

export const getExpensesByGroupId = (groupId: string): Expense[] => {
  const expenses = getExpenses();
  return expenses.filter(expense => expense.groupId === groupId);
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses();
  const updatedExpenses = expenses.filter(expense => expense.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(updatedExpenses));
};

// Transaction methods
export const getTransactions = (): Transaction[] => {
  const transactions = localStorage.getItem(TRANSACTIONS_KEY);
  return transactions ? JSON.parse(transactions) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  const existingTransactionIndex = transactions.findIndex(t => t.id === transaction.id);
  
  if (existingTransactionIndex !== -1) {
    transactions[existingTransactionIndex] = transaction;
  } else {
    transactions.push(transaction);
  }
  
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getTransactionsByGroupId = (groupId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter(transaction => transaction.groupId === groupId);
};

export const getTransactionsByExpenseId = (expenseId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter(transaction => transaction.expenseId === expenseId);
};

// Theme settings methods
export const getThemeSettings = (): ThemeSettings => {
  const settings = localStorage.getItem(THEME_SETTINGS_KEY);
  return settings 
    ? JSON.parse(settings)
    : { theme: 'system', accentColor: 'purple' };
};

export const saveThemeSettings = (settings: ThemeSettings): void => {
  localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(settings));
};
