import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, QrCode, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@/context/WalletContext';
import { CONTRACT_ADDRESS } from '@/contractInteraction/config';
import { 
  getExpenseById, 
  getGroupById, 
  saveExpense,
  saveTransaction 
} from '@/services/localStorage';
import { Group, Expense, Transaction } from '@/types';
import { 
  formatDate, 
  formatAddress, 
  formatAmount, 
  generateId 
} from '@/utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const ExpenseDetail: React.FC = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const { account, connectWallet, transferTokens } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!expenseId) return;

    const fetchData = () => {
      const expenseData = getExpenseById(expenseId);
      
      if (!expenseData) {
        toast({
          title: "Expense Not Found",
          description: "The requested expense could not be found",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }
      
      setExpense(expenseData);
      
      const groupData = getGroupById(expenseData.groupId);
      if (groupData) {
        setGroup(groupData);
        
        // Create member name lookup
        const namesMap: Record<string, string> = {};
        groupData.members.forEach(member => {
          namesMap[member.address] = member.name;
        });
        setMemberNames(namesMap);
      }
      
      setIsLoading(false);
    };

    fetchData();
    
    // Set up interval to refresh data
    const intervalId = setInterval(fetchData, 5000);
    
    return () => clearInterval(intervalId);
  }, [expenseId, navigate, toast]);

  // Check if the current user is involved in this expense
  const getUserSplit = () => {
    if (!expense || !account) return null;
    
    return expense.splits.find(split => 
      split.address.toLowerCase() === account.toLowerCase()
    );
  };

  // Handle payment
  const handlePayment = async () => {
    if (!expense || !account || !group) return;
    
    const userSplit = getUserSplit();
    if (!userSplit) return;
    
    const paymentAmount = userSplit.amount.toString();
    
    try {
      setPaymentLoading(true);
      
      console.log(`Starting payment process for amount: ${paymentAmount} to ${expense.paidBy}`);
      
      // Make the payment using the wallet context
      const txHash = await transferTokens(expense.paidBy, paymentAmount);
      
      console.log(`Payment successful, received transaction hash: ${txHash}`);
      
      // Update the split as paid
      const updatedSplits = expense.splits.map(split => {
        if (split.address.toLowerCase() === account.toLowerCase()) {
          console.log(`Marking split for ${split.address} as paid`);
          return { ...split, paid: true, txHash };
        }
        return split;
      });
      
      const updatedExpense = { ...expense, splits: updatedSplits };
      
      // Save updated expense
      saveExpense(updatedExpense);
      
      // Create transaction record
      const transaction: Transaction = {
        id: generateId(),
        from: account,
        to: expense.paidBy,
        amount: userSplit.amount,
        date: new Date().toISOString(),
        status: 'confirmed',
        txHash,
        expenseId: expense.id,
        groupId: expense.groupId
      };
      
      saveTransaction(transaction);
      console.log(`Transaction record saved with ID: ${transaction.id}`);
      
      // Update state
      setExpense(updatedExpense);
      
      toast({
        title: "Payment Successful",
        description: `You paid ${formatAmount(userSplit.amount)} to ${memberNames[expense.paidBy] || formatAddress(expense.paidBy)}`
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!account) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center max-w-md">
            <QrCode className="w-16 h-16 mx-auto mb-6 text-splitchain-purple" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              To view expense details, please connect your Ethereum wallet.
            </p>
            <Button onClick={connectWallet} className="w-full bg-splitchain-purple hover:bg-splitchain-dark-purple">
              Connect Wallet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || !expense || !group) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse-purple p-4 rounded-full">
            <QrCode className="w-12 h-12 text-primary/50" />
          </div>
        </div>
      </Layout>
    );
  }

  const userSplit = getUserSplit();
  const needsToPayAmount = userSplit && !userSplit.paid && userSplit.address !== expense.paidBy 
    ? userSplit.amount 
    : 0;

  const payerName = memberNames[expense.paidBy] || formatAddress(expense.paidBy);

  return (
    <Layout>
      <div className="py-8 px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate(`/group/${expense.groupId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Group
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{expense.description}</h1>
          <p className="text-muted-foreground">
            Added on {formatDate(expense.date)}
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6 md:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
              <div className="text-3xl font-bold">{formatAmount(expense.amount)}</div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="text-sm text-muted-foreground mb-1">Paid by</div>
              <div className="text-xl font-semibold">{payerName}</div>
              <div className="text-sm text-muted-foreground">
                {formatAddress(expense.paidBy)}
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="text-sm text-muted-foreground mb-2">Split Details</div>
            <div className="bg-background/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="p-3 text-sm font-medium">Member</th>
                    <th className="p-3 text-sm font-medium">Amount</th>
                    <th className="p-3 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expense.splits.map((split, index) => {
                    const memberName = memberNames[split.address] || formatAddress(split.address);
                    const isCurrentUser = split.address.toLowerCase() === account.toLowerCase();
                    
                    return (
                      <tr key={split.address} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="p-3">
                          <div className="font-medium">
                            {memberName} {isCurrentUser && '(You)'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatAddress(split.address)}
                          </div>
                        </td>
                        <td className="p-3 font-medium">
                          {formatAmount(split.amount)}
                        </td>
                        <td className="p-3">
                          {split.address === expense.paidBy ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <Check className="w-4 h-4 mr-1" /> Paid (Payer)
                            </div>
                          ) : split.paid ? (
                            <div className="flex flex-col">
                              <div className="flex items-center text-green-600 dark:text-green-400">
                                <Check className="w-4 h-4 mr-1" /> Paid
                              </div>
                              {split.txHash && (
                                <a 
                                  href={`https://etherscan.io/tx/${split.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary flex items-center mt-1"
                                >
                                  View Transaction <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-orange-600 dark:text-orange-400">Unpaid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <QrCode className="w-4 h-4 mr-2" /> Payment QR
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Payment QR Code</DialogTitle>
                  <DialogDescription>
                    Scan this QR code with your crypto wallet to make a payment
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG 
                      value={`ethereum:${CONTRACT_ADDRESS}/transfer?address=${expense.paidBy}&uint256=${needsToPayAmount}`} 
                      size={200} 
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-medium">{formatAmount(needsToPayAmount)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      to {payerName}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {needsToPayAmount > 0 && (
          <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 mb-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold mb-1">You owe {formatAmount(needsToPayAmount)}</h3>
                <p className="text-muted-foreground">
                  Pay your share to {payerName}
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={paymentLoading} 
                    className="bg-splitchain-purple hover:bg-splitchain-dark-purple"
                  >
                    {paymentLoading ? 'Processing...' : 'Pay Now'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to pay {formatAmount(needsToPayAmount)} to {payerName}. 
                      This will create a transaction on the Ethereum blockchain.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePayment}>
                      Confirm Payment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link to={`/group/${expense.groupId}`}>Back to Group</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ExpenseDetail;
