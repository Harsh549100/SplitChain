
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { useWallet } from '@/context/WalletContext';
import { useToast } from "@/hooks/use-toast";
import { getGroupById, saveGroup } from '@/services/localStorage';
import { Group } from '@/types';
import { isValidEthereumAddress } from '@/utils/helpers';

const Invite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { account, connectWallet } = useWallet();
  const { toast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [memberName, setMemberName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    const groupId = searchParams.get('groupId');
    
    if (!groupId) {
      toast({
        title: "Invalid Invite",
        description: "This invite link is not valid",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    
    // Fetch group data
    const groupData = getGroupById(groupId);
    
    if (!groupData) {
      toast({
        title: "Group Not Found",
        description: "The group you're trying to join doesn't exist",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    
    setGroup(groupData);
    
    // Check if user is already a member
    if (account) {
      const isMember = groupData.members.some(member => 
        member.address.toLowerCase() === account.toLowerCase()
      );
      
      if (isMember) {
        setAlreadyMember(true);
      }
    }
  }, [searchParams, navigate, toast, account]);

  const handleJoin = async () => {
    if (!group || !account) return;
    
    if (alreadyMember) {
      navigate(`/group/${group.id}`);
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Add user to group members
      const updatedGroup = {
        ...group,
        members: [
          ...group.members,
          {
            address: account,
            name: memberName.trim() || 'New Member'
          }
        ]
      };
      
      // Save updated group
      saveGroup(updatedGroup);
      
      toast({
        title: "Group Joined",
        description: `You are now a member of ${group.name}`
      });
      
      // Navigate to group page
      navigate(`/group/${group.id}`);
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (!account) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center max-w-md">
            <Users className="w-16 h-16 mx-auto mb-6 text-splitchain-purple" />
            <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              To join this group, please connect your Ethereum wallet first.
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
      <div className="py-12 px-4 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Group</h1>
          <p className="text-muted-foreground">
            You've been invited to join "{group.name}"
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6 md:p-8 animate-fade-in">
          {alreadyMember ? (
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Already a Member</h2>
              <p className="text-muted-foreground mb-6">
                You are already a member of this group.
              </p>
              <Button 
                onClick={() => navigate(`/group/${group.id}`)} 
                className="w-full bg-splitchain-purple hover:bg-splitchain-dark-purple"
              >
                Go to Group
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold">Group Details</h2>
                  <span className="text-sm text-muted-foreground">
                    {group.members.length} members
                  </span>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium text-lg">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="wallet">Your Wallet</Label>
                <Input
                  id="wallet"
                  value={account}
                  disabled
                  className="mt-1 bg-muted/50"
                />
                {!isValidEthereumAddress(account) && (
                  <p className="text-sm text-red-500 mt-1">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Invalid Ethereum address
                  </p>
                )}
              </div>
              
              <div className="mb-8">
                <Label htmlFor="name">Your Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="How others will see you in the group"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This helps others identify you in the group
                </p>
              </div>
              
              <Button 
                onClick={handleJoin} 
                disabled={isJoining || !isValidEthereumAddress(account)} 
                className="w-full bg-splitchain-purple hover:bg-splitchain-dark-purple"
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Invite;
