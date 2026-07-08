import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useBank } from '../context/BankContext';
import { CloudOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ErrorBanner = () => {
  const { globalError } = useBank();
  
  return (
    <AnimatePresence>
      {globalError && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="absolute top-4 left-4 right-4 z-[100] bg-[#EF4444] text-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
        >
          {globalError.icon ? <globalError.icon size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold text-sm leading-tight">{globalError.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileLayout = () => {
  const { showError, clearError } = useBank();

  useEffect(() => {
    const handleOffline = () => {
      showError("Oops! No internet connection. Please check your network.", CloudOff);
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center sm:p-4">
      {/* Mobile constraint container */}
      <div 
        className="w-full h-[100dvh] sm:h-[844px] sm:w-[390px] sm:rounded-[3rem] overflow-hidden relative shadow-2xl ring-1 ring-white/10 flex flex-col font-['Inter']"
        style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
      >
        <ErrorBanner />
        <Outlet />
      </div>
    </div>
  );
};
