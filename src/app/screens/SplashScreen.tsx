import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Wallet } from 'lucide-react';
import { motion } from 'motion/react';

export const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)]" style={{ backgroundColor: '#4F46E5' }}>
          <Wallet size={48} color="#FFFFFF" strokeWidth={1.5} />
        </div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-3xl font-bold tracking-tight"
        >
          Nova Bank
        </motion.h1>
      </motion.div>
      
      <div className="absolute bottom-12 w-full flex justify-center">
        <div className="w-8 h-8 border-4 border-[#1E293B] border-t-[#4F46E5] rounded-full animate-spin"></div>
      </div>
    </div>
  );
};
