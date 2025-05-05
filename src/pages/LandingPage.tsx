
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Users, FileText, QrCode, Link as LinkIcon, Download, Moon, Hash, Plus, ArrowRight } from 'lucide-react';
import { initializeDemoData } from '@/utils/demoData';

const features = [
  {
    icon: <Users className="w-8 h-8 mb-4 text-splitchain-purple" />,
    title: 'Group Creation & Management',
    description: 'Create and manage groups to split expenses with friends, roommates, and colleagues.'
  },
  {
    icon: <Plus className="w-8 h-8 mb-4 text-splitchain-blue" />,
    title: 'Smart Expense Splitting',
    description: 'Split expenses equally, by percentage, or with custom amounts based on your needs.'
  },
  {
    icon: <ArrowRight className="w-8 h-8 mb-4 text-splitchain-green" />,
    title: 'One-Click USDC Settlement',
    description: 'Settle debts instantly with cryptocurrency payments using USDC stablecoin.'
  },
  {
    icon: <QrCode className="w-8 h-8 mb-4 text-splitchain-pink" />,
    title: 'QR Code Payment Requests',
    description: 'Generate scannable QR codes for quick and easy payment requests.'
  },
  {
    icon: <LinkIcon className="w-8 h-8 mb-4 text-splitchain-orange" />,
    title: 'Invite Friends via Links',
    description: 'Share invitation links to let friends join your expense groups instantly.'
  },
  {
    icon: <FileText className="w-8 h-8 mb-4 text-splitchain-purple" />,
    title: 'Transaction History',
    description: 'Track all your payments and settlements with detailed transaction records.'
  },
  {
    icon: <Download className="w-8 h-8 mb-4 text-splitchain-blue" />,
    title: 'Onchain Receipt Generation',
    description: 'Download PDF receipts of transactions for your records or reimbursements.'
  },
  {
    icon: <Moon className="w-8 h-8 mb-4 text-splitchain-green" />,
    title: 'Dark Mode & Theme Switcher',
    description: 'Customize the app appearance with different themes and accent colors.'
  },
  {
    icon: <Hash className="w-8 h-8 mb-4 text-splitchain-pink" />,
    title: 'ENS Name Resolution',
    description: 'See friendly names instead of crypto addresses for enhanced user experience.'
  }
];

const LandingPage: React.FC = () => {
  useEffect(() => {
    // Initialize demo data when landing page loads
    initializeDemoData();
  }, []);

  return (
    <Layout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-10 md:mb-0 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Split Expenses <br />
                <span className="text-gradient">On the Blockchain</span>
              </h1>
              <p className="text-lg mb-8 text-muted-foreground max-w-lg">
                SplitChain is a decentralized expense splitting app that makes it easy to share costs with friends, track balances, and settle up using cryptocurrency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-splitchain-purple hover:bg-splitchain-dark-purple">
                  <Link to="/dashboard">
                    Get Started
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/2 animate-fade-in animate-delay-200">
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="bg-gradient-to-br from-splitchain-purple/20 to-splitchain-blue/20 absolute inset-0 z-0"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-4">Track Expenses Easily</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                      <div>
                        <div className="font-medium">Dinner at Luigi's</div>
                        <div className="text-sm text-muted-foreground">Paid by Alex</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$120.00</div>
                        <div className="text-sm text-splitchain-purple">Split equally</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                      <div>
                        <div className="font-medium">Airbnb - Weekend Trip</div>
                        <div className="text-sm text-muted-foreground">Paid by Taylor</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$350.00</div>
                        <div className="text-sm text-splitchain-purple">Custom split</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                      <div>
                        <div className="font-medium">Groceries</div>
                        <div className="text-sm text-muted-foreground">Paid by Morgan</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$85.75</div>
                        <div className="text-sm text-splitchain-purple">Split equally</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to split expenses with friends, track balances, and settle up using cryptocurrency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card p-6 rounded-xl flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${100 * index}ms` }}
                >
                  {feature.icon}
                  <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto glass-card rounded-2xl p-8 md:p-12 text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Split Expenses?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
              Start splitting expenses with friends, roommates, and colleagues in a secure, transparent, and decentralized way.
            </p>
            <Button asChild size="lg" className="bg-splitchain-purple hover:bg-splitchain-dark-purple">
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LandingPage;
