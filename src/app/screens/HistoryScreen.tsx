import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useBank } from '../context/BankContext';
import { ArrowLeft, Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HistoryScreen = () => {
  const navigate = useNavigate();
  const { transactions } = useBank();
  
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    // Basic filter
    if (filter === 'income' && tx.amount <= 0) return false;
    if (filter === 'expense' && tx.amount >= 0) return false;
    
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchRecip = tx.recipient?.toLowerCase().includes(q) || false;
      if (!matchDesc && !matchRecip) return false;
    }
    
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const groupTransactionsByDate = () => {
    const groups: { [key: string]: typeof transactions } = {};
    
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateString = '';
      if (date.toDateString() === today.toDateString()) {
        dateString = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateString = 'Yesterday';
      } else {
        dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(tx);
    });
    
    return groups;
  };

  const groupedTx = groupTransactionsByDate();

  return (
    <div className="flex-1 flex flex-col relative bg-[#0F172A] h-full">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between min-h-[80px]">
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div key="normal-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E293B]"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="font-bold text-lg">Transactions</h1>
              <button 
                onClick={() => setIsSearching(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E293B]"
              >
                <Search size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="search-header" initial={{ opacity: 0, width: '0%' }} animate={{ opacity: 1, width: '100%' }} exit={{ opacity: 0 }} className="flex-1 flex items-center space-x-3">
              <div className="flex-1 flex items-center bg-[#1E293B] rounded-xl px-4 py-2">
                <Search size={18} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search vendor, etc." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-white text-sm placeholder-gray-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="ml-2 text-gray-400">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }} 
                className="text-sm font-medium text-[#4F46E5]"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-4 flex space-x-3 overflow-x-auto hide-scrollbar shrink-0">
        <button 
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all' ? 'bg-[#4F46E5] text-white' : 'bg-[#1E293B] text-gray-400'
          }`}
        >
          All Transactions
        </button>
        <button 
          onClick={() => setFilter('income')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'income' ? 'bg-[#4F46E5] text-white' : 'bg-[#1E293B] text-gray-400'
          }`}
        >
          Income
        </button>
        <button 
          onClick={() => setFilter('expense')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'expense' ? 'bg-[#4F46E5] text-white' : 'bg-[#1E293B] text-gray-400'
          }`}
        >
          Expense
        </button>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar space-y-6">
        {Object.entries(groupedTx).map(([date, txs], groupIndex) => (
          <motion.div 
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-wider uppercase">{date}</h3>
            <div className="bg-[#1E293B] rounded-3xl p-2">
              {txs.map((tx, index) => (
                <div 
                  key={tx.id} 
                  className={`p-3 flex items-center justify-between ${
                    index !== txs.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10'
                    }`}>
                      {tx.amount > 0 ? (
                        <ArrowDownLeft size={20} color="#22C55E" />
                      ) : (
                        <ArrowUpRight size={20} color="#EF4444" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{tx.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(tx.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {tx.recipient && ` • To ${tx.recipient}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-[#22C55E]' : 'text-white'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
        
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};
