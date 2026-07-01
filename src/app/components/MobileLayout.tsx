import React from 'react';
import { Outlet } from 'react-router';

export const MobileLayout = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center sm:p-4">
      {/* Mobile constraint container */}
      <div 
        className="w-full h-[100dvh] sm:h-[844px] sm:w-[390px] sm:rounded-[3rem] overflow-hidden relative shadow-2xl ring-1 ring-white/10 flex flex-col font-['Inter']"
        style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
      >
        <Outlet />
      </div>
    </div>
  );
};
