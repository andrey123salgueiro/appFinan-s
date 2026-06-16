export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  subCategory: string;
  date: string;
  account: string; // 'Corrente' | 'Poupança' | 'Investimentos' | 'Dinheiro'
  isFixed: boolean;
  creditCardId?: string; // if spent on credit card
  installmentCurrent?: number;
  installmentTotal?: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadlineMonths: number;
  category: string;
}

export interface Budget {
  category: string;
  limit: number;
  current: number;
}

export interface CreditCard {
  id: string;
  name: string;
  limitTotal: number;
  limitUsed: number;
  closingDay: number;
  dueDay: number;
  currentInvoiceAmount: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'mensal' | 'anual';
  paused: boolean;
  category: string;
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // Member name
  splits: { [memberName: string]: number }; // percentage or share
  date: string;
}

export interface CategorizationRule {
  id: string;
  pattern: string; // e.g. "Mercado Livre"
  category: string;
  subCategory: string;
}

export interface SyncAction {
  id: string;
  type: 'ADD_TRANSACTION' | 'ADD_GOAL' | 'UPDATE_BUDGET';
  payload: any;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  date: string;
  read: boolean;
}
