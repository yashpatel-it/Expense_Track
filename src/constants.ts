import { Category } from './types';
import { 
  Utensils, 
  Plane, 
  Receipt, 
  ShoppingBag, 
  Wallet, 
  TrendingUp, 
  Gamepad2, 
  HeartPulse, 
  CircleEllipsis 
} from 'lucide-react';

export const CATEGORIES: { name: Category; icon: any; color: string }[] = [
  { name: 'Food', icon: Utensils, color: 'bg-orange-500' },
  { name: 'Travel', icon: Plane, color: 'bg-blue-500' },
  { name: 'Bills', icon: Receipt, color: 'bg-red-500' },
  { name: 'Shopping', icon: ShoppingBag, color: 'bg-pink-500' },
  { name: 'Salary', icon: Wallet, color: 'bg-emerald-500' },
  { name: 'Investment', icon: TrendingUp, color: 'bg-indigo-500' },
  { name: 'Entertainment', icon: Gamepad2, color: 'bg-purple-500' },
  { name: 'Health', icon: HeartPulse, color: 'bg-rose-500' },
  { name: 'Others', icon: CircleEllipsis, color: 'bg-slate-500' },
];

export const CURRENCY_SYMBOL = '₹';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
