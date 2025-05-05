
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center md:hidden px-4 py-3 border-b border-border">
        <MobileNav />
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold text-gradient">SplitChain</h1>
        </div>
      </div>
      <div className="hidden md:block">
        <Header />
      </div>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
