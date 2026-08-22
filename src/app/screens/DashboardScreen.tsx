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
import { BBPSPaymentModal, BBPSPrefillData } from '../components/BBPSPaymentModal';
import { BBPSCategory, getDynamicDueDate, SERVICE_METRICS_CONFIG } from '../config/bbpsConfig';

const AccountBalanceRow = ({ acc, formatCurrency, isDark }: { acc: any, formatCurrency: (v: number) => string, isDark: boolean }) => {
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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/50 shadow-sm flex flex-col relative overflow-hidden transition-colors">
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className="font-bold text-sm text-slate-800 dark:text-gray-300">{acc.name}</p>
          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Ac No. {acc.number}</p>
        </div>
        <div className="text-right flex items-center space-x-3">
          {isRevealed ? (
            <p className="font-semibold text-xl text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Inter' }}>
              {formatCurrency(acc.balance)}
            </p>
          ) : (
            <p className="font-bold text-xl text-slate-400 dark:text-gray-400 tracking-widest mt-1">••••••</p>
          )}
          <button 
            onClick={() => setIsRevealed(!isRevealed)}
            aria-label={isRevealed ? "Hide balance" : "Show balance"}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-[#1E293B]"
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
            className={`absolute bottom-0 left-0 h-1 ${isDark ? 'bg-[#4F46E5]' : 'bg-[#5e30e1]'} z-0`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const DashboardScreen = () => {
  const navigate = useNavigate();
  const { user, accounts, pin, transactions, theme } = useBank();
  const isDark = theme === 'dark';
  
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
  
  // BBPS Payment Modal State
  const [bbpsModal, setBbpsModal] = useState<{
    isOpen: boolean;
    category: BBPSCategory;
    prefill?: BBPSPrefillData | null;
  }>({
    isOpen: false,
    category: 'electricity',
    prefill: null
  });

  const SERVICE_CATEGORY_MAP: Record<number, BBPSCategory> = {
    1: 'electricity',
    2: 'creditcard',
    3: 'gas',
    4: 'water',
    5: 'loan',
    6: 'education',
    7: 'fastag',
    8: 'travel',
    9: 'broadband',
    10: 'mobile',
    11: 'insurance',
    12: 'propertytax'
  };

  const [pendingBillModal, setPendingBillModal] = useState<{id: number, title: string, amount: number, icon: any, color: string} | null>(null);

  // Services State with Actionable Bill Metadata
  const [services, setServices] = useState([
    { id: 1, icon: Zap, label: 'Electricity', provider: 'BESCOM', subtext: 'Consumer No: 0824910284', dueDate: getDynamicDueDate(SERVICE_METRICS_CONFIG.electricity.dueInDays), urgency: 'urgent', color: 'text-yellow-500 dark:text-yellow-400', hasBill: true, pendingAmount: 1450 },
    { id: 2, icon: CreditCard, label: 'Credit Card', provider: 'HDFC Regalia', subtext: 'Card ...8821', dueDate: getDynamicDueDate(12), urgency: 'normal', color: 'text-[#5e30e1] dark:text-indigo-400', hasBill: false },
    { id: 3, icon: Flame, label: 'Gas', color: 'text-orange-500 dark:text-orange-400', hasBill: false },
    { id: 4, icon: Droplets, label: 'Water', color: 'text-cyan-500 dark:text-cyan-400', hasBill: false },
    { id: 5, icon: Landmark, label: 'Loan EMI', provider: 'HDFC Bank', subtext: 'Personal Loan ...4821', dueDate: getDynamicDueDate(SERVICE_METRICS_CONFIG.loan_emi.dueInDays), urgency: 'soon', color: 'text-red-500 dark:text-red-400', hasBill: true, pendingAmount: 12500 },
    { id: 6, icon: GraduationCap, label: 'Education', color: 'text-purple-500 dark:text-purple-400', hasBill: false },
    { id: 7, icon: Car, label: 'FASTag', color: 'text-emerald-500 dark:text-emerald-400', hasBill: false },
    { id: 8, icon: Train, label: 'Travel', color: 'text-blue-500 dark:text-blue-400', hasBill: false },
    { id: 9, icon: Wifi, label: 'Broadband', provider: 'Airtel Xstream', subtext: 'Fiber ID: 08041239', dueDate: getDynamicDueDate(SERVICE_METRICS_CONFIG.broadband.dueInDays), urgency: 'normal', color: 'text-sky-500 dark:text-sky-400', hasBill: true, pendingAmount: 899 },
    { id: 10, icon: Phone, label: 'Mobile', color: 'text-green-500 dark:text-green-400', hasBill: false },
    { id: 11, icon: HeartPulse, label: 'Insurance', color: 'text-pink-500 dark:text-pink-400', hasBill: false },
    { id: 12, icon: Building2, label: 'Property Tax', color: 'text-amber-500 dark:text-amber-400', hasBill: false },
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

  const handleBalancePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...balancePin];
      if (balancePin[index]) {
        newPin[index] = '';
        setBalancePin(newPin);
      } else if (index > 0) {
        newPin[index - 1] = '';
        setBalancePin(newPin);
        document.getElementById(`bal-pin-${index - 1}`)?.focus();
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
    const category = SERVICE_CATEGORY_MAP[service.id] || 'electricity';
    setBbpsModal({
      isOpen: true,
      category,
      prefill: service.hasBill ? {
        providerName: service.provider || service.label,
        identifier: service.subtext?.split(': ')[1] || '0824910284',
        amount: service.pendingAmount,
        serviceLabel: service.label,
        dueDate: service.dueDate
      } : null
    });
  };

  const handlePayBill = (id: number) => {
    const bill = services.find(s => s.id === id);
    if (bill) {
      const category = SERVICE_CATEGORY_MAP[bill.id] || 'electricity';
      setBbpsModal({
        isOpen: true,
        category,
        prefill: {
          providerName: bill.provider || bill.label,
          identifier: bill.subtext?.split(': ')[1] || '0824910284',
          amount: bill.pendingAmount,
          serviceLabel: bill.label,
          dueDate: bill.dueDate
        }
      });
    }
  };

  return (
    <div className={`flex-1 flex flex-col relative overflow-hidden h-full ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'} transition-colors duration-200`}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="Go to profile"
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-[#1E293B] shadow-sm cursor-pointer bg-[#5e30e1] dark:bg-[#4F46E5] flex items-center justify-center text-white font-bold"
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </button>
          <div>
            <p className="text-xs text-slate-500 dark:text-gray-400">Good morning,</p>
            <p className="text-sm font-bold">{user?.name || 'Alex Doe'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowMyQr(true)}
            aria-label="Show my QR Code"
            className="w-10 h-10 rounded-full flex items-center justify-center relative bg-white dark:bg-[#1E293B] shadow-sm border border-slate-200 dark:border-transparent transition-transform active:scale-95 text-[#5e30e1] dark:text-indigo-400"
          >
            <QrCode size={18} aria-hidden="true" />
          </button>
          <button 
            onClick={() => setShowSearch(true)}
            aria-label="Search"
            className="w-10 h-10 rounded-full flex items-center justify-center relative bg-white dark:bg-[#1E293B] shadow-sm border border-slate-200 dark:border-transparent transition-transform active:scale-95 text-slate-700 dark:text-white"
          >
            <Search size={18} aria-hidden="true" />
          </button>
          <button 
            onClick={() => {
              setShowNotifications(true);
              setHasUnreadNotifications(false);
            }}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center relative bg-white dark:bg-[#1E293B] shadow-sm border border-slate-200 dark:border-transparent transition-transform active:scale-95 text-slate-700 dark:text-white"
          >
            <Bell size={18} aria-hidden="true" />
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
            className="flex-1 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B]/80 rounded-3xl p-6 flex flex-col items-center justify-center space-y-3 transition-colors shadow-sm border border-slate-200 dark:border-[#334155]/50"
          >
            <div className="w-14 h-14 rounded-full bg-[#5e30e1]/10 dark:bg-[#4F46E5]/20 flex items-center justify-center text-[#5e30e1] dark:text-[#4F46E5]">
              <Wallet size={28} />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Check Balance</span>
          </button>
          
          <button 
            onClick={() => setShowInsights(true)}
            className="flex-1 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B]/80 rounded-3xl p-6 flex flex-col items-center justify-center space-y-3 transition-colors shadow-sm border border-slate-200 dark:border-[#334155]/50"
          >
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 dark:bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
              <PieChart size={28} />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Spending Insights</span>
          </button>
        </motion.div>

        {/* Pending Bills Highlight & Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1E293B]/40 rounded-3xl p-6 border border-slate-200 dark:border-[#1E293B] shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pending Bills</h3>
              {pendingBills.length > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
                  {pendingBills.length} Due
                </span>
              )}
            </div>
          </div>
          
          {pendingBills.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {pendingBills.map((bill) => (
                <div 
                  key={bill.id} 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-slate-200/80 dark:border-[#334155]/60 hover:border-[#5e30e1]/40 dark:hover:border-indigo-500/40 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs shrink-0">
                      <bill.icon size={22} className={bill.color} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {bill.provider || bill.label}
                        </p>
                        {bill.urgency === 'urgent' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" title="Urgent due date" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {bill.label} • <span className={bill.urgency === 'urgent' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>{bill.dueDate}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0 ml-2">
                    <div className="text-right">
                      <p className="font-bold text-sm text-slate-900 dark:text-white" style={{ fontFamily: 'Inter' }}>
                        {formatCurrency(bill.pendingAmount || 0)}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePayBill(bill.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#5e30e1] dark:bg-[#4F46E5] hover:bg-[#4d23c4] dark:hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                      aria-label={`Pay ${bill.provider || bill.label} bill of ${formatCurrency(bill.pendingAmount || 0)}`}
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 animate-fusion-fade-in">
              <div className="w-16 h-16 bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-4 relative">
                <Sparkles size={28} className="text-[#22C55E]" />
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-1">✨ You're all caught up!</h4>
              <p className="text-sm text-slate-500 dark:text-gray-400 text-center px-4">All your bills are paid up to date. You can explore other services below.</p>
            </div>
          )}
        </motion.div>

        {/* Explore Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#1E293B]/40 rounded-3xl p-6 border border-slate-200 dark:border-[#1E293B] shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Explore Services</h3>
          </div>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {displayedServices.map((item) => (
              <button 
                key={`all-${item.id}`} 
                type="button"
                onClick={() => handleServiceClick(item)}
                aria-label={`Open ${item.label} BBPS bill flow`}
                className="flex flex-col items-center space-y-2 group relative cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-[#1E293B] group-hover:bg-[#5e30e1] dark:group-hover:bg-[#4F46E5] transition-colors relative shadow-xs">
                  <item.icon size={24} className={`${item.color} group-hover:text-white transition-colors`} />
                </div>
                <span className="text-[10px] font-medium text-slate-600 dark:text-gray-300 text-center leading-tight w-full truncate px-1">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowAllServices(!showAllServices)}
            className="w-full mt-6 py-3 rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-white text-sm font-medium hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors flex items-center justify-center space-x-2"
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
          className="w-full text-left bg-gradient-to-r from-[#5e30e1] to-[#7C3AED] dark:from-[#4F46E5] dark:to-[#7C3AED] rounded-3xl p-6 relative overflow-hidden shadow-xl cursor-pointer"
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
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-sm p-6 flex flex-col items-center relative text-center border border-slate-200 dark:border-transparent shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#0F172A] mb-4`}>
                <pendingBillModal.icon size={32} className={pendingBillModal.color} />
              </div>
              <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{pendingBillModal.title} Bill Due</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">You have a pending bill generated for the current billing cycle.</p>
              
              <div className="bg-slate-100 dark:bg-[#0F172A] w-full rounded-2xl p-4 mb-6">
                <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(pendingBillModal.amount)}</p>
              </div>
              
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => handlePayBill(pendingBillModal.id)}
                  className="w-full py-4 rounded-xl bg-[#5e30e1] hover:bg-[#4d23c4] dark:bg-[#4F46E5] dark:hover:bg-indigo-600 text-white font-bold shadow-md"
                >
                  Pay Now
                </button>
                <button 
                  onClick={() => setPendingBillModal(null)}
                  className="w-full py-4 rounded-xl bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors"
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
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-[#1E293B] rounded-t-3xl w-full p-6 pb-12 flex flex-col relative min-h-[50vh] border-t border-slate-200 dark:border-[#334155]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
            >
              <button onClick={closeBalanceModal} aria-label="Close Check Balance" className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0F172A] w-8 h-8 rounded-full flex items-center justify-center">
                <X size={18} aria-hidden="true" />
              </button>
              
              {!balanceRevealed ? (
                <div className="flex flex-col items-center mt-8">
                  <ShieldCheck size={48} className="text-[#5e30e1] dark:text-indigo-400 mb-4" />
                  <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Enter UPI PIN</h2>
                  <p className="text-slate-500 dark:text-gray-400 text-sm mb-8 text-center">Enter your 4-digit PIN to securely view your account balances.</p>
                  
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
                        onKeyDown={(e) => handleBalancePinKeyDown(e, i)}
                        className={`w-14 h-16 bg-slate-100 dark:bg-[#0F172A] rounded-2xl text-center text-3xl font-bold text-slate-900 dark:text-white outline-none border transition-colors ${pinError ? 'border-red-500' : 'border-slate-300 dark:border-transparent focus:ring-2 focus:ring-[#5e30e1]/20 focus:border-[#5e30e1] dark:focus:border-indigo-400'}`}
                      />
                    ))}
                  </div>
                  <div aria-live="polite" className="h-12 flex flex-col items-center justify-center">
                    {pinError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                        <p className="text-red-500 text-sm font-medium animate-pulse">Incorrect PIN. Try again.</p>
                        <button 
                          onClick={() => {
                            closeBalanceModal();
                            navigate('/profile');
                          }}
                          className="text-[#5e30e1] dark:text-[#4F46E5] text-xs font-bold hover:underline"
                        >
                          Forgot PIN?
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Accounts</h2>
                    <span className="text-xs bg-[#5e30e1]/10 text-[#5e30e1] dark:bg-[#4F46E5]/20 dark:text-[#4F46E5] px-2 py-1 rounded font-bold">Secure View</span>
                  </div>
                  <div className="space-y-4">
                    {accounts.map(acc => (
                      <AccountBalanceRow key={acc.id} acc={acc} formatCurrency={formatCurrency} isDark={isDark} />
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-400 dark:text-gray-500 mt-6 flex justify-center items-center gap-2">
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
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-sm p-6 flex flex-col items-center relative border border-slate-200 dark:border-transparent shadow-2xl"
            >
              <button onClick={() => setShowMyQr(false)} aria-label="Close QR Code" className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={24} aria-hidden="true" />
              </button>
              <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Receive Money</h2>
              
              <div className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-slate-200 dark:border-transparent">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=alex.doe@novabank&pn=Alex%20Doe" alt="QR Code" className="w-48 h-48" />
              </div>
              
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-1">UPI ID</p>
              <p className="font-bold text-lg mb-8 tracking-wide text-slate-900 dark:text-white">alex.doe@novabank</p>
              
              <button className="w-full py-4 rounded-xl bg-[#5e30e1] hover:bg-[#4d23c4] dark:bg-[#4F46E5] dark:hover:bg-indigo-600 text-white font-bold flex items-center justify-center space-x-2 shadow-md">
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
            className="absolute inset-0 z-50 bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col"
          >
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B]">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Spending Insights</h2>
              <button onClick={() => setShowInsights(false)} aria-label="Close Insights" className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-transparent flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors shadow-sm">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <h3 className="text-slate-500 dark:text-gray-400 text-sm mb-1">Total Spent this Month</h3>
              <p className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</p>
              
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
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                        border: isDark ? 'none' : '1px solid #E2E8F0', 
                        borderRadius: '12px', 
                        color: isDark ? '#fff' : '#0F172A',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                      itemStyle={{ color: isDark ? '#fff' : '#0F172A' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold mb-2 text-slate-900 dark:text-white">Categories</h4>
                {insightsData.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-4 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-transparent shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium text-sm text-slate-800 dark:text-white">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.value)}</span>
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
            className={`absolute inset-0 z-50 ${isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'} flex flex-col`}
          >
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B]">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
              <button onClick={() => setShowNotifications(false)} aria-label="Close Notifications" className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-transparent flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors shadow-sm">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl border ${hasUnreadNotifications && notif.unread ? 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-transparent shadow-sm' : 'bg-slate-100 dark:bg-[#1E293B]/50 border-transparent'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                      {notif.title}
                      {hasUnreadNotifications && notif.unread && <span className="w-2 h-2 rounded-full bg-[#5e30e1] dark:bg-[#4F46E5]"></span>}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-gray-500">{notif.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-gray-400">{notif.desc}</p>
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
            className="absolute inset-0 z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md flex flex-col p-6"
          >
            <div className="pt-8 flex items-center space-x-3">
              <div className="flex-1 flex items-center bg-slate-100 dark:bg-[#1E293B] rounded-xl px-4 py-3 border border-slate-200 dark:border-transparent focus-within:ring-2 focus-within:ring-[#5e30e1]/20 focus-within:border-[#5e30e1]">
                <Search size={20} className="text-slate-400 dark:text-gray-400 mr-3" aria-hidden="true" />
                <input 
                  type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'Rent', 'John', '₹500'" 
                  aria-label="Search transactions"
                  className="bg-transparent outline-none flex-1 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400"
                />
              </div>
              <button onClick={() => setShowSearch(false)} className="text-sm font-medium text-[#5e30e1] dark:text-[#4F46E5]">Cancel</button>
            </div>
            
            {!searchQuery && (
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4">Try searching for</h4>
                <div className="flex flex-wrap gap-2">
                  {['Electricity Bill', 'Salary', 'Rent Payment', 'Coffee', 'Transfer to Alex'].map((tag) => (
                    <button key={tag} onClick={() => setSearchQuery(tag)} className="px-4 py-2 rounded-full bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-transparent text-sm text-slate-700 dark:text-gray-300 hover:bg-[#5e30e1] dark:hover:bg-[#4F46E5] hover:text-white transition-colors">
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
      <nav 
        aria-label="Bottom Navigation"
        className="absolute bottom-0 w-full px-6 py-4 border-t z-20 backdrop-blur-lg transition-colors duration-200" 
        style={{ 
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)', 
          borderColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#E2E8F0' 
        }}
      >
        <div className="flex justify-between items-center max-w-[280px] mx-auto">
          <button aria-label="Home" aria-current="page" className={`flex flex-col items-center space-y-1 ${isDark ? 'text-[#818cf8]' : 'text-[#5e30e1]'}`}>
            <Wallet size={24} aria-hidden="true" />
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/history')} aria-label="History" className="flex flex-col items-center space-y-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Search size={24} aria-hidden="true" />
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
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5e30e1]"
              style={{ backgroundColor: isDark ? '#4F46E5' : '#5e30e1' }}
            >
              <Scan size={26} color="#FFFFFF" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
          <button onClick={() => navigate('/cards')} aria-label="Cards" className="flex flex-col items-center space-y-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <CreditCard size={24} aria-hidden="true" />
            <span className="text-[10px] font-medium">Cards</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center space-y-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <div 
              aria-hidden="true"
              className="w-6 h-6 rounded-full overflow-hidden border flex items-center justify-center text-white text-[10px] font-bold"
              style={{ 
                backgroundColor: isDark ? '#4F46E5' : '#5e30e1',
                borderColor: isDark ? '#4F46E5' : '#5e30e1'
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Reusable BBPS Payment Modal Flow */}
      <BBPSPaymentModal
        isOpen={bbpsModal.isOpen}
        onClose={() => setBbpsModal(prev => ({ ...prev, isOpen: false }))}
        category={bbpsModal.category}
        prefill={bbpsModal.prefill}
      />
    </div>
  );
};
