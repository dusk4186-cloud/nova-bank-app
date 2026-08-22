import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useBank } from '../context/BankContext';
import { CloudOff, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ErrorBanner = () => {
  const { globalError, clearError } = useBank();
  
  if (!globalError) return null;
  const Icon = globalError.icon || AlertCircle;

  return (
    <AnimatePresence>
      {globalError && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 240 }}
          className="error-banner absolute top-4 left-4 right-4 z-[100] bg-[#EF4444] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-red-400/40"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon size={20} className="shrink-0 text-white" />
            <span className="font-bold text-xs leading-snug truncate">{globalError.message}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            aria-label="Dismiss notification"
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileLayout = () => {
  const { showError, clearError, theme } = useBank();

  useEffect(() => {
    const handleOffline = () => {
      // 0 autoDismissMs = persistent while offline
      showError("Oops! No internet connection. Please check your network.", CloudOff, 0);
    };
    const handleOnline = () => {
      clearError();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [showError, clearError]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-slate-200'} flex items-center justify-center sm:p-4 transition-colors duration-200`}>
      {/* Mobile constraint container */}
      <main 
        role="main"
        className="w-full h-[100dvh] sm:h-[844px] sm:w-[390px] sm:rounded-[3rem] overflow-hidden relative shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 flex flex-col font-['Inter'] transition-colors duration-200"
        style={{ 
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC', 
          color: isDark ? '#F8FAFC' : '#0F172A' 
        }}
      >
        <ErrorBanner />
        <Outlet />
      </main>
    </div>
  );
};
