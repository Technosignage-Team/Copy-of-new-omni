import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEmailConfig, sendEmail, getAppTemplate, fillTemplate } from '../utils/email';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<'simulated' | 'sent' | 'failed'>('simulated');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const config = getEmailConfig();
    const cleanEmail = email.trim();
    const expiry = Date.now() + 3600000; 
    let baseUrl = window.location.href.split('#')[0];

    if (baseUrl.startsWith('blob:')) {
        baseUrl = baseUrl.replace('blob:', '');
    }
    
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    const resetLink = `${baseUrl}/#/reset-password?email=${encodeURIComponent(cleanEmail)}&exp=${expiry}`;
    setGeneratedLink(resetLink);

    if (config && config.resetTemplateId) {
        const appTemplate = getAppTemplate('reset_password');
        const variables = {
            to_email: cleanEmail,
            to_name: cleanEmail.split('@')[0],
            link: resetLink
        };

        const finalSubject = appTemplate ? fillTemplate(appTemplate.subject, variables) : 'Reset Password';
        const finalMessage = appTemplate ? fillTemplate(appTemplate.body, variables) : `Please reset your password here: ${resetLink}`;

        const sent = await sendEmail(config.resetTemplateId, {
            ...variables,
            subject: finalSubject,
            message: finalMessage
        });
        setEmailSentStatus(sent ? 'sent' : 'failed');
    } else {
        await new Promise(r => setTimeout(r, 1500));
        setEmailSentStatus('simulated');
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedLink);
      alert("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark font-display p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
             {isSuccess ? (
                 <div className="text-center space-y-6">
                    <div className="size-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <span className="material-symbols-outlined text-4xl">mark_email_read</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Check your email</h2>
                        <p className="text-slate-400 text-sm">
                            We've sent password reset instructions to <strong className="text-white">{email}</strong>.
                        </p>
                    </div>
                    
                    {emailSentStatus === 'failed' && (
                        <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            The email service failed to send the reset link. <br/>
                            <span className="text-slate-300">Please use the copy link button below.</span>
                        </p>
                    )}

                    <div className="p-5 bg-background-dark/50 border border-white/5 rounded-2xl mt-4 space-y-3">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Debug & Fallback</p>
                        <button 
                            onClick={copyToClipboard}
                            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors border border-white/10 text-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            Copy Reset Link
                        </button>
                        <Link 
                            to={`/reset-password?email=${encodeURIComponent(email)}&exp=${Date.now() + 3600000}`}
                            className="block w-full bg-surface-highlight hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition-colors text-sm border border-white/10"
                        >
                            Open Link Directly
                        </Link>
                    </div>

                    <div className="pt-4">
                        <p className="text-xs text-slate-500 mb-6">Did not receive the email? <button className="text-primary hover:text-white transition-colors font-bold" onClick={() => setIsSuccess(false)}>Try again</button></p>
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-white hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto px-6 py-2 rounded-full hover:bg-white/5">
                            <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Login
                        </button>
                    </div>
                 </div>
             ) : (
                <>
                    <div className="text-center mb-10">
                        <div className="size-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/10 border border-primary/20">
                            <span className="material-symbols-outlined text-3xl">lock_reset</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Reset Password</h2>
                        <p className="text-slate-400 text-base mt-2">Enter your email and we'll send you a link to reset your password.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-base pl-12 h-14"
                                    placeholder="name@company.com"
                                />
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-xl">mail</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                        >
                            {isSubmitting ? (
                            <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                            <span>Send Reset Link</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                            <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Login
                        </button>
                    </div>
                </>
             )}
        </div>
    </div>
  );
};

export default ForgotPassword;