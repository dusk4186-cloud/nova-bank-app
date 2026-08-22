import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, ChevronRight, CheckCircle2, ShieldCheck, ArrowLeft, 
  HelpCircle, Info, Zap, AlertCircle, Copy, Check, Download, Share2
} from 'lucide-react';
import { BBPS_CONFIG, BBPSCategory, BBPSProvider } from '../config/bbpsConfig';
import { BharatBillPayLogo, BharatBillPayIcon, PoweredByBBPSBadge, PoweredByBharatConnect } from './BharatBillPayLogo';
import { useBank } from '../context/BankContext';

export type BBPSPrefillData = {
  providerName?: string;
  identifier?: string;
  amount?: number;
  serviceLabel?: string;
  dueDate?: string;
};

interface BBPSPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: BBPSCategory;
  prefill?: BBPSPrefillData | null;
}

export const BBPSPaymentModal = ({
  isOpen,
  onClose,
  category,
  prefill
}: BBPSPaymentModalProps) => {
  const { accounts, transfer, user, theme } = useBank();
  const isDark = theme === 'dark';

  const config = BBPS_CONFIG[category] || BBPS_CONFIG.electricity;
  const CategoryIcon = config.icon;

  // Step States: 1: Select Biller, 2: Enter Identifier, 3: Review Bill, 4: Success Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<BBPSProvider | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [showHelperTip, setShowHelperTip] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Bill Data
  const [billData, setBillData] = useState<ReturnType<typeof config.mockBillGenerator> | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '1');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    txId: string;
    bbpsRef: string;
    paidAt: string;
  } | null>(null);

  // Initialize or reset flow when modal opens or prefill changes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setShowHelperTip(false);
      setIsFetching(false);
      setIsPaying(false);
      setCopiedRef(false);

      if (prefill && prefill.amount) {
        // Pre-loaded bill payment directly to Step 3
        const matchedProvider = config.providers.find(p => 
          prefill.providerName && p.name.toLowerCase().includes(prefill.providerName.toLowerCase())
        ) || config.providers[0];

        setSelectedProvider(matchedProvider);
        setIdentifier(prefill.identifier || '0824910284');

        const initialBill = config.mockBillGenerator(
          prefill.identifier || '0824910284', 
          matchedProvider, 
          user?.name
        );
        
        initialBill.amount = prefill.amount;
        if (prefill.dueDate) initialBill.dueDate = prefill.dueDate;
        
        setBillData(initialBill);
        setStep(3);
      } else {
        setSelectedProvider(null);
        setIdentifier('');
        setBillData(null);
        setStep(1);
      }
    }
  }, [isOpen, category, prefill, user?.name]);

  const activeAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const numAmount = billData?.amount || 0;
  const isInsufficient = activeAccount ? numAmount > activeAccount.balance : false;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(val));
  };

  const filteredProviders = config.providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProvider = (provider: BBPSProvider) => {
    setSelectedProvider(provider);
    setStep(2);
  };

  const handleFetchBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !selectedProvider) return;

    setIsFetching(true);
    setTimeout(() => {
      const generated = config.mockBillGenerator(identifier.trim(), selectedProvider, user?.name);
      setBillData(generated);
      setIsFetching(false);
      setStep(3);
    }, 750);
  };

  const handleExecutePayment = () => {
    if (!billData || !selectedProvider || isInsufficient || isPaying) return;

    setIsPaying(true);
    setTimeout(() => {
      const txId = `TXN${Date.now().toString().slice(-8)}`;
      const bbpsRef = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const paidAt = new Date().toLocaleString('en-IN', { 
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });

      const txDescription = prefill?.serviceLabel 
        ? `${prefill.serviceLabel} Bill Payment`
        : `${config.title.replace(' Payment', '').replace(' Bill', '')} Bill Payment`;

      {/* Execute transaction in BankContext to deduct balance & update transactions list */}
      transfer(
        selectedAccountId,
        `${selectedProvider.shortName} (Bharat Connect)`,
        billData.amount,
        txDescription
      );

      setReceiptData({ txId, bbpsRef, paidAt });
      setIsPaying(false);
      setStep(4);
    }, 1300);
  };

  const handleCopyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[85%] min-h-0 bg-white dark:bg-[#1E293B] rounded-t-3xl border-t border-slate-200 dark:border-[#334155] shadow-2xl flex flex-col overflow-hidden"
          >
          {/* Top Bharat Connect Header */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-200 dark:border-[#334155]/60 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#0F172A]/40">
            <div className="flex items-center space-x-2.5">
              {step > 1 && step < 4 && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  aria-label="Back to previous step"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors mr-1"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <div className="w-8 h-8 rounded-xl bg-[#5e30e1]/10 dark:bg-indigo-500/20 flex items-center justify-center text-[#5e30e1] dark:text-indigo-400">
                <CategoryIcon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {config.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Bill Payment Flow"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#0F172A] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="overflow-y-auto px-6 py-4 hide-scrollbar min-h-0">
            
            {/* STEP 1: Select Provider */}
            {step === 1 && (
              <div className="space-y-4 animate-fusion-fade-in pb-1">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Select Your Biller
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose from {config.providers.length}+ verified billers registered on Bharat Connect
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search biller by name or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/60 outline-none focus:ring-2 focus:ring-[#5e30e1] dark:focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Providers List */}
                <div className="space-y-2 pt-1">
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => handleSelectProvider(provider)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-[#0F172A]/70 border border-slate-200/80 dark:border-[#334155]/50 hover:border-[#5e30e1]/50 dark:hover:border-indigo-500/50 hover:bg-slate-100/80 dark:hover:bg-[#1E293B] transition-all text-left group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-center font-bold text-xs text-[#5e30e1] dark:text-indigo-400 shrink-0">
                            {provider.shortName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-[#5e30e1] dark:group-hover:text-indigo-400 transition-colors">
                              {provider.name}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {provider.region}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        No billers matching "{searchQuery}"
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-xs font-bold text-[#5e30e1] dark:text-indigo-400 hover:underline"
                      >
                        Clear Search
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Enter Identifier */}
            {step === 2 && selectedProvider && (
              <form onSubmit={handleFetchBill} className="space-y-4 animate-fusion-fade-in">
                {/* Active Biller Chip */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-slate-200 dark:border-[#334155]/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-center font-bold text-xs text-[#5e30e1] dark:text-indigo-400 shrink-0">
                      {selectedProvider.shortName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {selectedProvider.name}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {selectedProvider.region} • BBPS Verified
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#5e30e1] dark:text-indigo-400 hover:underline shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>

                {/* Identifier Input */}
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-[#334155]/60 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="bbps-identifier-input" className="text-xs text-slate-700 dark:text-slate-300 font-bold block">
                      {config.identifierLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelperTip(!showHelperTip)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center space-x-1 text-[11px] font-semibold"
                    >
                      <HelpCircle size={13} />
                      <span>Where to find?</span>
                    </button>
                  </div>

                  <input
                    id="bbps-identifier-input"
                    type={config.inputMode === 'numeric' ? 'tel' : 'text'}
                    placeholder={config.identifierPlaceholder}
                    value={identifier}
                    onChange={(e) => setIdentifier(config.inputMode === 'text' ? e.target.value.toUpperCase() : e.target.value)}
                    autoFocus
                    className="w-full bg-transparent outline-none font-bold placeholder-slate-400 dark:placeholder-gray-500 text-slate-900 dark:text-white text-base tracking-wide"
                  />

                  {/* Helper Tip Card */}
                  <AnimatePresence>
                    {showHelperTip && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start space-x-2">
                          <Info size={14} className="shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                          <p>{config.helperTip}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* BBPS Guarantee Notice */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A]/50 border border-slate-200 dark:border-[#334155]/40 flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                  <span>Instant bill fetching directly from official utility gateway.</span>
                </div>

                {/* Fetch Button */}
                <button
                  type="submit"
                  disabled={!identifier.trim() || isFetching}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 ${
                    identifier.trim() && !isFetching
                      ? 'bg-[#5e30e1] dark:bg-[#4F46E5] hover:bg-[#4d23c4] text-white active:scale-[0.98]'
                      : 'bg-slate-200 dark:bg-[#0F172A] text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isFetching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Fetching Bill from Gateway...</span>
                    </>
                  ) : (
                    <span>Fetch Bill</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Bill Summary & Payment Review */}
            {step === 3 && billData && selectedProvider && (
              <div className="space-y-4 animate-fusion-fade-in">
                {/* Main Bill Card */}
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-[#0F172A]/80 border border-slate-200 dark:border-[#334155]/60 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#334155]/50 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-center font-bold text-xs text-[#5e30e1] dark:text-indigo-400">
                        {selectedProvider.shortName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {selectedProvider.name}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {billData.consumerName} • {billData.billNumber}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                      {billData.urgencyText}
                    </span>
                  </div>

                  {/* Dynamic Category Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {billData.metrics.map((m) => (
                      <div key={m.label} className="p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155]/40">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          {m.label}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
                          {m.value}
                        </span>
                      </div>
                    ))}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155]/40">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                        Due Date
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
                        {billData.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Total Amount Banner */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#334155]/50 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Total Amount Due
                      </span>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Inter' }}>
                        {formatCurrency(billData.amount)}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      ₹0 Convenience Fee
                    </span>
                  </div>
                </div>

                {/* Source Account Selector */}
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-[#334155]/60 shadow-xs space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Pay From Account
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedAccountId === acc.id
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-[#5e30e1] dark:border-indigo-500 ring-1 ring-[#5e30e1]'
                            : 'bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#334155]/50 hover:bg-slate-100'
                        }`}
                      >
                        <p className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Bal: {formatCurrency(acc.balance)}
                        </p>
                      </button>
                    ))}
                  </div>

                  {isInsufficient && (
                    <div className="flex items-center space-x-1.5 mt-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-xl border border-red-200 dark:border-red-800/40">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>Insufficient funds in selected account.</span>
                    </div>
                  )}
                </div>

                {/* Auto-Pay Switcher */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]/60 shadow-xs flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Enable Auto-Pay for this Biller
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically settle bills 2 days before due date with zero penalty.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoPayEnabled}
                    onClick={() => setAutoPayEnabled(!autoPayEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                      autoPayEnabled ? 'bg-[#5e30e1] dark:bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoPayEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Pay CTA Button */}
                <button
                  type="button"
                  disabled={isInsufficient || isPaying}
                  onClick={handleExecutePayment}
                  className={`w-full py-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 ${
                    !isInsufficient && !isPaying
                      ? 'bg-[#5e30e1] dark:bg-[#4F46E5] hover:bg-[#4d23c4] text-white active:scale-[0.98]'
                      : 'bg-slate-200 dark:bg-[#0F172A] text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isPaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authorizing Payment with Bharat Connect...</span>
                    </>
                  ) : (
                    <span>Pay {formatCurrency(billData.amount)} via Bharat Connect</span>
                  )}
                </button>
              </div>
            )}

            {/* STEP 4: Success Receipt */}
            {step === 4 && receiptData && selectedProvider && billData && (
              <div className="py-2 text-center space-y-5 animate-fusion-fade-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#22C55E]/15 mx-auto relative">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="absolute inset-0 rounded-full border-4 border-[#22C55E]"
                  />
                  <CheckCircle2 size={44} className="text-[#22C55E]" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    Bill Payment Successful!
                  </h4>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    Instant Settlement Confirmed
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3" style={{ fontFamily: 'Inter' }}>
                    {formatCurrency(billData.amount)}
                  </p>
                </div>

                {/* Receipt Breakdown Card */}
                <div className="bg-slate-50 dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-200 dark:border-[#334155]/60 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Biller</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedProvider.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Consumer Ref</span>
                    <span className="font-bold text-slate-900 dark:text-white">{billData.billNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Paid From</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeAccount.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Paid On</span>
                    <span className="font-bold text-slate-900 dark:text-white">{receiptData.paidAt}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-[#334155]/40 flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Bharat Connect Ref ID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyRef(receiptData.bbpsRef)}
                      className="flex items-center space-x-1 font-mono font-bold text-[11px] text-[#5e30e1] dark:text-indigo-400 hover:underline"
                    >
                      <span>{receiptData.bbpsRef}</span>
                      {copiedRef ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-xl font-bold text-xs bg-[#5e30e1] dark:bg-[#4F46E5] hover:bg-[#4d23c4] text-white shadow-md transition-all active:scale-95"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Bharat Connect Footer Bar (PhonePe / NPCI Style) */}
          <div className="shrink-0 border-t border-slate-100 dark:border-[#334155]/40 bg-slate-50/80 dark:bg-[#0F172A]/80 px-4 py-1.5 flex items-center justify-center">
            <PoweredByBharatConnect isDark={isDark} />
          </div>

        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
};
