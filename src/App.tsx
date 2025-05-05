
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/context/WalletContext";
import { AppThemeProvider } from "@/context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import AddExpense from "./pages/AddExpense";
import ExpenseDetail from "./pages/ExpenseDetail";
import Transactions from "./pages/Transactions";
import Invite from "./pages/Invite";
import NotFound from "./pages/NotFound";

// Initialize QueryClient
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppThemeProvider>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-group" element={<CreateGroup />} />
              <Route path="/group/:groupId" element={<GroupDetail />} />
              <Route path="/group/:groupId/add-expense" element={<AddExpense />} />
              <Route path="/expense/:expenseId" element={<ExpenseDetail />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/invite" element={<Invite />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </AppThemeProvider>
  </QueryClientProvider>
);

export default App;
