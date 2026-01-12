
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark font-display p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

       <div className="w-full max-w-md bg-surface-dark border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm mb-8">
                A verification link has been sent to <br/> <strong className="text-white">{emailParam || 'your email'}</strong>. <br/> Please click the link in your inbox to activate your account.
            </p>

            <button 
                onClick={() => navigate('/login')}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                Back to Login
                <span className="material-symbols-outlined text-[20px]">login</span>
            </button>
       </div>
    </div>
  );
};

export default VerifyEmail;
