
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { useWallet } from '@/context/WalletContext';
import { getTransactions, getGroupById } from '@/services/localStorage';
import { Transaction, Group } from '@/types';
import { formatDate, formatAddress, formatAmount } from '@/utils/helpers';

const Transactions: React.FC = () => {
  const { account, connectWallet } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<Record<string, Group>>({});

  useEffect(() => {
    if (!account) return;

    const fetchData = () => {
      // Fetch all transactions
      const allTransactions = getTransactions();
      
      // Filter transactions where the current user is involved
      const userTransactions = allTransactions.filter(tx => 
        tx.from.toLowerCase() === account.toLowerCase() || 
        tx.to.toLowerCase() === account.toLowerCase()
      );
      
      setTransactions(userTransactions);
      
      // Fetch groups for transactions
      const groupsMap: Record<string, Group> = {};
      userTransactions.forEach(tx => {
        if (!groupsMap[tx.groupId]) {
          const group = getGroupById(tx.groupId);
          if (group) {
            groupsMap[tx.groupId] = group;
          }
        }
      });
      
      setGroups(groupsMap);
    };

    fetchData();
    
    // Set up interval to refresh data
    const intervalId = setInterval(fetchData, 5000);
    
    return () => clearInterval(intervalId);
  }, [account]);

  // Filter transactions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }
    
    const filtered = transactions.filter(tx => {
      const group = groups[tx.groupId];
      const groupName = group ? group.name.toLowerCase() : '';
      
      return (
        groupName.includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm)
      );
    });
    
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions, groups]);

  // Get member name from group
  const getMemberName = (address: string, groupId: string): string => {
    const group = groups[groupId];
    if (!group) return formatAddress(address);
    
    const member = group.members.find(m => m.address.toLowerCase() === address.toLowerCase());
    return member ? member.name : formatAddress(address);
  };

  if (!account) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center max-w-md">
            <FileText className="w-16 h-16 mx-auto mb-6 text-splitchain-purple" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              To view your transaction history, please connect your Ethereum wallet.
            </p>
            <Button onClick={connectWallet} className="w-full bg-splitchain-purple hover:bg-splitchain-dark-purple">
              Connect Wallet
            </Button>
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
            <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
            <p className="text-muted-foreground">
              View all your expense settlements and payments
            </p>
          </div>
          <div className="w-full md:w-64">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <FileText className="w-12 h-12 mx-auto mb-4 text-splitchain-purple opacity-70" />
            <h2 className="text-xl font-semibold mb-2">No Transactions Found</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm.length > 0
                ? `No transactions matching "${searchTerm}"`
                : "You don't have any transactions yet. They will appear here when you settle expenses."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {filteredTransactions.map((transaction) => {
              const isOutgoing = transaction.from.toLowerCase() === account.toLowerCase();
              const otherParty = isOutgoing ? transaction.to : transaction.from;
              const group = groups[transaction.groupId];
              
              return (
                <div 
                  key={transaction.id}
                  className="glass-card rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start md:items-center mb-4 md:mb-0">
                    <div className={`mr-4 p-2 rounded-full ${
                      isOutgoing 
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {isOutgoing 
                        ? <ArrowUpRight className="w-5 h-5" /> 
                        : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {isOutgoing ? 'Sent to ' : 'Received from '}
                        {getMemberName(otherParty, transaction.groupId)}
                      </h3>
                      <div className="text-sm text-muted-foreground mb-1">
                        {formatDate(transaction.date)}
                      </div>
                      {group && (
                        <Link 
                          to={`/group/${transaction.groupId}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {group.name}
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className={`font-semibold text-lg ${
                      isOutgoing ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {isOutgoing ? '-' : '+'}{formatAmount(transaction.amount)}
                    </div>
                    
                    <div className="flex space-x-2 mt-2">
                      {transaction.txHash && (
                        <a
                          href={`https://etherscan.io/tx/${transaction.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Etherscan
                        </a>
                      )}
                      <Link
                        to={`/expense/${transaction.expenseId}`}
                        className="text-xs flex items-center text-primary hover:underline"
                      >
                        <FileText className="w-3 h-3 mr-1" /> View Expense
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
