import React from 'react';
import { Plus, Bell, Search, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { SummaryCards } from './components/SummaryCards';
import { Charts } from './components/Charts';
import { TransactionTable } from './components/TransactionTable';
import { TransactionModal } from './components/TransactionModal';
import { ThemeToggle } from './components/ThemeToggle';
import { NotificationDropdown } from './components/NotificationDropdown';
import { LoginView } from './components/LoginView';
import { Transaction } from './types';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<Transaction | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const summary = React.useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const handleAddTransaction = async (data: Omit<Transaction, 'id'> & { id?: string }) => {
    try {
      if (data.id) {
        // Edit
        const res = await fetch(`/api/transactions/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === data.id ? { ...data, id: data.id } as Transaction : t))
          );
        }
      } else {
        // Add
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const newTransaction = await res.json();
          setTransactions((prev) => [newTransaction, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to save transaction', err);
    }
    setEditData(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditData(transaction);
    setIsModalOpen(true);
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        const res = await fetch('/api/transactions', { method: 'DELETE' });
        if (res.ok) {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Failed to clear data', err);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Note'];
    const rows = transactions.map(t => [
      t.title,
      t.amount,
      t.type,
      t.category,
      t.date,
      t.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rupeeflow_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Welcome back, {user.username}! 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Here's what's happening with your money today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none focus:outline-none text-sm w-32 lg:w-48"
              />
            </div>
            <NotificationDropdown />
            <ThemeToggle />
            <button
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all active:scale-95"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SummaryCards 
                income={summary.income} 
                expense={summary.expense} 
                balance={summary.balance} 
              />
              
              <Charts transactions={transactions} />
              
              <TransactionTable 
                transactions={transactions} 
                onDelete={handleDeleteTransaction}
                onEdit={handleEditTransaction}
              />
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionTable 
                transactions={transactions} 
                onDelete={handleDeleteTransaction}
                onEdit={handleEditTransaction}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Charts transactions={transactions} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 max-w-2xl"
            >
              <h3 className="text-xl font-bold mb-6">Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="font-semibold">Currency</p>
                    <p className="text-sm text-slate-500">Indian Rupee (INR)</p>
                  </div>
                  <span className="text-xl font-bold text-brand-primary">₹</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="font-semibold">Export Data</p>
                    <p className="text-sm text-slate-500">Download your transactions as CSV</p>
                  </div>
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                  <div>
                    <p className="font-semibold text-red-600 dark:text-red-400">Clear All Data</p>
                    <p className="text-sm text-red-500/70">This action cannot be undone</p>
                  </div>
                  <button 
                    onClick={handleClearAllData}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }} 
        onSave={handleAddTransaction}
        editData={editData}
      />
    </div>
  );
}
