import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../constants';

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
}

export const SummaryCards = ({ income, expense, balance }: SummaryCardsProps) => {
  const cards = [
    {
      label: 'Total Balance',
      value: balance,
      icon: Wallet,
      color: 'from-brand-primary to-brand-secondary',
      textColor: 'text-white',
      isMain: true,
    },
    {
      label: 'Total Income',
      value: income,
      icon: TrendingUp,
      color: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Expense',
      value: expense,
      icon: TrendingDown,
      color: 'bg-rose-500/10 dark:bg-rose-500/20',
      iconColor: 'text-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden p-6 rounded-3xl shadow-sm ${
            card.isMain 
              ? `bg-gradient-to-br ${card.color} text-white shadow-xl shadow-brand-primary/20` 
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {card.isMain && (
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-2xl ${card.isMain ? 'bg-white/20' : card.color}`}>
              <card.icon size={24} className={card.isMain ? 'text-white' : card.iconColor} />
            </div>
          </div>

          <div>
            <p className={`text-sm font-medium mb-1 ${card.isMain ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
              {card.label}
            </p>
            <h3 className={`text-2xl font-bold tracking-tight ${card.isMain ? 'text-white' : 'text-slate-900 dark:text-slate-50'}`}>
              {formatCurrency(card.value)}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
