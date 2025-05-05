
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calculator, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Layout from '@/components/Layout';
import { useWallet } from '@/context/WalletContext';
import { getGroupById, saveExpense, saveGroup } from '@/services/localStorage';
import { Group, Expense, Split } from '@/types';
import { generateId, calculateSplits, formatAddress } from '@/utils/helpers';

type SplitType = 'equal' | 'percentage' | 'custom';

const AddExpense: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { account, connectWallet } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load group data
  useEffect(() => {
    if (!groupId) return;

    const groupData = getGroupById(groupId);
    if (!groupData) {
      toast({
        title: "Group Not Found",
        description: "The requested group could not be found",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }

    setGroup(groupData);
    
    // Set current user as default payer if they are a member
    if (account) {
      const isMember = groupData.members.some(member => 
        member.address.toLowerCase() === account.toLowerCase()
      );
      
      if (isMember) {
        setPaidBy(account);
      } else {
        setPaidBy(groupData.members[0].address);
      }
    } else {
      setPaidBy(groupData.members[0].address);
    }
    
    // Initialize custom splits with zero values
    const splits: Record<string, number> = {};
    groupData.members.forEach(member => {
      splits[member.address] = 0;
    });
    setCustomSplits(splits);
  }, [groupId, account, navigate, toast]);

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!paidBy) {
      newErrors.paidBy = 'Payer is required';
    }
    
    if (splitType === 'percentage' || splitType === 'custom') {
      let total = 0;
      let anyNonZero = false;
      
      Object.values(customSplits).forEach(value => {
        total += value;
        if (value > 0) anyNonZero = true;
      });
      
      if (!anyNonZero) {
        newErrors.splits = 'At least one member must have a non-zero split';
      }
      
      if (splitType === 'percentage' && Math.abs(total - 100) > 0.01) {
        newErrors.splits = 'Percentages must add up to 100%';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    if (!group) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const numericAmount = parseFloat(amount);
      
      const expenseData = {
        groupId: group.id,
        paidBy,
        amount: numericAmount,
        description,
        date: new Date().toISOString(),
        splitType
      };
      
      // Calculate splits based on the selected method
      let splits: Split[];
      
      if (splitType === 'equal') {
        splits = calculateSplits(expenseData, group.members);
      } else {
        splits = calculateSplits(expenseData, group.members, customSplits);
      }
      
      // Create new expense object
      const newExpense: Expense = {
        id: generateId(),
        ...expenseData,
        splits
      };
      
      // Save to localStorage
      saveExpense(newExpense);
      
      // Update group's expenses array
      const updatedGroup = {
        ...group,
        expenses: [...group.expenses, newExpense.id]
      };
      saveGroup(updatedGroup);
      
      toast({
        title: "Expense Added",
        description: `${description} has been added to ${group.name}`
      });
      
      // Navigate to the group detail page
      navigate(`/group/${group.id}`);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle split amount/percentage changes
  const handleSplitChange = (address: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    
    if (isNaN(numericValue)) return;
    
    setCustomSplits(prev => ({
      ...prev,
      [address]: numericValue
    }));
  };

  // Calculate equal splits for preview
  const calculateEqualSplits = (): Record<string, number> => {
    if (!group || !amount) return {};
    
    const numericAmount = parseFloat(amount) || 0;
    const equalAmount = numericAmount / group.members.length;
    
    const splits: Record<string, number> = {};
    group.members.forEach(member => {
      splits[member.address] = equalAmount;
    });
    
    return splits;
  };

  if (!account) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center max-w-md">
            <Calculator className="w-16 h-16 mx-auto mb-6 text-splitchain-purple" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              To add an expense, please connect your Ethereum wallet first.
            </p>
            <Button onClick={connectWallet} className="w-full bg-splitchain-purple hover:bg-splitchain-dark-purple">
              Connect Wallet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse-purple p-4 rounded-full">
            <Calculator className="w-12 h-12 text-primary/50" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Expense</h1>
          <p className="text-muted-foreground">
            Add a new expense to split with the group "{group.name}"
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="glass-card rounded-xl p-6 md:p-8 mb-6 animate-fade-in">
            <div className="mb-5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Dinner at Restaurant, Groceries, Movie tickets"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>
            
            <div className="mb-5">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`mt-1 ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>
            
            <div className="mb-5">
              <Label htmlFor="paidBy">Paid by</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger className={`mt-1 ${errors.paidBy ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {group.members.map((member) => (
                    <SelectItem key={member.address} value={member.address}>
                      {member.address === account 
                        ? `${member.name} (You)` 
                        : `${member.name} (${formatAddress(member.address)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paidBy && (
                <p className="text-sm text-red-500 mt-1">{errors.paidBy}</p>
              )}
            </div>
            
            <div className="mb-5">
              <Label htmlFor="splitType">Split type</Label>
              <Select value={splitType} onValueChange={(value) => setSplitType(value as SplitType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="How to split the expense" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Split equally</SelectItem>
                  <SelectItem value="percentage">Split by percentage</SelectItem>
                  <SelectItem value="custom">Split by amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Split Preview</h3>
              
              {errors.splits && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start dark:bg-red-900/20 dark:border-red-900">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{errors.splits}</p>
                </div>
              )}
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {splitType === 'equal' 
                      ? 'Equal Split' 
                      : splitType === 'percentage' 
                        ? 'Percentage Split' 
                        : 'Custom Split'}
                  </CardTitle>
                  <CardDescription>
                    {splitType === 'equal' 
                      ? 'The expense will be divided equally among all members' 
                      : splitType === 'percentage' 
                        ? 'Specify the percentage each member should pay' 
                        : 'Specify the exact amount each member should pay'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.members.map((member) => {
                      const isEqualSplit = splitType === 'equal';
                      const splits = isEqualSplit ? calculateEqualSplits() : customSplits;
                      const memberSplit = splits[member.address] || 0;
                      
                      return (
                        <div key={member.address} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {member.address === account ? `${member.name} (You)` : member.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatAddress(member.address)}
                            </div>
                          </div>
                          
                          {isEqualSplit ? (
                            <div className="font-medium">
                              ${memberSplit.toFixed(2)}
                            </div>
                          ) : (
                            <div className="w-24">
                              <Input
                                type="number"
                                min="0"
                                step={splitType === 'percentage' ? '0.1' : '0.01'}
                                value={memberSplit || ''}
                                onChange={(e) => handleSplitChange(member.address, e.target.value)}
                                className="text-right"
                              />
                              {splitType === 'percentage' && (
                                <div className="text-xs text-right mt-1 text-muted-foreground">
                                  ${amount && !isNaN(parseFloat(amount)) 
                                    ? ((parseFloat(amount) * memberSplit) / 100).toFixed(2) 
                                    : '0.00'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(`/group/${group.id}`)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-splitchain-purple hover:bg-splitchain-dark-purple"
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddExpense;
