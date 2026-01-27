import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-background-dark font-display transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2832&auto=format&fit=crop)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-background-dark/80 to-background-dark"></div>
        <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full">
            <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] mb-8">
                 <span className="material-symbols-outlined text-white text-[32px]">confirmation_number</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight max-w-lg">Intelligent support for modern teams.</h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">Manage tickets, automate workflows, and collaborate seamlessly with OmniTicket AI's powerful dashboard.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark transition-colors duration-300">
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your real Supabase account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm pl-11" placeholder="name@company.com" />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                            <button type="button" onClick={() => navigate('/forgot-password')} className="text-[11px] font-bold text-primary hover:text-primary-dark transition-colors">Forgot Password?</button>
                        </div>
                        <div className="relative group">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm pl-11" placeholder="••••••••" />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2 animate-in slide-in-from-top-2">
                            <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-[20px]">error</span>
                            <p className="text-xs text-red-500 dark:text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2">
                        {isSubmitting ? <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><span>Sign In</span><span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-xs text-slate-500">Don't have an account? <button onClick={() => navigate('/signup')} className="text-slate-900 dark:text-slate-300 font-medium cursor-pointer hover:text-primary dark:hover:text-white transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">Sign Up</button></p>
                </div>
            </div>
        </div>
        <div className="p-6 text-center w-full shrink-0"><p className="text-[10px] text-slate-400 dark:text-slate-600">© 2025 OmniTicket AI. All rights reserved.</p></div>
      </div>
    </div>
  );
};

export default Login;