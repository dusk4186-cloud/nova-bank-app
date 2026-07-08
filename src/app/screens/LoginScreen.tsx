import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useBank } from '../context/BankContext';
import { Wallet, ChevronRight, Fingerprint, Lock, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, savedUser: existingUser, showError, is2FAEnabled } = useBank();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'credentials' | 'otp' | 'pin' | 'biometric_setup' | 'forgot_request' | 'forgot_otp' | 'forgot_reset'>('credentials');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [enteredPin, setEnteredPin] = useState(['', '', '', '']);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [resendMethod, setResendMethod] = useState('Email');

  // Password Validation
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLengthValid = password.length >= 9 && password.length <= 12;
  const isPasswordValid = hasUpperCase && hasLowerCase && hasNumber && hasSymbol && isLengthValid;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((step === 'otp' || step === 'forgot_otp') && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const isFormValid = () => {
    if (mode === 'forgot_password') return email.trim().length > 0;
    if (mode === 'login') {
      if (authMethod === 'email') return email.trim().length > 0 && password.length > 0;
      if (authMethod === 'phone') return phone.replace(/\D/g, '').length >= 10;
    } else {
      return name.trim().length > 0 && email.trim().length > 0 && phone.replace(/\D/g, '').length >= 10 && isPasswordValid;
    }
    return false;
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      if (mode === 'forgot_password') {
        setStep('forgot_otp');
        setTimeLeft(60);
        setFailedAttempts(0);
        setIsLockedOut(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        if (mode === 'login' && authMethod === 'email' && is2FAEnabled) {
          setStep('otp');
          setTimeLeft(60);
          setFailedAttempts(0);
          setIsLockedOut(false);
          setOtp(['', '', '', '', '', '']);
        } else if (mode === 'login' && authMethod === 'email' && !is2FAEnabled) {
          executeLogin();
        } else {
          setStep('otp');
          setTimeLeft(60);
          setFailedAttempts(0);
          setIsLockedOut(false);
          setOtp(['', '', '', '', '', '']);
        }
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
  };

  const handlePasteOTP = () => {
    const mockOTP = '123456';
    setOtp(mockOTP.split(''));
    document.getElementById('otp-5')?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) {
      showError("Maximum attempts reached. Inputs locked out.");
      return;
    }
    
    if (otp.join('').length === 6) {
      const codeStr = otp.join('');
      
      if (mode === 'forgot_password') {
        if (codeStr === '123456') {
          setStep('forgot_reset');
          setFailedAttempts(0);
          setPassword('');
          setConfirmPassword('');
        } else {
          const newFails = failedAttempts + 1;
          setFailedAttempts(newFails);
          if (newFails >= 3) {
            setIsLockedOut(true);
            showError("Maximum attempts reached. Inputs locked out.");
          } else {
            showError(`Incorrect OTP. Please try again. (${3 - newFails} attempts left)`);
          }
        }
      } else if (mode === 'login') {
        if ((authMethod === 'phone' || (authMethod === 'email' && is2FAEnabled)) && codeStr !== '123456') {
          const newFails = failedAttempts + 1;
          setFailedAttempts(newFails);
          if (newFails >= 3) {
            setIsLockedOut(true);
            showError("Maximum attempts reached. Inputs locked out.");
          } else {
            showError(`Incorrect OTP. Please try again. (${3 - newFails} attempts left)`);
          }
          return;
        }
        executeLogin();
      } else if (mode === 'register') {
        setStep('pin');
      }
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword && isPasswordValid) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMode('login');
        setStep('credentials');
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    } else if (password !== confirmPassword) {
      showError("Passwords do not match");
    }
  };

  const executeLogin = (bioPref = biometricEnabled) => {
    const finalName = mode === 'register' ? name : (existingUser?.name || name || 'Alex Doe');
    const finalEmail = email || existingUser?.email || 'alex@example.com';
    const finalPhone = phone || existingUser?.phone || '9876543210';
    
    login({
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      password: password,
      biometricEnabled: bioPref
    }, enteredPin.join(''));
    navigate('/dashboard');
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newPin = [...enteredPin];
    newPin[index] = value;
    setEnteredPin(newPin);
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...enteredPin];
      if (enteredPin[index]) {
        newPin[index] = '';
        setEnteredPin(newPin);
      } else if (index > 0) {
        newPin[index - 1] = '';
        setEnteredPin(newPin);
        document.getElementById(`pin-${index - 1}`)?.focus();
      }
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.join('').length === 4) {
      if (mode === 'register') {
        setStep('biometric_setup');
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          executeLogin();
        }, 2000);
      }
    }
  };

  const handleBiometricSubmit = (enable: boolean) => {
    setBiometricEnabled(enable);
    setIsSuccess(true);
    setTimeout(() => {
      executeLogin(enable);
    }, 2000);
  };

  const handleResendConfirm = () => {
    setShowResendModal(false);
    setShowResendSuccess(true);
    setTimeout(() => {
      setShowResendSuccess(false);
      setTimeLeft(60);
    }, 2000);
  };

  const goBack = () => {
    if (step === 'biometric_setup') setStep('pin');
    else if (step === 'pin') setStep('otp');
    else if (step === 'otp') setStep('credentials');
    else if (step === 'forgot_otp') setStep('forgot_request');
    else if (step === 'forgot_reset') setStep('forgot_request');
    else if (step === 'forgot_request') {
      setMode('login');
      setStep('credentials');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-16 pb-8 h-full bg-[#0F172A] relative overflow-y-auto overflow-x-hidden hide-scrollbar">
      
      {/* Resend Modal */}
      <AnimatePresence>
        {showResendModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1E293B] rounded-[24px] w-full max-w-sm p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1 tracking-[0.4px]">How would you like to receive the OTP?</h2>
                  <p className="text-[#93A2B7] text-xs">Choose your preferred delivery method</p>
                </div>
                <button onClick={() => setShowResendModal(false)} aria-label="Close dialog" className="text-gray-400 hover:text-white -mt-8">
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {['Email', 'SMS', 'Both'].map((method) => (
                  <button 
                    key={method}
                    onClick={() => setResendMethod(method)}
                    className="w-full bg-[#0F172A] h-14 rounded-xl relative flex items-center px-4"
                  >
                    <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none transition-colors ${resendMethod === method ? 'border-[#4F46E5]' : 'border-[#334155]'}`} />
                    <div className="w-5 h-5 rounded-full border-2 border-[#475569] flex items-center justify-center mr-3">
                      {resendMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />}
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-bold tracking-[0.4px] leading-tight">{method}</p>
                      <p className="text-[#93A2B7] text-xs leading-tight">
                        {method === 'Email' ? 'alex@example.com' : method === 'SMS' ? '+91 9876543210' : 'Email and SMS'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleResendConfirm}
                className="w-full h-14 bg-[#334155] rounded-xl text-white font-bold tracking-[0.4px] hover:bg-[#475569] transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}

        {showResendSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-[#0c1222]/95 backdrop-blur-sm flex items-center justify-center flex-col"
          >
            <div className="w-20 h-20 bg-[#22C55E] rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} color="#0c1222" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-[0.4px]">OTP has been sent</h2>
            <h2 className="text-2xl font-bold text-white tracking-[0.4px]">successfully!</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0F172A]"
          >
            <motion.div 
              role="alert"
              aria-live="assertive"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[#22C55E]/20 mb-6">
                <CheckCircle2 size={48} color="#22C55E" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{mode === 'forgot_password' ? 'Password Updated!' : 'Account Created!'}</h2>
              <p className="text-gray-400">{mode === 'forgot_password' ? 'Your password has been changed successfully.' : 'Your secure Nova Bank account is ready.'}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {step !== 'credentials' && !isSuccess && (
        <button onClick={goBack} aria-label="Go back" className="absolute top-12 left-6 w-10 h-10 flex items-center justify-center bg-[#1E293B] rounded-full z-10">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
      )}

      <div className="flex-1 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#4F46E5' }}>
            <Wallet size={32} color="#FFFFFF" />
          </div>
          
          <AnimatePresence mode="wait">
            {step === 'credentials' && (
              <motion.div key="cred" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-3xl font-bold mb-2">
                  {mode === 'register' ? 'Create Account' : 'Welcome back'}
                </h1>
                <p className="text-gray-400">
                  {mode === 'register' ? 'Sign up to get started' : 'Sign in to access your account'}
                </p>
              </motion.div>
            )}
            {step === 'forgot_request' && (
              <motion.div key="f-req" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                <p className="text-gray-400">Enter your email to receive a reset code</p>
              </motion.div>
            )}
            {step === 'forgot_otp' && (
              <motion.div key="f-otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-3xl font-bold mb-2">Verify Code</h1>
                <p className="text-gray-400">Enter the 6-digit code we sent you</p>
              </motion.div>
            )}
            {step === 'forgot_reset' && (
              <motion.div key="f-reset" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
                <p className="text-gray-400">Make sure it's secure and unique</p>
              </motion.div>
            )}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
                <p className="text-gray-400">Secure your account</p>
              </motion.div>
            )}
            {step === 'pin' && (
              <motion.div key="pin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-3xl font-bold mb-2">Set up PIN</h1>
                <p className="text-gray-400">Create a 4-digit PIN for quick app access</p>
              </motion.div>
            )}
            {step === 'biometric_setup' && (
              <motion.div key="bio" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h1 className="text-3xl font-bold mb-2">Enable Biometrics</h1>
                <p className="text-gray-400">Use your fingerprint for faster and more secure logins</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          {(step === 'credentials' || step === 'forgot_request') && (
            <motion.form 
              key="cred-form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleCredentialsSubmit} 
              className="space-y-4"
            >
              {mode === 'login' && (
                <div className="flex bg-[#1E293B] rounded-xl p-1 mb-6">
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${authMethod === 'email' ? 'bg-[#4F46E5] text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Email
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${authMethod === 'phone' ? 'bg-[#4F46E5] text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Phone
                  </button>
                </div>
              )}
              
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="full-name" className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                    <input 
                      id="full-name"
                      type="text" 
                      placeholder="Alex Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border border-[#1E293B] focus:border-[#4F46E5] outline-none transition-colors bg-[#1E293B] text-white"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="phone-reg" className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
                    <div className="flex bg-[#1E293B] rounded-xl overflow-hidden border border-transparent focus-within:border-[#4F46E5] transition-colors">
                      <div className="px-4 py-4 bg-[#0F172A]/50 text-gray-400 font-medium" aria-hidden="true">+91</div>
                      <input 
                        id="phone-reg"
                        type="tel" 
                        placeholder="98765 43210" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-4 bg-transparent outline-none text-white font-medium"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              {(mode === 'register' || authMethod === 'email' || mode === 'forgot_password') && (
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="alex@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-[#1E293B] focus:border-[#4F46E5] outline-none transition-colors bg-[#1E293B] text-white"
                    required
                  />
                </div>
              )}

              {mode === 'login' && authMethod === 'phone' && (
                <div className="space-y-1">
                  <label htmlFor="phone-login" className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
                  <div className="flex bg-[#1E293B] rounded-xl overflow-hidden border border-transparent focus-within:border-[#4F46E5] transition-colors">
                    <div className="px-4 py-4 bg-[#0F172A]/50 text-gray-400 font-medium" aria-hidden="true">+91</div>
                    <input 
                      id="phone-login"
                      type="tel" 
                      placeholder="98765 43210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-4 bg-transparent outline-none text-white font-medium"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Password field - hide if logging in with phone or forgot_password mode */}
              {!(mode === 'login' && authMethod === 'phone') && mode !== 'forgot_password' && (
                <div className="space-y-1 relative">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300 ml-1">Password</label>
                  <div className="relative">
                    <input 
                      id="password"
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border border-[#1E293B] focus:border-[#4F46E5] outline-none transition-colors bg-[#1E293B] text-white pr-12"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                    </button>
                  </div>

                  {mode === 'login' && authMethod === 'email' && (
                    <div className="flex justify-end mt-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setMode('forgot_password');
                          setStep('forgot_request');
                        }}
                        className="text-sm font-medium text-[#4F46E5] hover:text-indigo-400"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {mode === 'register' && password.length > 0 && (
                    <div aria-live="polite" className="mt-3 bg-[#0F172A] p-3 rounded-lg text-xs space-y-2 border border-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className={isLengthValid ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                        <span className={isLengthValid ? "text-gray-300" : "text-gray-400"}>9 to 12 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className={hasUpperCase ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                        <span className={hasUpperCase ? "text-gray-300" : "text-gray-400"}>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className={hasLowerCase ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                        <span className={hasLowerCase ? "text-gray-300" : "text-gray-400"}>Lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className={hasNumber ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                        <span className={hasNumber ? "text-gray-300" : "text-gray-400"}>Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className={hasSymbol ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                        <span className={hasSymbol ? "text-gray-300" : "text-gray-400"}>Special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                disabled={!isFormValid()}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 mt-8 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-[#4F46E5] text-white"
              >
                <span>{mode === 'register' ? 'Sign Up' : mode === 'forgot_password' ? 'Send Code' : 'Sign In'}</span>
                <ChevronRight size={20} />
              </button>
            </motion.form>
          )}

          {(step === 'otp' || step === 'forgot_otp') && (
            <motion.form 
              key="otp-form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleOtpSubmit} 
              className="space-y-6"
            >
              <div className="mb-6 text-center">
                <p className="text-gray-300 text-base leading-relaxed">
                  Enter the 6-digit code sent to <br />
                  {(mode === 'login' || mode === 'forgot_password') && authMethod === 'email' ? (
                    <>your email <span className="text-white font-bold text-lg">{email || 'alex@example.com'}</span></>
                  ) : (
                    <span className="text-white font-bold text-lg">+91 {phone || '9876543210'}</span>
                  )}
                </p>
                <div className="mt-5 text-white font-medium">Time left: {formatTime(timeLeft)}</div>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    disabled={isLockedOut}
                    className="w-12 h-14 bg-[#1E293B] rounded-xl text-center text-xl font-bold text-white outline-none border border-transparent focus:border-[#4F46E5] transition-colors"
                  />
                ))}
              </div>

              <div className="flex justify-center mt-2">
                <button 
                  type="button" 
                  onClick={handlePasteOTP}
                  disabled={isLockedOut}
                  className="bg-[#1E293B] px-4 py-2 rounded-full text-xs font-medium text-gray-300 flex items-center gap-2 border border-[#334155] shadow-lg active:scale-95 transition-transform"
                >
                  <span className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center text-[8px]">💬</span>
                  Paste code from Messages
                </button>
              </div>

              <button 
                type="submit" 
                disabled={otp.join('').length < 6 || isLockedOut}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-[#4F46E5] text-white"
              >
                <span>Verify & Continue</span>
                <ArrowRight size={20} />
              </button>

              <div className="text-center text-sm text-[#aea79c]">
                Didn't receive code?{' '}
                <button 
                  type="button" 
                  disabled={timeLeft > 0}
                  onClick={() => setShowResendModal(true)}
                  className={`font-medium transition-colors ${timeLeft > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-[#5184e7]'}`}
                >
                  Resend
                </button>
              </div>
            </motion.form>
          )}

          {step === 'forgot_reset' && (
            <motion.form 
              key="reset-form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleResetPasswordSubmit} 
              className="space-y-4"
            >
              <div className="space-y-1 relative">
                <label htmlFor="new-password" className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                <div className="relative">
                  <input 
                    id="new-password"
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-[#1E293B] focus:border-[#4F46E5] outline-none transition-colors bg-[#1E293B] text-white pr-12"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div aria-live="polite" className="mt-3 bg-[#0F172A] p-3 rounded-lg text-xs space-y-2 border border-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={isLengthValid ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                      <span className={isLengthValid ? "text-gray-300" : "text-gray-400"}>9 to 12 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={hasUpperCase ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                      <span className={hasUpperCase ? "text-gray-300" : "text-gray-400"}>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={hasLowerCase ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                      <span className={hasLowerCase ? "text-gray-300" : "text-gray-400"}>Lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={hasNumber ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                      <span className={hasNumber ? "text-gray-300" : "text-gray-400"}>Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={hasSymbol ? "text-[#22C55E]" : "text-gray-600"} aria-hidden="true" />
                      <span className={hasSymbol ? "text-gray-300" : "text-gray-400"}>Special character (!@#$%^&*)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1 relative">
                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-300 ml-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-[#1E293B] focus:border-[#4F46E5] outline-none transition-colors bg-[#1E293B] text-white pr-12"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!isPasswordValid || password !== confirmPassword}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 mt-8 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-[#4F46E5] text-white"
              >
                <span>Update Password</span>
                <ChevronRight size={20} />
              </button>
            </motion.form>
          )}

          {step === 'pin' && (
            <motion.form 
              key="pin-form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handlePinSubmit} 
              className="space-y-6"
            >
              <div className="flex justify-center gap-4 mb-8">
                {enteredPin.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(e, i)}
                    className="w-14 h-16 bg-[#1E293B] rounded-2xl text-center text-3xl font-bold text-white outline-none border border-transparent focus:border-[#4F46E5] transition-colors"
                  />
                ))}
              </div>

              <div className="bg-[#1E293B]/50 p-4 rounded-xl flex items-start gap-3 border border-[#1E293B]">
                <ShieldCheck className="text-[#22C55E] shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your PIN is securely encrypted. We will ask for this PIN to check balances and authorize transactions.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={enteredPin.join('').length < 4}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-[#4F46E5] text-white"
              >
                <Lock size={18} />
                <span>{mode === 'register' ? 'Continue' : 'Complete Login'}</span>
              </button>
            </motion.form>
          )}

          {step === 'biometric_setup' && (
            <motion.div
              key="bio-form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-8 flex flex-col items-center pt-8"
            >
              <div className="w-24 h-24 rounded-full bg-[#1E293B] flex items-center justify-center border border-[#334155]">
                <Fingerprint size={48} className="text-indigo-400" />
              </div>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={() => handleBiometricSubmit(true)}
                  className="w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] bg-[#4F46E5] text-white"
                >
                  Enable Biometrics
                </button>
                <button 
                  onClick={() => handleBiometricSubmit(false)}
                  className="w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] bg-[#1E293B] text-gray-300 border border-[#334155] hover:bg-[#334155]"
                >
                  Skip for Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'credentials' && mode === 'login' && existingUser?.biometricEnabled && (
          <div className="mt-6 flex flex-col items-center">
            <button 
              onClick={() => { executeLogin(true); }}
              aria-label="Login with Biometrics"
              className="w-16 h-16 rounded-full border border-[#1E293B] flex items-center justify-center hover:bg-[#1E293B] transition-colors"
            >
              <Fingerprint size={32} className="text-indigo-400" aria-hidden="true" />
            </button>
            <span className="text-xs text-gray-400 mt-3">Login with Biometrics</span>
          </div>
        )}
      </div>

      {step === 'credentials' && mode !== 'forgot_password' && (
        <div className="text-center mt-auto pt-6">
          <button 
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              setPassword('');
            }}
            className="text-sm text-gray-400"
          >
            {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
            <span style={{ color: '#4F46E5' }} className="font-bold">
              {mode === 'register' ? 'Sign In' : 'Sign Up'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
