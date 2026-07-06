import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useBank } from '../context/BankContext';
import { ArrowLeft, User, Shield, Bell, HelpCircle, LogOut, ChevronRight, Wallet, Search, CreditCard, Camera, Scan, X, Lock, Fingerprint, MessageCircle, FileText, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useBank();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSMSEnabled] = useState(true);

  // Security toggles
  const { updateUser } = useBank();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col relative bg-[#0F172A] h-full">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between z-10">
        <h1 className="font-bold text-2xl text-white">Profile</h1>
        <button 
          onClick={handleLogout}
          aria-label="Logout"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E293B] text-[#EF4444] transition-colors hover:bg-[#334155]"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 hide-scrollbar z-0">
        {/* User Card */}
        <div className="flex flex-col items-center mt-6 mb-10 relative">
          <div className="relative">
            <button aria-label="Edit Profile Image" className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#1E293B] mb-4 relative group cursor-pointer block bg-[#4F46E5] flex items-center justify-center text-white text-4xl font-bold" onClick={() => setShowEditProfile(true)}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera size={24} className="text-white" aria-hidden="true" />
              </div>
            </button>
          </div>
          <h2 className="text-xl font-bold text-white">{user?.name || 'Alex Doe'}</h2>
          <p className="text-sm text-gray-400 mt-1">{user?.phone ? `+91 ${user.phone}` : '+91 98765 43210'}</p>
          <span className="mt-3 px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold rounded-full">
            KYC Verified
          </span>
        </div>

        {/* Quick Settings */}
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Account Settings</h3>
        <div className="space-y-3 mb-8">
          <button onClick={() => setShowEditProfile(true)} className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center justify-between hover:bg-[#334155] transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-indigo-400">
                <User size={20} aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm text-white">Personal Information</p>
                <p className="text-xs text-gray-400">Update your details</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" aria-hidden="true" />
          </button>
          
          <button onClick={() => setShowSecurity(true)} className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center justify-between hover:bg-[#334155] transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                <Shield size={20} aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm text-white">Security & Privacy</p>
                <p className="text-xs text-gray-400">Change PIN, Biometrics</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" aria-hidden="true" />
          </button>
        </div>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Notifications</h3>
        <div className="bg-[#1E293B] rounded-3xl p-5 space-y-6 border border-[#334155]/50 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-gray-400" aria-hidden="true" />
              <span className="font-medium text-sm text-white">Push Notifications</span>
            </div>
            <button 
              onClick={() => setPushEnabled(!pushEnabled)}
              aria-label="Toggle Push Notifications"
              aria-pressed={pushEnabled}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${pushEnabled ? 'bg-[#4F46E5] justify-end' : 'bg-[#0F172A] border border-[#334155] justify-start'}`}
            >
              <div className={`w-4 h-4 rounded-full ${pushEnabled ? 'bg-white' : 'bg-gray-400'}`}></div>
            </button>
          </div>

          <div className="h-[1px] w-full bg-[#334155]/50"></div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="font-medium text-sm ml-8 text-white">Email Alerts</span>
            </div>
            <button 
              onClick={() => setEmailEnabled(!emailEnabled)}
              aria-label="Toggle Email Alerts"
              aria-pressed={emailEnabled}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${emailEnabled ? 'bg-[#4F46E5] justify-end' : 'bg-[#0F172A] border border-[#334155] justify-start'}`}
            >
              <div className={`w-4 h-4 rounded-full ${emailEnabled ? 'bg-white' : 'bg-gray-400'}`}></div>
            </button>
          </div>

          <div className="h-[1px] w-full bg-[#334155]/50"></div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="font-medium text-sm ml-8 text-white">SMS Alerts</span>
            </div>
            <button 
              onClick={() => setSMSEnabled(!smsEnabled)}
              aria-label="Toggle SMS Alerts"
              aria-pressed={smsEnabled}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${smsEnabled ? 'bg-[#4F46E5] justify-end' : 'bg-[#0F172A] border border-[#334155] justify-start'}`}
            >
              <div className={`w-4 h-4 rounded-full ${smsEnabled ? 'bg-white' : 'bg-gray-400'}`}></div>
            </button>
          </div>
        </div>

        <button onClick={() => setShowHelp(true)} className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center justify-between hover:bg-[#334155] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <HelpCircle size={20} aria-hidden="true" />
            </div>
            <span className="font-medium text-sm text-white">Help & Support</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" aria-hidden="true" />
        </button>

        {/* Version info */}
        <div className="text-center mt-12 mb-4">
          <p className="text-xs text-gray-400">Nova Bank v1.0.0</p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 z-50 bg-[#0F172A] flex flex-col"
          >
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-[#1E293B]">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button onClick={() => setShowEditProfile(false)} aria-label="Close edit profile" className="text-gray-400 hover:text-white">
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="full-name" className="text-xs text-gray-400 ml-1">Full Name</label>
                <input 
                  id="full-name"
                  type="text" 
                  defaultValue={user?.name || 'Alex Doe'}
                  className="w-full bg-[#1E293B] rounded-xl px-4 py-4 outline-none border border-transparent focus:border-[#4F46E5] transition-colors text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs text-gray-400 ml-1">Email Address</label>
                <input 
                  id="email"
                  type="email" 
                  defaultValue={user?.email || "alex.doe@example.com"}
                  className="w-full bg-[#1E293B] rounded-xl px-4 py-4 outline-none border border-transparent focus:border-[#4F46E5] transition-colors text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs text-gray-400 ml-1">Phone Number</label>
                <div className="flex bg-[#1E293B] rounded-xl overflow-hidden border border-transparent focus-within:border-[#4F46E5] transition-colors">
                  <div className="px-4 py-4 bg-[#0F172A]/50 text-gray-400 font-medium" aria-hidden="true">+91</div>
                  <input 
                    id="phone"
                    type="tel" 
                    defaultValue={user?.phone || "98765 43210"} 
                    className="w-full px-4 py-4 bg-transparent outline-none text-white font-medium"
                    disabled
                  />
                </div>
                <p className="text-[10px] text-gray-400 ml-1">Contact support to change registered mobile number.</p>
              </div>

              <button 
                onClick={() => setShowEditProfile(false)}
                className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-bold mt-8 transition-transform active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Modal */}
      <AnimatePresence>
        {showSecurity && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 z-50 bg-[#0F172A] flex flex-col"
          >
            <div className="px-6 pt-12 pb-4 flex items-center border-b border-[#1E293B]">
              <button onClick={() => setShowSecurity(false)} aria-label="Close security settings" className="mr-4 text-gray-400 hover:text-white">
                <ArrowLeft size={24} aria-hidden="true" />
              </button>
              <h2 className="text-xl font-bold text-white">Security & Privacy</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              
              <button className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center justify-between hover:bg-[#334155] transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-indigo-400">
                    <Lock size={20} aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-white">Change App PIN</p>
                    <p className="text-xs text-gray-400">Update your 4-digit code</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" aria-hidden="true" />
              </button>

              <div className="bg-[#1E293B] rounded-3xl p-5 space-y-6 border border-[#334155]/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Fingerprint size={20} className="text-[#22C55E]" aria-hidden="true" />
                    <div className="text-left">
                      <span className="font-medium text-sm block text-white">Biometric Login</span>
                      <span className="text-xs text-gray-400">Use fingerprint or face ID</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateUser({ biometricEnabled: !user?.biometricEnabled })}
                    aria-label="Toggle Biometric Login"
                    aria-pressed={user?.biometricEnabled}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${user?.biometricEnabled ? 'bg-[#4F46E5] justify-end' : 'bg-[#0F172A] border border-[#334155] justify-start'}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${user?.biometricEnabled ? 'bg-white' : 'bg-gray-400'}`}></div>
                  </button>
                </div>

                <div className="h-[1px] w-full bg-[#334155]/50"></div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Shield size={20} className="text-indigo-400" aria-hidden="true" />
                    <div className="text-left">
                      <span className="font-medium text-sm block text-white">Two-Factor Auth</span>
                      <span className="text-xs text-gray-400">Extra layer of security</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    aria-label="Toggle Two-Factor Auth"
                    aria-pressed={twoFactorEnabled}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${twoFactorEnabled ? 'bg-[#4F46E5] justify-end' : 'bg-[#0F172A] border border-[#334155] justify-start'}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${twoFactorEnabled ? 'bg-white' : 'bg-gray-400'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 z-50 bg-[#0F172A] flex flex-col"
          >
            <div className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-[#1E293B]">
              <h2 className="text-xl font-bold text-white">Help & Support</h2>
              <button onClick={() => setShowHelp(false)} aria-label="Close help support" className="text-gray-400 hover:text-white">
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
              
              <button className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center space-x-4 hover:bg-[#334155] transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <MessageCircle size={20} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-white">Chat with Us</p>
                  <p className="text-xs text-gray-400">Usually replies in 5 minutes</p>
                </div>
              </button>

              <button className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center space-x-4 hover:bg-[#334155] transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <Phone size={20} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-white">Call Support</p>
                  <p className="text-xs text-gray-400">Available 24/7 for emergencies</p>
                </div>
              </button>

              <button className="w-full bg-[#1E293B] rounded-2xl p-4 flex items-center space-x-4 hover:bg-[#334155] transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <FileText size={20} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-white">FAQs</p>
                  <p className="text-xs text-gray-400">Browse common questions</p>
                </div>
              </button>

            </div>
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
          <button className="flex flex-col items-center space-y-1 text-[#4F46E5]">
            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-[#4F46E5] bg-[#4F46E5] flex items-center justify-center text-white text-[10px] font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
