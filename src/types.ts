export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Food' 
  | 'Travel' 
  | 'Bills' 
  | 'Shopping' 
  | 'Salary' 
  | 'Investment' 
  | 'Entertainment' 
  | 'Health' 
  | 'Others';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
}

export interface Summary {
  balance: number;
  income: number;
  expense: number;
}
