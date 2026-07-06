import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useBank } from '../context/BankContext';
import { ArrowLeft, CheckCircle2, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TransferScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state as { amount?: string, recipient?: string, note?: string } | null;
  const { accounts, transfer } = useBank();
  
  const [amount, setAmount] = useState(prefill?.amount || '0');
  const [selectedAccount, setSelectedAccount] = useState(accounts[0].id);
  const [recipient, setRecipient] = useState(prefill?.recipient || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [note, setNote] = useState(prefill?.note || '');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalBalance, setFinalBalance] = useState<number | null>(null);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(true);

  const activeAccount = accounts.find(a => a.id === selectedAccount);
  
  const numAmount = parseFloat(amount) || 0;
  const isInsufficient = activeAccount ? numAmount > activeAccount.balance : false;

  useEffect(() => {
    if (isSuccess) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }, [isSuccess]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const handleKeypad = (num: string) => {
    if (amount === '0') {
      if (num === '.') setAmount('0.');
      else setAmount(num);
    } else {
      if (num === '.' && amount.includes('.')) return;
      if (amount.includes('.')) {
        const [, decimal] = amount.split('.');
        if (decimal && decimal.length >= 2) return;
      }
      setAmount(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (amount.length <= 1) setAmount('0');
    else setAmount(prev => prev.slice(0, -1));
  };

  const handleTransfer = () => {
    if (numAmount > 0 && recipient && !isInsufficient && activeAccount) {
      const newBalance = activeAccount.balance - numAmount;
      setFinalBalance(newBalance);
      
      transfer(selectedAccount, recipient, numAmount, note || `Transfer via ${paymentMethod}`);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3500);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-[#0F172A] h-full" role="presentation" onClick={() => setIsAmountFocused(false)}>
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="dialog"
            aria-modal="true"
            aria-live="assertive"
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0F172A]"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center w-full px-6"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#22C55E]/20 mb-6 relative">
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                  className="absolute inset-0 rounded-full border-4 border-[#22C55E]"
                />
                <CheckCircle2 size={48} color="#22C55E" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Transfer Successful</h2>
              <p className="text-gray-400 mb-8">₹{numAmount} sent to {recipient}</p>
              
              <div className="bg-[#1E293B] w-full rounded-2xl p-6 text-center shadow-lg border border-[#334155]/50">
                <p className="text-sm text-gray-400 mb-1">New Account Balance</p>
                <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(finalBalance || 0)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center border-b border-[#1E293B]">
        <button 
          onClick={() => navigate(-1)} 
          aria-label="Go back"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E293B]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg mr-10">Transfer</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar flex flex-col">
        {/* Dual Account Switcher */}
        <div className="bg-[#1E293B] p-1 rounded-xl flex items-center mt-6 shadow-sm border border-[#334155]/30">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccount(acc.id)}
              className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${
                selectedAccount === acc.id 
                  ? 'bg-[#4F46E5] text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {acc.name}
            </button>
          ))}
        </div>

        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsAmountFocused(true); }}
          className={`w-full flex flex-col items-center justify-center py-6 px-4 rounded-3xl transition-all cursor-pointer my-4 ${
            isAmountFocused ? 'bg-[#1E293B] ring-2 ring-[#4F46E5] shadow-[0_0_20px_rgba(79,70,229,0.15)]' : 'border border-transparent hover:bg-[#1E293B]/50'
          }`}
        >
          <span className="text-indigo-400 font-bold mb-2">Amount</span>
          <div className="flex items-center justify-center relative min-w-[120px]">
            <span className={`text-4xl font-bold ${isInsufficient ? 'text-red-500' : 'text-gray-400'} mr-1`}>₹</span>
            <span className={`text-6xl tracking-tighter ${amount === '0' ? 'text-gray-400' : isInsufficient ? 'text-red-500' : 'text-white'}`} style={{ fontFamily: 'Inter', fontWeight: 600 }}>
              {amount}
            </span>
            <AnimatePresence>
              {isAmountFocused && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0] }} 
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} 
                  className="w-1 h-12 bg-[#4F46E5] ml-2 rounded-full"
                />
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence mode="wait">
            {isInsufficient ? (
              <motion.div aria-live="polite" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-1.5 mt-4 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full">
                <Info size={14} aria-hidden="true" />
                <span className="text-xs font-bold">Insufficient Balance</span>
              </motion.div>
            ) : (
              <motion.p aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400 mt-4">
                Available Balance: <span className="font-bold text-white">{formatCurrency(activeAccount?.balance || 0)}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </button>

        <div className="space-y-4">
          <div className="bg-[#1E293B] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="recipient-input" className="text-xs text-gray-400 block">To Recipient</label>
              <button onClick={() => setIsFavorite(!isFavorite)} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} className="text-yellow-400 hover:scale-110 transition-transform">
                <Star size={16} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
              </button>
            </div>
            <input 
              id="recipient-input"
              type="text" 
              placeholder="UPI ID, Account Number, or Phone" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-transparent outline-none font-medium placeholder-gray-400 mb-4 text-white"
            />
            
            <div className="pt-3 border-t border-[#334155]/50">
              <label className="text-[10px] text-gray-400 block mb-2 uppercase tracking-wider">Payment Method</label>
              <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
                {['UPI', 'IMPS', 'NEFT', 'RTGS'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      paymentMethod === method 
                        ? 'bg-[#4F46E5] text-white' 
                        : 'bg-[#0F172A] text-gray-400 border border-[#334155]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-[#1E293B] rounded-2xl p-4">
            <label htmlFor="note-input" className="text-xs text-gray-400 block mb-1">Note (Optional)</label>
            <input 
              id="note-input"
              type="text" 
              placeholder="What's this for?" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent outline-none font-medium placeholder-gray-400 text-white"
            />
          </div>
        </div>
      </div>

      {/* Bottom Fixed Area */}
      <div 
        className="bg-[#0F172A] border-t border-[#1E293B]/50 px-6 pb-6 pt-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-40 flex flex-col" 
        role="presentation"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence initial={false}>
          {isAmountFocused && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 mb-4 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button 
                    key={num} 
                    onClick={() => handleKeypad(num.toString())}
                    className="h-14 rounded-2xl text-2xl bg-[#1E293B] hover:bg-[#334155] transition-colors active:scale-95 text-white font-normal"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {num}
                  </button>
                ))}
                <button 
                  onClick={() => handleKeypad('.')}
                  className="h-14 rounded-2xl text-2xl font-bold bg-[#1E293B] hover:bg-[#334155] transition-colors active:scale-95 text-white"
                >
                  .
                </button>
                <button 
                  onClick={() => handleKeypad('0')}
                  className="h-14 rounded-2xl text-2xl bg-[#1E293B] hover:bg-[#334155] transition-colors active:scale-95 text-white font-normal"
                  style={{ fontFamily: 'Inter' }}
                >
                  0
                </button>
                <button 
                  onClick={handleDelete}
                  aria-label="Delete last digit"
                  className="h-14 rounded-2xl flex items-center justify-center bg-[#1E293B] hover:bg-[#334155] transition-colors active:scale-95 text-white"
                >
                  <ArrowLeft size={24} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => {
            if (isAmountFocused) {
              setIsAmountFocused(false);
            } else {
              handleTransfer();
            }
          }}
          disabled={(!isAmountFocused && (numAmount <= 0 || !recipient || isInsufficient))}
          className={`w-full py-4 rounded-xl font-bold transition-all ${
            numAmount > 0 && recipient && !isInsufficient
              ? 'bg-[#4F46E5] text-white active:scale-[0.98] shadow-lg shadow-[#4F46E5]/30' 
              : isAmountFocused 
                ? 'bg-[#4F46E5] text-white active:scale-[0.98] shadow-lg shadow-[#4F46E5]/30'
                : 'bg-[#1E293B] text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAmountFocused ? 'Confirm Amount' : isInsufficient ? 'Insufficient Balance' : 'Proceed to Pay'}
        </button>
      </div>

    </div>
  );
};
