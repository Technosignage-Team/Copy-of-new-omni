
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Policy State
  const [passwordCriteria, setPasswordCriteria] = useState({
      length: false,
      upper: false,
      number: false,
      special: false
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid || !doPasswordsMatch) return;

    setIsSubmitting(true);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                }
            }
        });

        if (error) throw error;

        if (data.user && data.session) {
            // Already logged in (email confirmation might be disabled)
            showToast("Account created successfully!");
            navigate('/');
        } else {
            // Email confirmation sent
            showToast("Verification email sent!");
            navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }

    } catch (e: any) {
        showToast(e.message || "An error occurred during signup.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-background-dark font-display transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-dark overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2832&auto=format&fit=crop)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-background-dark/80 to-background-dark"></div>
        <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full">
             <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] mb-8">
                 <span className="material-symbols-outlined text-white text-[32px]">group_add</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight max-w-lg">Join the team.</h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">Create your account to start managing tickets and collaborating with your organization.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center lg:text-left">
                <button onClick={() => navigate('/login')} className="flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors gap-1 lg:hidden">
                    <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                </button>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create an account</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your details below to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative group">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm pl-11" placeholder="John Doe" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">person</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative group">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm pl-11" placeholder="name@company.com" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm pl-11" placeholder="Create a password" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.length ? 'text-green-500' : 'text-slate-500'}`}><span className="material-symbols-outlined text-[10px]">{passwordCriteria.length ? 'check_circle' : 'circle'}</span> 8+ Characters</div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.upper ? 'text-green-500' : 'text-slate-500'}`}><span className="material-symbols-outlined text-[10px]">{passwordCriteria.upper ? 'check_circle' : 'circle'}</span> Uppercase Letter</div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.number ? 'text-green-500' : 'text-slate-500'}`}><span className="material-symbols-outlined text-[10px]">{passwordCriteria.number ? 'check_circle' : 'circle'}</span> Number</div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.special ? 'text-green-500' : 'text-slate-500'}`}><span className="material-symbols-outlined text-[10px]">{passwordCriteria.special ? 'check_circle' : 'circle'}</span> Special Character</div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
                    <div className="relative group">
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm pl-11" placeholder="Confirm your password" />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">check_circle</span>
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                    {isSubmitting ? <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><span>Create Account</span><span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
                </button>
            </form>

            <div className="text-center">
                <p className="text-xs text-slate-500">Already have an account? <Link to="/login" className="text-slate-900 dark:text-slate-300 font-medium cursor-pointer hover:text-primary dark:hover:text-white transition-colors underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">Log in</Link></p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
