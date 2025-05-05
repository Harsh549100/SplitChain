
import { ethers } from 'ethers';
import { Group, Expense, Member, Split } from '../types';

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format address to shorter version
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format date to readable format
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format amount to readable format
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Calculate splits based on selected method
export const calculateSplits = (
  expense: Omit<Expense, 'id' | 'splits'>, 
  members: Member[], 
  customSplits?: Record<string, number>
): Split[] => {
  const { amount, splitType } = expense;
  
  switch (splitType) {
    case 'equal':
      const equalAmount = amount / members.length;
      return members.map(member => ({
        address: member.address,
        amount: equalAmount,
        paid: member.address === expense.paidBy,
        percentage: 100 / members.length
      }));
      
    case 'percentage':
      if (!customSplits) {
        throw new Error('Custom splits required for percentage split');
      }
      
      return members.map(member => {
        const percentage = customSplits[member.address] || 0;
        return {
          address: member.address,
          amount: (amount * percentage) / 100,
          percentage,
          paid: member.address === expense.paidBy
        };
      });
      
    case 'custom':
      if (!customSplits) {
        throw new Error('Custom splits required for custom split');
      }
      
      return members.map(member => {
        const splitAmount = customSplits[member.address] || 0;
        return {
          address: member.address,
          amount: splitAmount,
          percentage: (splitAmount / amount) * 100,
          paid: member.address === expense.paidBy
        };
      });
      
    default:
      throw new Error('Invalid split type');
  }
};

// Calculate balances for a group
export const calculateBalances = (
  group: Group,
  expenses: Expense[]
): Record<string, number> => {
  const balances: Record<string, number> = {};
  
  // Initialize all members with zero balances
  group.members.forEach(member => {
    balances[member.address] = 0;
  });
  
  // Calculate balances based on expenses
  expenses.forEach(expense => {
    // Add money to payer's balance
    balances[expense.paidBy] += expense.amount;
    
    // Subtract from each member's balance based on their splits
    expense.splits.forEach(split => {
      if (!split.paid) {
        balances[split.address] -= split.amount;
      }
    });
  });
  
  return balances;
};

// Check if a string is a valid Ethereum address
export const isValidEthereumAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

// Function to export group data to CSV
export const exportToCsv = (group: Group, expenses: Expense[]): string => {
  const headers = [
    'Date',
    'Description',
    'Amount',
    'Paid By',
    'Split Type',
    ...group.members.map(m => m.name || formatAddress(m.address))
  ].join(',');
  
  const rows = expenses.map(expense => {
    const payerMember = group.members.find(m => m.address === expense.paidBy);
    const payerName = payerMember?.name || formatAddress(expense.paidBy);
    
    const memberAmounts = group.members.map(member => {
      const split = expense.splits.find(s => s.address === member.address);
      return split ? split.amount.toString() : '0';
    });
    
    return [
      formatDate(expense.date),
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.amount.toString(),
      payerName,
      expense.splitType,
      ...memberAmounts
    ].join(',');
  });
  
  return [headers, ...rows].join('\n');
};

// Generate invite link for a group
export const generateInviteLink = (groupId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite?groupId=${groupId}`;
};
