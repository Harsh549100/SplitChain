
export interface Member {
  address: string;
  name: string;
  ens?: string;
}

export interface Expense {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  description: string;
  date: string;
  splitType: 'equal' | 'percentage' | 'custom';
  splits: Split[];
}

export interface Split {
  address: string;
  amount: number;
  percentage?: number;
  paid: boolean;
  txHash?: string;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  createdAt: string;
  expenses: string[]; // Array of expense IDs
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  expenseId: string;
  groupId: string;
}

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: 'purple' | 'blue' | 'green' | 'pink' | 'orange';
}
