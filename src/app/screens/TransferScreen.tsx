import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useBank } from '../context/BankContext';
import { 
  ArrowLeft, CheckCircle2, Info, Zap, ShieldCheck, Clock, 
  ChevronDown, ChevronUp, Building, Smartphone, AlertTriangle, X, HelpCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TransferScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state as { 
    amount?: string; 
    recipient?: string; 
    note?: string; 
    tab?: 'upi' | 'bank';
    accountNumber?: string;
    ifsc?: string;
    beneficiaryName?: string;
  } | null;

  const { accounts, transfer, theme } = useBank();
  const isDark = theme === 'dark';
  
  const [transferTab, setTransferTab] = useState<'upi' | 'bank'>(prefill?.tab || 'upi');
  const [amount, setAmount] = useState(prefill?.amount || '0');
  const [selectedAccount, setSelectedAccount] = useState(accounts[0].id);
  
  // UPI Tab Fields
  const [upiId, setUpiId] = useState(prefill?.tab === 'upi' ? (prefill?.recipient || '') : '');
  
  // Bank Tab Fields
  const [accountNumber, setAccountNumber] = useState(prefill?.accountNumber || '');
  const [ifsc, setIfsc] = useState(prefill?.ifsc || 'HDFC0001234');
  const [accountHolder, setAccountHolder] = useState(prefill?.beneficiaryName || (prefill?.tab === 'bank' ? prefill?.recipient || '' : ''));
  
  const [note, setNote] = useState(prefill?.note || '');
  
  // Smart Routing States
  const [isDowntimeSimulated, setIsDowntimeSimulated] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalBalance, setFinalBalance] = useState<number | null>(null);
  
  const [isAmountFocused, setIsAmountFocused] = useState(false);

  const activeAccount = accounts.find(a => a.id === selectedAccount);
  const numAmount = parseFloat(amount) || 0;
  const isInsufficient = activeAccount ? numAmount > activeAccount.balance : false;

  // Auto-fill or resolve bank branch name from IFSC
  const getBankBranchFromIfsc = (code: string) => {
    const clean = code.toUpperCase().trim();
    if (clean.startsWith('HDFC')) return { name: 'HDFC Bank', branch: 'Indiranagar Branch, Bengaluru', verified: true };
    if (clean.startsWith('SBIN')) return { name: 'State Bank of India', branch: 'MG Road Branch, Bengaluru', verified: true };
    if (clean.startsWith('ICIC')) return { name: 'ICICI Bank', branch: 'Koramangala Branch, Bengaluru', verified: true };
    if (clean.startsWith('UTIB')) return { name: 'Axis Bank', branch: 'Brigade Road, Bengaluru', verified: true };
    if (clean.startsWith('KKBK')) return { name: 'Kotak Mahindra Bank', branch: 'Lavelle Road, Bengaluru', verified: true };
    if (clean.length === 11) return { name: 'Verified Bank', branch: 'National Clearing Branch', verified: true };
    return { name: '', branch: '', verified: false };
  };

  const bankInfo = getBankBranchFromIfsc(ifsc);

  // Compute Smart Route
  const getSmartRoute = () => {
    if (transferTab === 'upi') {
      return {
        rail: 'UPI',
        speed: 'Instant (2-3s)',
        badge: 'Instant UPI 2.0',
        badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
        icon: Zap,
        iconColor: 'text-emerald-500',
        title: 'UPI Instant Settlement',
        description: 'Auto-routed via NPCI UPI 2.0 gateway with zero processing fee.',
        limit: 'Limit: ₹1,00,000 / transfer',
        isHighValue: false,
        isFallback: false
      };
    }

    if (isDowntimeSimulated) {
      return {
        rail: 'NEFT',
        speed: '30–45 mins (Batch)',
        badge: 'Standard Transfer (Gateway Fallback)',
        badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
        icon: Clock,
        iconColor: 'text-amber-500',
        title: 'NEFT Batch Settlement',
        description: 'IMPS rail experiencing high traffic. Smart router seamlessly switched to RBI NEFT batches.',
        limit: 'No minimum • No upper limit',
        isHighValue: false,
        isFallback: true
      };
    }

    if (numAmount > 500000) {
      return {
        rail: 'RTGS',
        speed: 'Instant (Gross Real-Time)',
        badge: 'Auto-Upgraded to RTGS',
        badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
        icon: ShieldCheck,
        iconColor: 'text-indigo-500',
        title: 'High-Value RTGS Settlement',
        description: 'Amount exceeds ₹5 Lakh IMPS limit. Smart router upgraded to RBI Real-Time Gross Settlement.',
        limit: 'Min: ₹2 Lakh • No Upper Limit',
        isHighValue: true,
        isFallback: false
      };
    } else if (numAmount >= 200000) {
      return {
        rail: 'IMPS',
        speed: 'Instant (24/7)',
        badge: 'Smart Routed via IMPS',
        badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
        icon: Zap,
        iconColor: 'text-indigo-500',
        title: 'IMPS High-Speed Rail',
        description: 'Optimal high-speed tunnel selected for instant ₹2L–₹5L settlement (RTGS eligible).',
        limit: 'Up to ₹5 Lakh / transfer',
        isHighValue: false,
        isFallback: false
      };
    } else {
      return {
        rail: 'IMPS',
        speed: 'Instant (24/7)',
        badge: 'Auto-Routed via IMPS',
        badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
        icon: Zap,
        iconColor: 'text-emerald-500',
        title: 'IMPS Instant Rail',
        description: 'Auto-routed via 24x7 instant IMPS rail. Immediate beneficiary account credit.',
        limit: 'Up to ₹5 Lakh / transfer',
        isHighValue: false,
        isFallback: false
      };
    }
  };

  const activeRoute = getSmartRoute();

  const effectiveRecipient = transferTab === 'upi' 
    ? (upiId.trim() || 'UPI Beneficiary') 
    : (accountHolder.trim() ? `${accountHolder} (${bankInfo.name || 'Bank A/C'})` : 'Bank Beneficiary');

  const cleanAccountDigits = accountNumber.replace(/\D/g, '');
  const isAccountNumberValid = cleanAccountDigits.length >= 9 && cleanAccountDigits.length <= 18;
  const isIfscValid = ifsc.trim().length === 11;
  const isAccountHolderValid = accountHolder.trim().length >= 3;

  const isUpiValid = () => {
    const clean = upiId.trim();
    if (/^\d{10}$/.test(clean)) return true; // 10 digit mobile
    if (clean.includes('@') && clean.length >= 5 && clean.indexOf('@') > 0 && clean.indexOf('@') < clean.length - 1) return true;
    return false;
  };

  const isFormValid = () => {
    if (numAmount <= 0 || isInsufficient) return false;
    if (transferTab === 'upi') {
      return isUpiValid();
    } else {
      return isAccountNumberValid && isIfscValid && isAccountHolderValid;
    }
  };

  const getCtaButtonText = () => {
    if (isAmountFocused) {
      return numAmount > 0 && !isInsufficient ? 'Confirm Amount' : 'Enter Amount';
    }
    if (numAmount <= 0) return 'Enter Amount';
    if (isInsufficient) return 'Insufficient Balance';
    
    if (transferTab === 'upi') {
      if (!upiId.trim()) return 'Enter UPI ID or Mobile Number';
      if (!isUpiValid()) return 'Enter Valid UPI ID or 10-Digit Mobile';
      return `Pay ${formatCurrency(numAmount)} via UPI`;
    } else {
      if (!accountNumber.trim()) return 'Enter Account Number';
      if (cleanAccountDigits.length < 9) return `Enter Min 9 Digits (${cleanAccountDigits.length}/9)`;
      if (!ifsc.trim() || ifsc.trim().length < 11) return 'Enter 11-Digit IFSC Code';
      if (!accountHolder.trim() || accountHolder.trim().length < 3) return 'Enter Account Holder Name';
      return `Pay ${formatCurrency(numAmount)} via ${activeRoute.rail}`;
    }
  };

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(val));
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
    if (isFormValid() && activeAccount) {
      setIsProcessing(true);
      setTimeout(() => {
        const newBalance = activeAccount.balance - numAmount;
        setFinalBalance(newBalance);
        
        transfer(
          selectedAccount, 
          effectiveRecipient, 
          numAmount, 
          note || `Transfer via ${activeRoute.rail}`
        );
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3200);
      }, 1400);
    }
  };

  return (
    <div 
      className={`flex-1 flex flex-col relative ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'} h-full transition-colors duration-200`} 
      role="presentation" 
      onClick={() => setIsAmountFocused(false)}
    >
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center w-full px-6 text-center"
            >
              <div className={`w-20 h-20 rounded-full border-4 ${isDark ? 'border-indigo-500/20 border-t-[#4F46E5]' : 'border-[#5e30e1]/20 border-t-[#5e30e1]'} animate-spin mb-6`} />
              <h2 className="text-xl font-bold mb-2">Executing Smart Transfer...</h2>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Routed securely via <span className="font-bold text-slate-900 dark:text-white">{activeRoute.rail}</span> gateway
              </p>
            </motion.div>
          </motion.div>
        )}

        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="dialog"
            aria-modal="true"
            aria-live="assertive"
            className={`absolute inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
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
              <h2 className="text-2xl font-bold mb-1">Transfer Successful</h2>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                Settled via {activeRoute.rail} ({activeRoute.speed})
              </p>
              <p className="text-slate-500 dark:text-gray-400 text-center mb-8">
                {formatCurrency(numAmount)} sent to {effectiveRecipient}
              </p>
              
              <div className="bg-white dark:bg-[#1E293B] w-full rounded-2xl p-6 text-center shadow-md border border-slate-200 dark:border-[#334155]/50">
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">New Account Balance</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Inter' }}>
                  {formatCurrency(finalBalance || 0)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center border-b border-slate-200 dark:border-[#1E293B]">
        <button 
          onClick={() => navigate(-1)} 
          aria-label="Go back"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-transparent text-slate-700 dark:text-white shadow-xs hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg mr-10">Transfer Money</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar flex flex-col space-y-4">
        
        {/* Source Account Switcher */}
        <div className="bg-white dark:bg-[#1E293B] p-1.5 rounded-2xl flex items-center mt-4 shadow-xs border border-slate-200 dark:border-[#334155]/40">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccount(acc.id)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                selectedAccount === acc.id 
                  ? `${isDark ? 'bg-[#4F46E5]' : 'bg-[#5e30e1]'} text-white shadow-sm` 
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {acc.name}
            </button>
          ))}
        </div>

        {/* Transfer Method Tabs (UPI / Phone vs Bank Account) */}
        <div className="bg-slate-200/70 dark:bg-[#0F172A] p-1 rounded-2xl flex items-center border border-slate-300/60 dark:border-[#334155]/60">
          <button
            type="button"
            onClick={() => setTransferTab('upi')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              transferTab === 'upi'
                ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={15} />
            <span>UPI / Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setTransferTab('bank')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              transferTab === 'bank'
                ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building size={15} />
            <span>Bank Account</span>
          </button>
        </div>

        {/* Amount Input Card */}
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsAmountFocused(true); }}
          className={`w-full flex flex-col items-center justify-center py-5 px-4 rounded-3xl transition-all cursor-pointer ${
            isAmountFocused 
              ? `${isDark ? 'bg-[#1E293B] ring-2 ring-[#4F46E5] shadow-[0_0_20px_rgba(79,70,229,0.15)]' : 'bg-white ring-2 ring-[#5e30e1] shadow-md'}` 
              : 'bg-white dark:bg-[#1E293B]/40 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-[#1E293B]/50'
          }`}
        >
          <span className={`font-bold text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-indigo-400' : 'text-[#5e30e1]'}`}>
            Transfer Amount
          </span>
          <div className="flex items-center justify-center relative min-w-[120px]">
            <span className={`text-3xl font-bold ${isInsufficient ? 'text-red-500' : 'text-slate-400 dark:text-gray-400'} mr-1`}>₹</span>
            <span className={`text-5xl tracking-tighter ${amount === '0' ? 'text-slate-400 dark:text-gray-400' : isInsufficient ? 'text-red-500' : 'text-slate-900 dark:text-white'}`} style={{ fontFamily: 'Inter', fontWeight: 600 }}>
              {amount}
            </span>
            <AnimatePresence>
              {isAmountFocused && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0] }} 
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} 
                  className={`w-1 h-10 ${isDark ? 'bg-[#4F46E5]' : 'bg-[#5e30e1]'} ml-2 rounded-full`}
                />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {isInsufficient ? (
              <motion.div aria-live="polite" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-1.5 mt-3 text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                <Info size={13} aria-hidden="true" />
                <span className="text-xs font-bold">Insufficient Balance</span>
              </motion.div>
            ) : (
              <motion.p aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Available: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(activeAccount?.balance || 0)}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </button>

        {/* Smart Routing Indicator Banner */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-[#334155]/50 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-[#0F172A] ${activeRoute.iconColor}`}>
                <activeRoute.icon size={18} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeRoute.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeRoute.badgeColor}`}>
                    {activeRoute.rail}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeRoute.speed} • ₹0 Free • {activeRoute.limit}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowRouteDetails(true)}
              aria-label="View Smart Routing Details"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0F172A] transition-colors"
            >
              <HelpCircle size={16} />
            </button>
          </div>
        </div>

        {/* Recipient Form Fields */}
        <div className="space-y-3">
          {transferTab === 'upi' ? (
            /* UPI / Phone Input */
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-[#334155]/50 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="upi-input" className="text-xs text-slate-700 dark:text-slate-300 font-bold block">
                  UPI ID or Mobile Number
                </label>
                {upiId.trim().length > 0 && (
                  <span className={`text-[10px] font-bold ${isUpiValid() ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {isUpiValid() ? '✓ Valid (UPI/Mobile)' : 'e.g. name@bank or 10 digits'}
                  </span>
                )}
              </div>
              <input 
                id="upi-input"
                type="text" 
                placeholder="e.g., alex@okaxis or 9876543210" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-transparent outline-none font-medium placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white text-sm"
              />
              {/* Quick Handle Suggestions */}
              <div className="flex space-x-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-[#334155]/40 overflow-x-auto hide-scrollbar">
                {['@okaxis', '@okhdfcbank', '@icici', '@paytm'].map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => {
                      const base = upiId.split('@')[0] || 'alex';
                      setUpiId(`${base}${handle}`);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors shrink-0"
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Bank Account Details */
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-[#334155]/50 shadow-xs space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="account-number-input" className="text-xs text-slate-700 dark:text-slate-300 font-bold block">
                    Account Number
                  </label>
                  {cleanAccountDigits.length > 0 && (
                    <span className={`text-[10px] font-bold ${isAccountNumberValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {isAccountNumberValid ? '✓ Valid (9-18 digits)' : `${cleanAccountDigits.length}/9 min digits`}
                    </span>
                  )}
                </div>
                <input 
                  id="account-number-input"
                  type="text" 
                  inputMode="numeric"
                  placeholder="Enter 9-18 digit account number" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-transparent outline-none font-medium placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#334155]/40">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="ifsc-input" className="text-xs text-slate-700 dark:text-slate-300 font-bold block">
                    IFSC Code
                  </label>
                  {ifsc.trim().length > 0 && (
                    <span className={`text-[10px] font-bold ${isIfscValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {isIfscValid ? '✓ 11 Characters' : `${ifsc.trim().length}/11`}
                    </span>
                  )}
                </div>
                <input 
                  id="ifsc-input"
                  type="text" 
                  placeholder="e.g. HDFC0001234" 
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  maxLength={11}
                  className="w-full bg-transparent outline-none font-medium placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white text-sm tracking-wider uppercase"
                />
                {bankInfo.verified && (
                  <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                    <Check size={14} className="shrink-0" />
                    <span className="truncate">{bankInfo.name} • {bankInfo.branch}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#334155]/40">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="account-holder-input" className="text-xs text-slate-700 dark:text-slate-300 font-bold block">
                    Account Holder Name
                  </label>
                  {accountHolder.trim().length > 0 && (
                    <span className={`text-[10px] font-bold ${isAccountHolderValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {isAccountHolderValid ? '✓ Entered' : 'Min 3 characters'}
                    </span>
                  )}
                </div>
                <input 
                  id="account-holder-input"
                  type="text" 
                  placeholder="Recipient's full name as per bank records" 
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full bg-transparent outline-none font-medium placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
          )}
          
          {/* Note Input */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-[#334155]/50 shadow-xs">
            <label htmlFor="note-input" className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
              Note (Optional)
            </label>
            <input 
              id="note-input"
              type="text" 
              placeholder="What's this transfer for?" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent outline-none font-medium placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bottom Fixed Action Area */}
      <div 
        className="bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-[#1E293B]/50 px-6 pb-6 pt-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-40 flex flex-col transition-colors" 
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
              <div className="grid grid-cols-3 gap-2 mb-4 mt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button 
                    key={num} 
                    type="button"
                    onClick={() => handleKeypad(num.toString())}
                    className="h-13 rounded-2xl text-2xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors active:scale-95 text-slate-900 dark:text-white font-normal"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {num}
                  </button>
                ))}
                <button 
                  type="button"
                  onClick={() => handleKeypad('.')}
                  className="h-13 rounded-2xl text-2xl font-bold bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors active:scale-95 text-slate-900 dark:text-white"
                >
                  .
                </button>
                <button 
                  type="button"
                  onClick={() => handleKeypad('0')}
                  className="h-13 rounded-2xl text-2xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors active:scale-95 text-slate-900 dark:text-white font-normal"
                  style={{ fontFamily: 'Inter' }}
                >
                  0
                </button>
                <button 
                  type="button"
                  onClick={handleDelete}
                  aria-label="Delete last digit"
                  className="h-13 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors active:scale-95 text-slate-900 dark:text-white"
                >
                  <ArrowLeft size={22} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => {
            if (isAmountFocused) {
              setIsAmountFocused(false);
            } else if (isFormValid()) {
              handleTransfer();
            }
          }}
          disabled={isAmountFocused ? (numAmount <= 0 || isInsufficient) : (!isFormValid() || isInsufficient)}
          className={`w-full py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center space-x-2 ${
            isAmountFocused
              ? numAmount > 0 && !isInsufficient
                ? `${isDark ? 'bg-[#4F46E5]' : 'bg-[#5e30e1] hover:bg-[#4d23c4]'} text-white active:scale-[0.98]`
                : 'bg-slate-200 dark:bg-[#1E293B] text-slate-400 dark:text-gray-500 cursor-not-allowed'
              : isFormValid() && !isInsufficient
                ? `${isDark ? 'bg-[#4F46E5]' : 'bg-[#5e30e1] hover:bg-[#4d23c4]'} text-white active:scale-[0.98]` 
                : 'bg-slate-200 dark:bg-[#1E293B] text-slate-400 dark:text-gray-500 cursor-not-allowed opacity-80'
          }`}
        >
          <span>{getCtaButtonText()}</span>
        </button>
      </div>

      {/* Smart Routing Details Sheet */}
      <AnimatePresence>
        {showRouteDetails && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center"
            onClick={() => setShowRouteDetails(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-[#0F172A] rounded-t-3xl p-6 border-t border-slate-200 dark:border-[#1E293B] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="text-[#5e30e1] dark:text-indigo-400" size={20} />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Nova Smart Routing</h3>
                </div>
                <button 
                  onClick={() => setShowRouteDetails(false)}
                  aria-label="Close details"
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1E293B] flex items-center justify-center text-slate-600 dark:text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                Nova Bank automates payment routing under the hood. You simply choose the recipient, and our engine dynamically selects the fastest, zero-fee rail based on RBI regulations and network health.
              </p>

              {/* Rails Comparison Table */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Payment Rails Breakdown
                </h4>
                
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]/60 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>UPI (Unified Payments Interface)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">⚡ Instant</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Input: UPI ID / Mobile • Limit: Up to ₹1L–₹5L • Fee: ₹0 Free
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]/60 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>IMPS (Immediate Payment Service)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">⚡ Instant 24x7</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Input: Account + IFSC • Limit: Up to ₹5 Lakh • Fee: ₹0 Free
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]/60 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>RTGS (Real Time Gross Settlement)</span>
                    <span className="text-indigo-600 dark:text-indigo-400">🛡️ Instant High Value</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Input: Account + IFSC • Limit: Min ₹2 Lakh / No Upper Cap • Fee: ₹0 Free
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]/60 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>NEFT (Batch Settlement)</span>
                    <span className="text-amber-600 dark:text-amber-400">⏳ 30-45 Mins</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Input: Account + IFSC • Auto fallback when IMPS is congested • Fee: ₹0 Free
                  </p>
                </div>
              </div>

              {/* Gateway Simulation Toggle for Testing Edge Cases */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#1E293B]">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/40">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Simulate IMPS Gateway Downtime</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Test automatic fallback to NEFT standard transfer</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDowntimeSimulated}
                    onClick={() => setIsDowntimeSimulated(!isDowntimeSimulated)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      isDowntimeSimulated ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isDowntimeSimulated ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
