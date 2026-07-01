import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
  description: string;
  recipient?: string;
};

export type Account = {
  id: string;
  name: string;
  balance: number;
  number: string;
};

type BankContextType = {
  user: any;
  pin: string;
  accounts: Account[];
  transactions: Transaction[];
  login: () => void;
  logout: () => void;
  transfer: (fromId: string, to: string, amount: number, note: string) => void;
};

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{name: string} | null>(null);
  const [pin, setPin] = useState<string>('1234'); // Default mock PIN
  
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Main Salary Account', balance: 145000.00, number: '**** 4567' },
    { id: '2', name: 'Savings Account', balance: 350200.00, number: '**** 8901' }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', type: 'deposit', amount: 85000.00, date: new Date().toISOString(), description: 'Salary Deposit' },
    { id: 't2', type: 'withdrawal', amount: -450.00, date: new Date(Date.now() - 86400000).toISOString(), description: 'Coffee Shop' },
    { id: 't3', type: 'transfer', amount: -12500.00, date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Rent Payment', recipient: 'Landlord' },
    { id: 't4', type: 'deposit', amount: 1500.00, date: new Date(Date.now() - 86400000 * 4).toISOString(), description: 'UPI Transfer' },
  ]);

  const login = () => {
    setUser({ name: 'Alex Doe' });
  };

  const logout = () => {
    setUser(null);
  };

  const transfer = (fromId: string, to: string, amount: number, note: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === fromId) {
        return { ...acc, balance: acc.balance - amount };
      }
      return acc;
    }));
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'transfer',
      amount: -amount,
      date: new Date().toISOString(),
      description: note,
      recipient: to
    };
    
    setTransactions(prev => [newTx, ...prev]);
  };

  return (
    <BankContext.Provider value={{ user, pin, accounts, transactions, login, logout, transfer }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
