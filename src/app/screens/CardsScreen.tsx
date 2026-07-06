import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useBank } from '../context/BankContext';
import { Wallet, Search, CreditCard, Shield, Settings, Eye, EyeOff, Copy, CheckCircle2, Lock, Zap, X, CreditCard as CardIcon, PowerOff, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CardsScreen = () => {
  const navigate = useNavigate();
  const { user } = useBank();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-[#0F172A]">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between z-10">
        <h1 className="text-xl font-bold">My Cards</h1>
        <button 
          onClick={() => setShowSettings(true)}
          aria-label="Card settings"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E293B] transition-transform active:scale-95"
        >
          <Settings size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-6 hide-scrollbar z-0 space-y-6">
        
        {/* Virtual Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[1.586/1] rounded-2xl p-6 overflow-hidden flex flex-col justify-between shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)' }}
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-20 rounded-full -ml-8 -mb-8 blur-xl"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-white/80 text-xs tracking-wider uppercase mb-1">Nova Bank Signature</p>
              <h3 className="font-bold text-lg text-white">Debit Card</h3>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={24} className="text-white opacity-80" />
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2">
              <p className="text-white text-2xl font-mono tracking-[0.2em] shadow-sm">
                {showCardNumber ? '4567 8901 2345 6789' : '•••• •••• •••• 6789'}
              </p>
              <button 
                onClick={() => setShowCardNumber(!showCardNumber)}
                aria-label={showCardNumber ? "Hide card number" : "Show card number"}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md"
              >
                {showCardNumber ? <EyeOff size={14} className="text-white" aria-hidden="true" /> : <Eye size={14} className="text-white" aria-hidden="true" />}
              </button>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Card Holder</p>
                <p className="text-white font-medium tracking-wide uppercase">{user?.name || 'ALEX DOE'}</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1 text-right">Valid Thru</p>
                <p className="text-white font-medium tracking-wide">12/28</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">CVV</p>
                <p className="text-white font-medium tracking-wide">{showCardNumber ? '456' : '•••'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-4"
        >
          <button 
            onClick={handleCopy}
            aria-label="Copy card details"
            className="flex-1 py-4 bg-[#1E293B] rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#334155] transition-colors"
          >
            {copied ? <CheckCircle2 size={24} className="text-green-500" aria-hidden="true" /> : <Copy size={24} className="text-indigo-400" aria-hidden="true" />}
            <span className="text-xs font-medium text-gray-300">Copy Details</span>
          </button>
          <button aria-label="Lock Card" className="flex-1 py-4 bg-[#1E293B] rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-[#334155] transition-colors">
            <Lock size={24} className="text-[#EF4444]" aria-hidden="true" />
            <span className="text-xs font-medium text-gray-300">Lock Card</span>
          </button>
        </motion.div>

        {/* Settings & Limits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1E293B] rounded-3xl p-5 space-y-5 border border-[#334155]/50"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Online Transactions</p>
                <p className="text-xs text-gray-400">Enabled for this card</p>
              </div>
            </div>
            <div className="w-12 h-6 rounded-full bg-[#4F46E5] flex items-center px-1 justify-end">
              <div className="w-4 h-4 rounded-full bg-white"></div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#334155]/50"></div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                <Shield size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">International Usage</p>
                <p className="text-xs text-gray-400">Disabled for security</p>
              </div>
            </div>
            <div className="w-12 h-6 rounded-full bg-[#0F172A] flex items-center px-1 justify-start border border-[#334155]">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-sm flex items-end justify-center"
          >
            <motion.div 
              role="dialog"
              aria-modal="true"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#1E293B] rounded-t-3xl w-full p-6 pb-12 flex flex-col relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Card Settings</h2>
                <button onClick={() => setShowSettings(false)} aria-label="Close card settings" className="text-gray-400 hover:text-white">
                  <X size={24} aria-hidden="true" />
                </button>
              </div>
              
              <div className="space-y-4">
                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-[#0F172A] hover:bg-black/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-indigo-400">
                    <ShieldAlert size={20} aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-white">Change PIN</p>
                    <p className="text-xs text-gray-400">Set a new 4-digit PIN</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-[#0F172A] hover:bg-black/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <CardIcon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Request Replacement</p>
                    <p className="text-xs text-gray-400">If your card is damaged or lost</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
                    <PowerOff size={20} />
                  </div>
                  <div className="text-left text-[#EF4444]">
                    <p className="font-bold text-sm">Block Card</p>
                    <p className="text-xs opacity-80">Temporarily or permanently disable</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full px-6 py-4 border-t z-20 backdrop-blur-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderColor: 'rgba(30, 41, 59, 0.5)' }}>
        <div className="flex justify-between items-center max-w-[280px] mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
            <Wallet size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => navigate('/history')} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
            <Search size={24} />
            <span className="text-[10px] font-medium">History</span>
          </button>
          <div className="relative -top-5">
            <button 
              aria-label="Quick Pay"
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform"
              style={{ backgroundColor: '#4F46E5' }}
            >
              <Zap size={26} color="#FFFFFF" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
          <button className="flex flex-col items-center space-y-1 text-[#4F46E5]">
            <CreditCard size={24} />
            <span className="text-[10px] font-medium">Cards</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-400 bg-[#4F46E5] flex items-center justify-center text-white text-[10px] font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
