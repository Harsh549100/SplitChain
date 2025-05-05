
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Plus, FileText, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="text-xl font-bold text-gradient" onClick={() => setOpen(false)}>
                SplitChain
              </Link>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            
            <nav className="flex flex-col space-y-1">
              <NavLink 
                to="/dashboard" 
                isActive={location.pathname === '/dashboard'} 
                onClick={() => setOpen(false)}
              >
                <Users className="w-4 h-4 mr-3" /> Groups
              </NavLink>
              <NavLink 
                to="/create-group" 
                isActive={location.pathname === '/create-group'} 
                onClick={() => setOpen(false)}
              >
                <Plus className="w-4 h-4 mr-3" /> New Group
              </NavLink>
              <NavLink 
                to="/transactions" 
                isActive={location.pathname === '/transactions'} 
                onClick={() => setOpen(false)}
              >
                <FileText className="w-4 h-4 mr-3" /> Transactions
              </NavLink>
            </nav>
            
            <div className="mt-auto">
              <div className="pt-6 border-t border-border">
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/about" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    About
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, isActive, children, onClick }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-primary/5 text-foreground'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default MobileNav;
