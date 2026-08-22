import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type User = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  biometricEnabled: boolean;
};

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

export type Theme = 'light' | 'dark';

export type GlobalError = {
  message: string;
  icon?: any;
};

type BankContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  user: User | null;
  savedUser: User | null;
  pin: string;
  accounts: Account[];
  transactions: Transaction[];
  login: (userData: User, pinCode: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  transfer: (fromId: string, to: string, amount: number, note: string) => void;
  globalError: GlobalError | null;
  showError: (message: string, icon?: any) => void;
  clearError: () => void;
  is2FAEnabled: boolean;
  setIs2FAEnabled: (enabled: boolean) => void;
  updatePin: (newPin: string) => void;
};

const THEME_STORAGE_KEY = 'nova_theme';

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.getElementById('theme-color-meta');

    if (theme === 'dark') {
      root.classList.add('dark');
      metaThemeColor?.setAttribute('content', '#0F172A');
    } else {
      root.classList.remove('dark');
      metaThemeColor?.setAttribute('content', '#F8FAFC');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const [user, setUser] = useState<User | null>(null);
  const [savedUser, setSavedUser] = useState<User | null>(null);
  const [pin, setPin] = useState<string>('1234'); // Default mock PIN
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  
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

  const login = (userData: User, pinCode: string) => {
    setUser(userData);
    setSavedUser(userData);
    if (pinCode) setPin(pinCode);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      const newUser = prev ? { ...prev, ...updates } : null;
      if (newUser) setSavedUser(newUser);
      return newUser;
    });
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

  const showError = (message: string, icon?: any, autoDismissMs: number = 4000) => {
    setGlobalError({ message, icon });
    if (autoDismissMs > 0) {
      setTimeout(() => {
        setGlobalError(null);
      }, autoDismissMs);
    }
  };

  const clearError = () => {
    setGlobalError(null);
  };

  const updatePin = (newPin: string) => {
    setPin(newPin);
  };

  return (
    <BankContext.Provider value={{ theme, setTheme, toggleTheme, user, savedUser, pin, accounts, transactions, login, logout, updateUser, transfer, globalError, showError, clearError, is2FAEnabled, setIs2FAEnabled, updatePin }}>
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
