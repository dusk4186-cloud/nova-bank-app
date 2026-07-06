import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useBank } from '../context/BankContext';
import { 
  Bell, Search, QrCode, CreditCard, Zap, Flame, Tv, Droplets, 
  Landmark, GraduationCap, Car, Building2, Train, MoreHorizontal,
  Wallet, PieChart, ShieldCheck, Share2, Scan, ChevronRight, X, HeartPulse, Wifi, Phone, ChevronUp, CheckCircle2, Sparkles, EyeOff, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AccountBalanceRow = ({ acc, formatCurrency }: { acc: any, formatCurrency: (v: number) => string }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isRevealed) {
      timeoutId = setTimeout(() => {
        setIsRevealed(false);
      }, 7000);
    }
    return () => clearTimeout(timeoutId);
  }, [isRevealed]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRevealed) {
        setIsRevealed(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRevealed]);

  return (
    <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#334155]/50 flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className="font-bold text-sm text-gray-300">{acc.name}</p>
          <p className="text-xs text-gray-500 mt-1">Ac No. {acc.number}</p>
        </div>
        <div className="text-right flex items-center space-x-3">
          {isRevealed ? (
            <p className="font-semibold text-xl text-white tracking-tight" style={{ fontFamily: 'Inter' }}>
              {formatCurrency(acc.balance)}
            </p>
          ) : (
            <p className="font-bold text-xl text-gray-400 tracking-widest mt-1">••••••</p>
          )}
          <button 
            onClick={() => setIsRevealed(!isRevealed)}
            aria-label={isRevealed ? "Hide balance" : "Show balance"}
            className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1E293B]"
          >
            {isRevealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 7, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-1 bg-[#4F46E5] z-0"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const DashboardScreen = () => {
  const navigate = useNavigate();
  const { user, accounts, pin, transactions } = useBank();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showMyQr, setShowMyQr] = useState(false);
  const [showCheckBalance, setShowCheckBalance] = useState(false);
  const [balancePin, setBalancePin] = useState(['', '', '', '']);
  const [balanceRevealed, setBalanceRevealed] = useState(false);
  const [pinError, setPinError] = useState(false);
  
  const [showInsights, setShowInsights] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  
  const [pendingBillModal, setPendingBillModal] = useState<{id: number, title: string, amount: number, icon: any, color: string} | null>(null);

  // Services State
  const [services, setServices] = useState([
    { id: 1, icon: Zap, label: 'Electricity', color: 'text-yellow-400', hasBill: true, pendingAmount: 1450 },
    { id: 2, icon: CreditCard, label: 'Credit Card', color: 'text-indigo-400', hasBill: false },
    { id: 3, icon: Flame, label: 'Gas', color: 'text-orange-400', hasBill: false },
    { id: 4, icon: Droplets, label: 'Water', color: 'text-cyan-400', hasBill: false },
    { id: 5, icon: Landmark, label: 'Loan EMI', color: 'text-red-400', hasBill: true, pendingAmount: 12500 },
    { id: 6, icon: GraduationCap, label: 'Education', color: 'text-purple-400', hasBill: false },
    { id: 7, icon: Car, label: 'FASTag', color: 'text-emerald-400', hasBill: false },
    { id: 8, icon: Train, label: 'Travel', color: 'text-blue-400', hasBill: false },
    { id: 9, icon: Wifi, label: 'Broadband', color: 'text-sky-400', hasBill: false },
    { id: 10, icon: Phone, label: 'Mobile', color: 'text-green-400', hasBill: false },
    { id: 11, icon: HeartPulse, label: 'Insurance', color: 'text-pink-400', hasBill: false },
    { id: 12, icon: Building2, label: 'Property Tax', color: 'text-amber-400', hasBill: false },
  ]);

  const pendingBills = services.filter(s => 
    s.hasBill && !transactions.some(tx => tx.description === `${s.label} Bill Payment`)
  );
  const displayedServices = showAllServices ? services : services.slice(0, 8);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const notifications = [
    { id: 1, title: 'Security Alert', desc: 'New login from Chrome on Windows', time: '2m ago', unread: true },
    { id: 2, title: 'Payment Reminder', desc: 'Electricity bill of ₹1,450 is due tomorrow', time: '1h ago', unread: true },
  ];

  // Auto-hide balance logic removed from global state, moved to individual AccountBalanceRow components
  
  // App Switcher/Blur logic removed from global state, moved to individual AccountBalanceRow components

  const handleBalancePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newPin = [...balancePin];
    newPin[index] = value;
    setBalancePin(newPin);
    setPinError(false);
    
    if (value && index < 3) {
      document.getElementById(`bal-pin-${index + 1}`)?.focus();
    }
    
    // Check if complete
    if (newPin.join('').length === 4) {
      if (newPin.join('') === pin) { 
        setTimeout(() => setBalanceRevealed(true), 300);
      } else {
        setPinError(true);
        setTimeout(() => {
          setBalancePin(['', '', '', '']);
          document.getElementById('bal-pin-0')?.focus();
        }, 500);
      }
    }
  };

  const closeBalanceModal = () => {
    setShowCheckBalance(false);
    setTimeout(() => {
      setBalanceRevealed(false);
      setBalancePin(['', '', '', '']);
    }, 300);
  };

  const calculateInsights = () => {
    let shopping = 0;
    let food = 0;
    let travel = 0;
    let bills = 0;
    let others = 0;
    let total = 0;

    transactions.forEach(tx => {
      if (tx.amount < 0) { // Expenses only
        const amount = Math.abs(tx.amount);
        total += amount;
        const desc = tx.description.toLowerCase();
        
        if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('flipkart') || desc.includes('mall')) shopping += amount;
        else if (desc.includes('food') || desc.includes('coffee') || desc.includes('restaurant') || desc.includes('zomato') || desc.includes('swiggy')) food += amount;
        else if (desc.includes('travel') || desc.includes('uber') || desc.includes('flight') || desc.includes('train')) travel += amount;
        else if (desc.includes('bill') || desc.includes('rent') || desc.includes('emi') || desc.includes('tax')) bills += amount;
        else others += amount;
      }
    });

    const data = [];
    if (shopping > 0) data.push({ name: 'Shopping', value: shopping, color: '#4F46E5' });
    if (food > 0) data.push({ name: 'Food', value: food, color: '#22C55E' });
    if (travel > 0) data.push({ name: 'Travel', value: travel, color: '#EAB308' });
    if (bills > 0) data.push({ name: 'Bills & Rent', value: bills, color: '#EC4899' });
    if (others > 0) data.push({ name: 'Others', value: others, color: '#8B5CF6' });

    // Fallback if no expenses
    if (data.length === 0) {
      data.push({ name: 'No Data', value: 1, color: '#334155' });
    }

    return { data, total };
  };

  const { data: insightsData, total: totalSpent } = calculateInsights();

  const handleServiceClick = (service: any) => {
    if (service.hasBill) {
      setPendingBillModal({
        id: service.id,
        title: service.label,
        amount: service.pendingAmount,
        icon: service.icon,
        color: service.color
      });
    }
  };

  const handlePayBill = (id: number) => {
    const bill = services.find(s => s.id === id);
    setPendingBillModal(null);
    if (bill) {
      navigate('/transfer', { 
        state: { 
          amount: bill.pendingAmount?.toString() || '0', 
          recipient: `${bill.label} Biller`,
          note: `${bill.label} Bill Payment`
        } 
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-[#0F172A]">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="Go to profile"
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1E293B] cursor-pointer bg-[#4F46E5] flex items-center justify-center text-white font-bold"
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </button>
          <div>
            <p className="text-xs text-gray-400">Good morning,</p>
            <p className="text-sm font-bold">{user?.name || 'Alex Doe'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowMyQr(true)}
            aria-label="Show my QR Code"
            className="w-10 h-10 rounded-full flex items-center justify-center relative bg-[#1E293B] transition-transform active:scale-95 text-indigo-400"
          >
            <QrCode size={18} aria-hidden="true" />
          </button>
          <button 
            onClick={() => setShowSearch(true)}
            aria-label="Search"
            className="w-10 h-10 rounded-full flex items-center justify-center relative bg-[#1E293B] transition-transform active:scale-95"
          >
            <Search size={18} color="#FFFFFF" aria-hidden="true" />
          </button>
          <button 
            onClick={() => {
              setShowNotifications(true);
              setHasUnreadNotifications(false);
            }}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center relative bg-[#1E293B] transition-transform active:scale-95"
          >
            <Bell size={18} color="#FFFFFF" aria-hidden="true" />
            {hasUnreadNotifications && <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }}></span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-6 hide-scrollbar z-0 space-y-8">
        
        {/* Core Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-4"
        >
          <button 
            onClick={() => { setShowCheckBalance(true); setTimeout(() => document.getElementById('bal-pin-0')?.focus(), 100); }}
            className="flex-1 bg-[#1E293B] hover:bg-[#1E293B]/80 rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 transition-colors shadow-lg border border-[#334155]/50"
          >
            <div className="w-14 h-14 rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[#4F46E5]">
              <Wallet size={28} />
            </div>
            <span className="font-bold text-sm">Check Balance</span>
          </button>
          
          <button 
            onClick={() => setShowInsights(true)}
            className="flex-1 bg-[#1E293B] hover:bg-[#1E293B]/80 rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 transition-colors shadow-lg border border-[#334155]/50"
          >
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
              <PieChart size={28} />
            </div>
            <span className="font-bold text-sm">Spending Insights</span>
          </button>
        </motion.div>

        {/* Pending Bills Highlight & Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1E293B]/40 rounded-3xl p-5 border border-[#1E293B]"
        >
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-bold text-lg">Pending Bills</h3>
          </div>
          
          {pendingBills.length > 0 ? (
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {pendingBills.map((item, idx) => (
                <button key={item.id} onClick={() => handleServiceClick(item)} className="flex flex-col items-center space-y-2 group relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#1E293B] group-hover:bg-[#4F46E5] transition-colors relative">
                    <item.icon size={24} className={`${item.color} group-hover:text-white transition-colors`} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EF4444] rounded-full border-2 border-[#0F172A]"></span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-300 text-center leading-tight w-full truncate px-1">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 animate-fusion-fade-in">
              <div className="w-16 h-16 bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-4 relative">
                <Sparkles size={28} className="text-[#22C55E]" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1">✨ You're all caught up!</h4>
              <p className="text-sm text-gray-400 text-center px-4">All your bills are paid up to date. You can explore other services below.</p>
            </div>
          )}
        </motion.div>

        {/* Explore Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#1E293B]/40 rounded-3xl p-5 border border-[#1E293B]"
        >
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-bold text-lg">Explore Services</h3>
          </div>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {displayedServices.map((item, idx) => (
              <button key={`all-${item.id}`} className="flex flex-col items-center space-y-2 group relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#1E293B] group-hover:bg-[#4F46E5] transition-colors relative">
                  <item.icon size={24} className={`${item.color} group-hover:text-white transition-colors`} />
                </div>
                <span className="text-[10px] font-medium text-gray-300 text-center leading-tight w-full truncate px-1">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowAllServices(!showAllServices)}
            className="w-full mt-6 py-3 rounded-xl bg-[#1E293B] text-sm font-medium hover:bg-[#334155] transition-colors flex items-center justify-center space-x-2"
          >
            <span>{showAllServices ? 'View Less' : 'View All Services'}</span>
            {showAllServices ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
          </button>
        </motion.div>

        {/* Quick Send Banner */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/transfer')}
          className="w-full text-left bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-3xl p-6 relative overflow-hidden shadow-xl cursor-pointer"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="font-bold text-lg mb-1 text-white">Transfer Money</h3>
              <p className="text-white/80 text-sm">Send instantly via UPI</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md text-white">
              <ChevronRight size={24} aria-hidden="true" />
            </div>
          </div>
        </motion.button>

      </div>

      {/* --- MODALS & OVERLAYS --- */}

      {/* Pending Bill Modal */}
      <AnimatePresence>
        {pendingBillModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1E293B] rounded-3xl w-full max-w-sm p-6 flex flex-col items-center relative text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-[#0F172A] mb-4`}>
                <pendingBillModal.icon size={32} className={pendingBillModal.color} />
              </div>
              <h2 className="text-xl font-bold mb-2">{pendingBillModal.title} Bill Due</h2>
              <p className="text-gray-400 text-sm mb-6">You have a pending bill generated for the current billing cycle.</p>
              
              <div className="bg-[#0F172A] w-full rounded-2xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(pendingBillModal.amount)}</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => handlePayBill(pendingBillModal.id)}
                  className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-bold"
                >
                  Pay Now
                </button>
                <button 
                  onClick={() => setPendingBillModal(null)}
                  className="w-full py-4 rounded-xl bg-[#0F172A] text-white font-medium hover:bg-[#334155] transition-colors"
                >
                  Remind Me Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check Balance Modal */}
      <AnimatePresence>
        {showCheckBalance && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-[#0F172A]/95 backdrop-blur-md flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#1E293B] rounded-t-3xl w-full p-6 pb-12 flex flex-col relative min-h-[50vh] border-t border-[#334155]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
            >
              <button onClick={closeBalanceModal} aria-label="Close Check Balance" className="absolute top-6 right-6 text-gray-400 hover:text-white bg-[#0F172A] w-8 h-8 rounded-full flex items-center justify-center">
                <X size={18} aria-hidden="true" />
              </button>
              
              {!balanceRevealed ? (
                <div className="flex flex-col items-center mt-8">
                  <ShieldCheck size={48} className="text-indigo-400 mb-4" />
                  <h2 className="text-xl font-bold mb-2 text-white">Enter UPI PIN</h2>
                  <p className="text-gray-400 text-sm mb-8 text-center">Enter your 4-digit PIN to securely view your account balances.</p>
                  
                  <div className="flex justify-center gap-4 mb-4">
                    {balancePin.map((digit, i) => (
                      <input
                        key={i}
                        id={`bal-pin-${i}`}
                        type="password"
                        aria-label={`PIN digit ${i + 1}`}
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleBalancePinChange(i, e.target.value)}
                        className={`w-14 h-16 bg-[#0F172A] rounded-2xl text-center text-3xl font-bold text-white outline-none border transition-colors ${pinError ? 'border-red-500' : 'border-transparent focus:border-indigo-400'}`}
                      />
                    ))}
                  </div>
                  <div aria-live="polite">
                    {pinError && <p className="text-red-500 text-sm animate-pulse">Incorrect PIN. Try again.</p>}
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Your Accounts</h2>
                    <span className="text-xs bg-[#4F46E5]/20 text-[#4F46E5] px-2 py-1 rounded font-bold">Secure View</span>
                  </div>
                  <div className="space-y-4">
                    {accounts.map(acc => (
                      <AccountBalanceRow key={acc.id} acc={acc} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-6 flex justify-center items-center gap-2">
                    <ShieldCheck size={14} /> End-to-end encrypted
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My QR Modal */}
      <AnimatePresence>
        {showMyQr && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1E293B] rounded-3xl w-full max-w-sm p-6 flex flex-col items-center relative"
            >
              <button onClick={() => setShowMyQr(false)} aria-label="Close QR Code" className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={24} aria-hidden="true" />
              </button>
              <h2 className="text-xl font-bold mb-6 text-white">Receive Money</h2>
              
              <div className="bg-white p-4 rounded-2xl mb-6">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=alex.doe@novabank&pn=Alex%20Doe" alt="QR Code" className="w-48 h-48" />
              </div>
              
              <p className="text-gray-400 text-sm mb-1">UPI ID</p>
              <p className="font-bold text-lg mb-8 tracking-wide">alex.doe@novabank</p>
              
              <button className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-bold flex items-center justify-center space-x-2">
                <Share2 size={18} />
                <span>Share QR Code</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spending Insights Modal */}
      <AnimatePresence>
        {showInsights && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 z-50 bg-[#0F172A] flex flex-col"
          >
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-[#1E293B]">
              <h2 className="text-xl font-bold text-white">Spending Insights</h2>
              <button onClick={() => setShowInsights(false)} aria-label="Close Insights" className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-white hover:bg-[#334155] transition-colors">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <h3 className="text-gray-400 text-sm mb-1">Total Spent this Month</h3>
              <p className="text-3xl font-bold mb-8">{formatCurrency(totalSpent)}</p>
              
              <div className="h-64 w-full mb-8 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie data={insightsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {insightsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)} 
                      contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold mb-2">Categories</h4>
                {insightsData.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-4 bg-[#1E293B] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 z-50 bg-[#0F172A] flex flex-col"
          >
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-[#1E293B]">
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <button onClick={() => setShowNotifications(false)} aria-label="Close Notifications" className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-white hover:bg-[#334155] transition-colors">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl ${hasUnreadNotifications && notif.unread ? 'bg-[#1E293B]' : 'bg-[#1E293B]/50'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      {notif.title}
                      {hasUnreadNotifications && notif.unread && <span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span>}
                    </h4>
                    <span className="text-xs text-gray-500">{notif.time}</span>
                  </div>
                  <p className="text-sm text-gray-400">{notif.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 z-50 bg-[#0F172A]/95 backdrop-blur-md flex flex-col p-6"
          >
            <div className="pt-8 flex items-center space-x-3">
              <div className="flex-1 flex items-center bg-[#1E293B] rounded-xl px-4 py-3">
                <Search size={20} className="text-gray-400 mr-3" aria-hidden="true" />
                <input 
                  type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'Rent', 'John', '₹500'" 
                  aria-label="Search transactions"
                  className="bg-transparent outline-none flex-1 text-white placeholder-gray-400"
                />
              </div>
              <button onClick={() => setShowSearch(false)} className="text-sm font-medium text-[#4F46E5]">Cancel</button>
            </div>
            
            {!searchQuery && (
              <div className="mt-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Try searching for</h4>
                <div className="flex flex-wrap gap-2">
                  {['Electricity Bill', 'Salary', 'Rent Payment', 'Coffee', 'Transfer to Alex'].map((tag) => (
                    <button key={tag} onClick={() => setSearchQuery(tag)} className="px-4 py-2 rounded-full bg-[#1E293B] text-sm text-gray-300 hover:bg-[#4F46E5] hover:text-white transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full px-6 py-4 border-t z-20 backdrop-blur-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', borderColor: 'rgba(30, 41, 59, 0.5)' }}>
        <div className="flex justify-between items-center max-w-[280px] mx-auto">
          <button className="flex flex-col items-center space-y-1 text-[#4F46E5]">
            <Wallet size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => navigate('/history')} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
            <Search size={24} />
            <span className="text-[10px] font-medium">History</span>
          </button>
          <div className="relative -top-5">
            <button 
              onClick={() => {
                const el = document.getElementById('scan-btn');
                if(el) { el.style.transform = 'scale(0.9)'; setTimeout(() => el.style.transform = 'scale(1)', 150); }
              }}
              id="scan-btn"
              aria-label="Scan QR Code"
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform"
              style={{ backgroundColor: '#4F46E5' }}
            >
              <Scan size={26} color="#FFFFFF" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
          <button onClick={() => navigate('/cards')} className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white transition-colors">
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
