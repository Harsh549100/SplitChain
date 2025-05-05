
import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { formatAddress } from '@/utils/helpers';
import { ThemeToggle } from './ThemeToggle';
import { Users, Plus, FileText, Moon, Hash } from 'lucide-react';

const Header: React.FC = () => {
  const { account, connectWallet, isConnecting } = useWallet();
  const location = useLocation();

  return (
    <header className="w-full bg-background border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-gradient">
            SplitChain
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <NavLink to="/dashboard" isActive={location.pathname === '/dashboard'}>
            <Users className="w-4 h-4 mr-2" /> Groups
          </NavLink>
          <NavLink to="/create-group" isActive={location.pathname === '/create-group'}>
            <Plus className="w-4 h-4 mr-2" /> New Group
          </NavLink>
          <NavLink to="/transactions" isActive={location.pathname === '/transactions'}>
            <FileText className="w-4 h-4 mr-2" /> Transactions
          </NavLink>
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {account ? (
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>{formatAddress(account)}</span>
            </Button>
          ) : (
            <Button onClick={connectWallet} disabled={isConnecting} size="sm">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, isActive, children }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-primary/5 text-foreground'
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;
