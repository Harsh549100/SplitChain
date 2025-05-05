
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { useWallet } from '@/context/WalletContext';
import { useToast } from "@/hooks/use-toast";
import { saveGroup, getSavedMembers, saveMembersToStorage } from '@/services/localStorage';
import { Group, Member } from '@/types';
import { generateId, isValidEthereumAddress } from '@/utils/helpers';

const CreateGroup: React.FC = () => {
  const { account, connectWallet } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [groupName, setGroupName] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMembers, setSavedMembers] = useState<Member[]>([]);

  // Add the current user to members if wallet is connected and load saved members
  useEffect(() => {
    // Load saved members from localStorage
    const loadedMembers = getSavedMembers();
    setSavedMembers(loadedMembers);

    if (account && members.length === 0) {
      // Check if current account exists in saved members
      const currentUserInSaved = loadedMembers.find(
        member => member.address.toLowerCase() === account.toLowerCase()
      );
      
      setMembers([
        { address: account, name: currentUserInSaved?.name || 'You' }
      ]);
    }
  }, [account, members.length]);

  const addMember = () => {
    // Validate inputs
    if (!newMemberAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please enter a wallet address",
        variant: "destructive"
      });
      return;
    }
    
    // Validate Ethereum address
    if (!isValidEthereumAddress(newMemberAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive"
      });
      return;
    }
    
    // Check if member already exists
    const exists = members.some(member => 
      member.address.toLowerCase() === newMemberAddress.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Duplicate Member",
        description: "This address is already in the group",
        variant: "destructive"
      });
      return;
    }
    
    // Add new member
    const newMember = {
      address: newMemberAddress,
      name: newMemberName.trim() || `Member ${members.length + 1}`
    };
    
    setMembers([...members, newMember]);
    
    // Save this member to localStorage if not there already
    const memberExists = savedMembers.some(
      member => member.address.toLowerCase() === newMemberAddress.toLowerCase()
    );
    
    if (!memberExists) {
      const updatedSavedMembers = [...savedMembers, newMember];
      setSavedMembers(updatedSavedMembers);
      saveMembersToStorage(updatedSavedMembers);
    }
    
    // Clear inputs
    setNewMemberAddress('');
    setNewMemberName('');
  };

  const removeMember = (addressToRemove: string) => {
    // Prevent removing yourself
    if (addressToRemove === account) {
      toast({
        title: "Cannot Remove Yourself",
        description: "You cannot remove yourself from the group",
        variant: "destructive"
      });
      return;
    }
    
    setMembers(members.filter(member => member.address !== addressToRemove));
  };

  const addSavedMember = (member: Member) => {
    // Check if already in current group
    const exists = members.some(m => 
      m.address.toLowerCase() === member.address.toLowerCase()
    );
    
    if (exists) {
      toast({
        title: "Duplicate Member",
        description: "This member is already in the group",
        variant: "destructive"
      });
      return;
    }
    
    setMembers([...members, member]);
  };

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
    
    if (!groupName.trim()) {
      toast({
        title: "Missing Group Name",
        description: "Please enter a name for your group",
        variant: "destructive"
      });
      return;
    }
    
    if (members.length < 2) {
      toast({
        title: "Not Enough Members",
        description: "A group needs at least 2 members",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create new group object
      const newGroup: Group = {
        id: generateId(),
        name: groupName.trim(),
        members,
        createdAt: new Date().toISOString(),
        expenses: []
      };
      
      // Save to localStorage
      saveGroup(newGroup);
      
      toast({
        title: "Group Created",
        description: `${groupName} has been created successfully`
      });
      
      // Navigate to the new group page
      navigate(`/group/${newGroup.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
              To create a new group, please connect your Ethereum wallet first.
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
      <div className="py-8 px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a New Group</h1>
          <p className="text-muted-foreground">
            Set up a new group for splitting expenses with friends, roommates, or colleagues
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6 md:p-8 animate-fade-in">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g., Roommates, Trip to Paris, Team Lunch"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="mb-8">
              <Label className="mb-2 block">Group Members</Label>
              <div className="space-y-3">
                {members.map((member) => (
                  <div 
                    key={member.address}
                    className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.address}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(member.address)}
                      disabled={member.address === account}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Show saved members if there are any not already in the current group */}
              {savedMembers.length > 0 && (
                <div className="mt-6 mb-4">
                  <h3 className="text-sm font-medium mb-2">Previously Added Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {savedMembers
                      .filter(savedMember => 
                        !members.some(m => m.address.toLowerCase() === savedMember.address.toLowerCase()) &&
                        savedMember.address.toLowerCase() !== account?.toLowerCase()
                      )
                      .map(savedMember => (
                        <Button
                          key={savedMember.address}
                          type="button"
                          variant="outline"
                          className="justify-between text-left h-auto py-2"
                          onClick={() => addSavedMember(savedMember)}
                        >
                          <div>
                            <div className="font-medium">{savedMember.name}</div>
                            <div className="text-xs text-muted-foreground">{savedMember.address.substring(0, 8)}...{savedMember.address.substring(savedMember.address.length - 6)}</div>
                          </div>
                          <Plus className="h-4 w-4 ml-2 flex-shrink-0" />
                        </Button>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-4 rounded-lg border border-dashed flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="memberAddress">Wallet Address</Label>
                    <Input
                      id="memberAddress"
                      placeholder="0x..."
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberName">Name (Optional)</Label>
                    <Input
                      id="memberName"
                      placeholder="e.g., Alex"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMember}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" /> 
                  Add Member
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-splitchain-purple hover:bg-splitchain-dark-purple"
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateGroup;
