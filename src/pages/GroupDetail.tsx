
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Plus, DownloadCloud, Link as LinkIcon, FileText, Trash2, ArrowRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Layout from '@/components/Layout';
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@/context/WalletContext';
import { CONTRACT_ADDRESS } from '@/contractInteraction/config';
import { 
  getGroupById, 
  getExpensesByGroupId, 
  deleteGroup,
  getTransactionsByGroupId 
} from '@/services/localStorage';
import { Group, Expense, Transaction } from '@/types';
import { 
  formatDate, 
  formatAddress, 
  formatAmount, 
  calculateBalances,
  generateInviteLink,
  exportToCsv 
} from '@/utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const GroupDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { account, connectWallet, getEnsName } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [memberBalances, setMemberBalances] = useState<Record<string, number>>({});
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [inviteLink, setInviteLink] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('expenses');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Load group data
  useEffect(() => {
    if (!groupId) return;

    const fetchGroupData = async () => {
      const groupData = getGroupById(groupId);
      const expensesData = getExpensesByGroupId(groupId);
      const transactionsData = getTransactionsByGroupId(groupId);

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
      setExpenses(expensesData);
      setTransactions(transactionsData);
      
      // Calculate balances
      const balances = calculateBalances(groupData, expensesData);
      setMemberBalances(balances);
      
      // Generate invite link
      setInviteLink(generateInviteLink(groupId));
      
      // Resolve ENS names for members
      if (account) {
        const namesMap: Record<string, string> = {};
        for (const member of groupData.members) {
          namesMap[member.address] = member.name;
          try {
            const ensName = await getEnsName(member.address);
            if (ensName) {
              namesMap[member.address] = ensName;
            }
          } catch (error) {
            console.error(`Error resolving ENS for ${member.address}:`, error);
          }
        }
        setMemberNames(namesMap);
      }
    };

    fetchGroupData();

    // Set up interval to refresh data
    const intervalId = setInterval(fetchGroupData, 5000);
    
    return () => clearInterval(intervalId);
  }, [groupId, account, navigate, toast, getEnsName]);

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invitation link copied to clipboard"
    });
  };

  // Handle group deletion
  const handleDeleteGroup = () => {
    if (!groupId || !group) return;
    
    deleteGroup(groupId);
    
    toast({
      title: "Group Deleted",
      description: `${group.name} has been deleted`
    });
    
    setIsDeleteDialogOpen(false);
    navigate('/dashboard');
  };

  // Export group data
  const handleExportData = () => {
    if (!group) return;
    
    const csvData = exportToCsv(group, expenses);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${group.name.replace(/\s+/g, '_')}_expenses.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export Successful",
      description: "Group data has been exported to CSV"
    });
  };

  if (!account) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center max-w-md">
            <Users className="w-16 h-16 mx-auto mb-6 text-splitchain-purple" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              To view group details, please connect your Ethereum wallet.
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
            <Users className="w-12 h-12 text-primary/50" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <p className="text-muted-foreground">
              {group.members.length} members • Created on {formatDate(group.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to={`/group/${groupId}/add-expense`}>
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Link>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <LinkIcon className="w-4 h-4 mr-2" /> Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Others to {group.name}</DialogTitle>
                  <DialogDescription>
                    Share this link with others to invite them to your group
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex">
                    <Input 
                      value={inviteLink} 
                      readOnly 
                      className="rounded-r-none"
                    />
                    <Button 
                      onClick={copyInviteLink} 
                      className="rounded-l-none"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-white p-4 rounded-lg mx-auto">
                    <QRCodeSVG value={inviteLink} size={200} />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Scan this QR code to join the group
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleExportData}>
              <DownloadCloud className="w-4 h-4 mr-2" /> Export
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Group</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this group? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteGroup}>
                    Delete Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 col-span-1 animate-fade-in">
            <h2 className="font-semibold text-lg mb-4">Members</h2>
            <div className="space-y-4">
              {group.members.map((member) => (
                <div key={member.address} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {memberNames[member.address] || member.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatAddress(member.address)}
                    </div>
                  </div>
                  <div className={`font-medium ${
                    memberBalances[member.address] > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : memberBalances[member.address] < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-muted-foreground'
                  }`}>
                    {formatAmount(memberBalances[member.address] || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses" className="animate-fade-in">
                {expenses.length === 0 ? (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-splitchain-purple opacity-70" />
                    <h2 className="text-xl font-semibold mb-2">No Expenses Yet</h2>
                    <p className="text-muted-foreground mb-6">
                      Add your first expense to start tracking shared costs.
                    </p>
                    <Button asChild>
                      <Link to={`/group/${groupId}/add-expense`}>
                        <Plus className="w-4 h-4 mr-2" /> Add First Expense
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <Link
                        key={expense.id}
                        to={`/expense/${expense.id}`}
                        className="glass-card rounded-xl p-5 block transition-all hover:shadow-lg hover:translate-y-[-2px]"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{expense.description}</h3>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(expense.date)}
                            </div>
                          </div>
                          <div className="text-xl font-bold">
                            {formatAmount(expense.amount)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm">
                              Paid by <span className="font-medium">{
                                memberNames[expense.paidBy] || 
                                group.members.find(m => m.address === expense.paidBy)?.name || 
                                formatAddress(expense.paidBy)
                              }</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Split {expense.splitType === 'equal' 
                                ? 'equally' 
                                : expense.splitType === 'percentage' 
                                  ? 'by percentage' 
                                  : 'custom'}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="transactions" className="animate-fade-in">
                {transactions.length === 0 ? (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-splitchain-purple opacity-70" />
                    <h2 className="text-xl font-semibold mb-2">No Transactions Yet</h2>
                    <p className="text-muted-foreground mb-6">
                      Transactions will appear here when group members settle up.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => {
                      const fromMember = group.members.find(m => m.address === transaction.from);
                      const toMember = group.members.find(m => m.address === transaction.to);
                      
                      return (
                        <a
                          key={transaction.id}
                          href={`https://etherscan.io/tx/${transaction.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-card rounded-xl p-5 block transition-all hover:shadow-lg hover:translate-y-[-2px]"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">Payment</h3>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(transaction.date)}
                              </div>
                            </div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">
                              {formatAmount(transaction.amount)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm">
                                From <span className="font-medium">{fromMember?.name || formatAddress(transaction.from)}</span>
                              </div>
                              <div className="text-sm">
                                To <span className="font-medium">{toMember?.name || formatAddress(transaction.to)}</span>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : transaction.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200">
          <h2 className="font-semibold text-lg mb-4">Balances & Settlements</h2>
          
          {Object.entries(memberBalances).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No balances to show. Add expenses to start tracking who owes what.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(memberBalances).map(([address, balance]) => {
                const member = group.members.find(m => m.address === address);
                if (!member) return null;
                
                return (
                  <div 
                    key={address}
                    className={`p-4 rounded-lg border ${
                      balance > 0
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20'
                        : balance < 0
                          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/20'
                    }`}
                  >
                    <div className="font-medium mb-2">{memberNames[address] || member.name}</div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {formatAddress(address)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className={`font-bold ${
                        balance > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : balance < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-muted-foreground'
                      }`}>
                        {formatAmount(balance)}
                      </div>
                      
                      {balance < 0 && address === account && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-splitchain-purple hover:bg-splitchain-dark-purple">
                              Pay
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Payment QR Code</DialogTitle>
                              <DialogDescription>
                                Scan this QR code with your crypto wallet to settle your balance
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center p-4">
                              <div className="bg-white p-4 rounded-lg">
                                <QRCodeSVG 
                                  value={`ethereum:${CONTRACT_ADDRESS}/transfer?address=${member.address}&uint256=${Math.abs(balance)}`} 
                                  size={200} 
                                />
                              </div>
                              <div className="mt-4 text-center">
                                <p className="font-medium">{formatAmount(Math.abs(balance))}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  to {memberNames[address] || member.name}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default GroupDetail;
