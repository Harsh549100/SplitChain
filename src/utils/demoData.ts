import { Group, Expense, Transaction } from '../types';
import { generateId } from './helpers';

// Demo addresses (don't use real addresses) - keeping these for reference
const demoAddresses = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
];

// Demo names - keeping these for reference
const demoNames = ['Alex', 'Taylor', 'Jordan', 'Morgan', 'Jamie'];

// Create empty demo groups - no preset groups
export const demoGroups: Group[] = [];

// Create empty demo expenses
export const createDemoExpenses = (): Expense[] => {
  return [];
};

// Create empty demo transactions
export const createDemoTransactions = (expenses: Expense[]): Transaction[] => {
  return [];
};

// Initialize demo data in localStorage
export const initializeDemoData = (): void => {
  const demoExpenses = createDemoExpenses();
  const demoTransactions = createDemoTransactions(demoExpenses);
  
  // Store in localStorage
  localStorage.setItem('splitchain_groups', JSON.stringify(demoGroups));
  localStorage.setItem('splitchain_expenses', JSON.stringify(demoExpenses));
  localStorage.setItem('splitchain_transactions', JSON.stringify(demoTransactions));
};
