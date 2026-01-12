
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_USERS } from '../data/mockData';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const expiry = searchParams.get('exp');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'validating' | 'expired' | 'form' | 'success'>('validating');

  // Password Policy State
  const [passwordCriteria, setPasswordCriteria] = useState({
      length: false,
      upper: false,
      number: false,
      special: false
  });

  // 1. Validate Link Expiration on Mount
  useEffect(() => {
      const checkValidity = () => {
          if (!expiry) {
              // If no expiry param, we assume it's a legacy link or direct access which we can treat as valid for demo,
              // OR we could treat it as invalid. Given "valid for 1 hour only" requirement, let's treat missing as form.
              // In production, you'd likely want to invalidate it.
              setStatus('form'); 
              return;
          }

          const now = Date.now();
          const expTime = parseInt(expiry, 10);

          if (isNaN(expTime) || now > expTime) {
              setStatus('expired');
          } else {
              setStatus('form');
          }
      };
      
      checkValidity();
  }, [expiry]);

  useEffect(() => {
      setPasswordCriteria({
          length: password.length >= 8,
          upper: /[A-Z]/.test(password),
          number: /[0-9]/.test(password),
          special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      });
  }, [password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
        alert("Please ensure your password meets all security requirements.");
        return;
    }

    if (!doPasswordsMatch) {
        alert("Passwords do not match");
        return;
    }

    setIsSubmitting(true);
    
    // Simulate API delay and update
    setTimeout(() => {
        try {
            if (email) {
                // In a real app, we'd send the token to the backend.
                // Here we just mock the success state.
            }
        } catch(e) {}

        setIsSubmitting(false);
        setStatus('success');
    }, 1500);
  };

  if (status === 'validating') return <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center"><div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark font-display p-6 relative overflow-hidden transition-colors duration-300">
        
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 rounded-bl-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 rounded-tr-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
             
             {/* EXPIRED STATE */}
             {status === 'expired' && (
                 <div className="text-center space-y-8">
                     <div className="size-28 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-[6px] border-white dark:border-surface-dark shadow-xl">
                        <span className="material-symbols-outlined text-6xl">timer_off</span>
                     </div>
                     <div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Link Expired</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed max-w-sm mx-auto">
                            For your security, password reset links are valid for 1 hour only.
                        </p>
                     </div>
                     <button 
                        onClick={() => navigate('/forgot-password')}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] text-lg flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined text-2xl">refresh</span>
                        Request New Link
                    </button>
                    <button onClick={() => navigate('/login')} className="text-base font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors py-2">
                        Return to Login
                    </button>
                 </div>
             )}

             {/* SUCCESS STATE */}
             {status === 'success' && (
                 <div className="text-center space-y-8">
                    <div className="size-28 bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-[6px] border-white dark:border-surface-dark shadow-xl">
                        <span className="material-symbols-outlined text-6xl">verified_user</span>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Password Reset!</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl leading-relaxed">
                            Your password has been successfully updated. You can now log in securely.
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] text-lg flex items-center justify-center gap-3"
                    >
                        Go to Login
                        <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                    </button>
                 </div>
             )}

             {/* FORM STATE */}
             {status === 'form' && (
                <>
                    <div className="text-center mb-12">
                        <div className="size-20 bg-gradient-to-br from-primary to-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
                            <span className="material-symbols-outlined text-5xl">lock_reset</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">New Password</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            Secure your account <br/> <strong className="text-slate-900 dark:text-white font-semibold">{email}</strong>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">New Password</label>
                            <div className="relative group">
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-bold text-xl pl-14 h-16"
                                    placeholder="••••••••"
                                />
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors text-2xl">lock</span>
                            </div>
                            
                            {/* Password Guidelines */}
                            <div className="grid grid-cols-2 gap-3 mt-4 px-1">
                                <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${passwordCriteria.length ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                    <span className="material-symbols-outlined text-[16px]">{passwordCriteria.length ? 'check_circle' : 'circle'}</span>
                                    8+ Characters
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${passwordCriteria.upper ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                    <span className="material-symbols-outlined text-[16px]">{passwordCriteria.upper ? 'check_circle' : 'circle'}</span>
                                    Uppercase Letter
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${passwordCriteria.number ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                    <span className="material-symbols-outlined text-[16px]">{passwordCriteria.number ? 'check_circle' : 'circle'}</span>
                                    Number
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${passwordCriteria.special ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                    <span className="material-symbols-outlined text-[16px]">{passwordCriteria.special ? 'check_circle' : 'circle'}</span>
                                    Special Character
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                            <div className="relative group">
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all font-bold text-xl pl-14 h-16"
                                    placeholder="••••••••"
                                />
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors text-2xl">check_circle</span>
                            </div>
                            {confirmPassword && !doPasswordsMatch && (
                                <div className="flex items-center gap-2 mt-2 ml-1 text-red-500 animate-in fade-in slide-in-from-top-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg inline-flex">
                                    <span className="material-symbols-outlined text-[18px]">error</span> 
                                    <p className="text-xs font-bold">Passwords do not match</p>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-3 text-xl mt-6"
                        >
                            {isSubmitting ? (
                            <span className="size-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                            <>
                                <span>Reset Password</span>
                                <span className="material-symbols-outlined text-2xl">key</span>
                            </>
                            )}
                        </button>
                    </form>
                    
                     <div className="mt-8 text-center">
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            Cancel
                        </button>
                    </div>
                </>
             )}
        </div>
    </div>
  );
};

export default ResetPassword;
