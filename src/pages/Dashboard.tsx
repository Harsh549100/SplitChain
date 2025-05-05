
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { useWallet } from '@/context/WalletContext';
import { getGroups } from '@/services/localStorage';
import { Group } from '@/types';
import { formatDate } from '@/utils/helpers';

const Dashboard: React.FC = () => {
  const { account, connectWallet } = useWallet();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load groups from localStorage
    const loadData = () => {
      const savedGroups = getGroups();
      setGroups(savedGroups);
    };

    loadData();

    // Set up an interval to check for updates
    const interval = setInterval(loadData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!account) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center max-w-md">
            <Users className="w-16 h-16 mx-auto mb-6 text-splitchain-purple" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              To view your groups and manage expenses, please connect your Ethereum wallet.
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
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold mb-2">Your Groups</h1>
            <p className="text-muted-foreground">
              Manage your expense groups and see who owes what
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Input
                placeholder="Search groups..."
                className="w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild className="bg-splitchain-purple hover:bg-splitchain-dark-purple">
              <Link to="/create-group">
                <Plus className="w-4 h-4 mr-2" /> Create Group
              </Link>
            </Button>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <FileText className="w-12 h-12 mx-auto mb-4 text-splitchain-purple opacity-70" />
            <h2 className="text-xl font-semibold mb-2">No Groups Found</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm.length > 0
                ? `No groups matching "${searchTerm}"`
                : "You don't have any expense groups yet. Create your first group to get started!"}
            </p>
            <Button asChild>
              <Link to="/create-group">
                <Plus className="w-4 h-4 mr-2" /> Create New Group
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Link 
                key={group.id}
                to={`/group/${group.id}`}
                className="glass-card rounded-xl p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] animate-fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created {formatDate(group.createdAt)}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                  </div>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 5).map((member, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background text-xs font-medium"
                      >
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background text-xs font-medium">
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm font-medium">
                    {group.expenses.length} {group.expenses.length === 1 ? 'Expense' : 'Expenses'}
                  </div>
                  <ArrowRight className="w-4 h-4 text-splitchain-purple" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
