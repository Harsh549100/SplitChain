
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto w-full py-6 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0 space-y-2 md:space-y-0 md:space-x-6">
          <div className="text-gradient font-semibold">
            SplitChain
          </div>
          <span className="text-muted-foreground text-sm">
            Powered by Ethereum
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/dashboard" className="text-sm text-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/create-group" className="text-sm text-foreground hover:text-primary transition-colors">
            Create Group
          </Link>
        </div>
        
        <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
          Made by Harsh Shrivastava
        </div>
      </div>
    </footer>
  );
};

export default Footer;
