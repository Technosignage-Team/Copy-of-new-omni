
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t, isRTL } = useLanguage();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('home');
    if (path.startsWith('/tickets')) return t('tickets');
    if (path.startsWith('/ticket/')) return t('ticket_id');
    if (path.startsWith('/users') || path.startsWith('/user/')) return t('users');
    if (path.startsWith('/settings')) return t('settings');
    if (path.startsWith('/account')) return t('account');
    if (path.startsWith('/notifications')) return t('notifications');
    if (path.startsWith('/analytics')) return t('analytics');
    return 'OmniTicket';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const displayName = user?.name || 'Guest';
  const displayEmail = user?.email || 'guest@omni.ai';
  const displayAvatar = user?.avatar || 'https://ui-avatars.com/api/?name=Guest&background=random';

  return (
    <div className="sticky top-0 z-[100] w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 h-16 flex items-center justify-between px-4 md:px-8 transition-colors duration-300">
      <div className="flex items-center gap-3">
         <div className="md:hidden size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[20px]">confirmation_number</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white md:hidden">{getPageTitle()}</h2>
        <div className="hidden md:flex items-center">
             <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Language Switcher */}
        <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
        >
            <span className="material-symbols-outlined text-[18px]">language</span>
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        <button className="hidden sm:flex items-center justify-center rounded-full size-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-[24px]">search</span>
        </button>
        
        <button 
            onClick={() => navigate('/notifications')}
            className="flex items-center justify-center rounded-full size-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors relative"
        >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className={`absolute top-2 size-2 bg-red-500 rounded-full border border-white dark:border-background-dark ${isRTL ? 'left-2' : 'right-2'}`}></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5"
            >
                <div className={`flex flex-col items-end hidden md:flex ${isRTL ? 'items-start' : 'items-end'}`}>
                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">{displayName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{displayEmail}</span>
                </div>
                <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[2px]">
                    <img src={displayAvatar} alt="Profile" className="rounded-full size-full object-cover border-2 border-white dark:border-background-dark"/>
                </div>
            </button>

            {isDropdownOpen && (
                <div className={`absolute top-full mt-2 w-56 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100 overflow-hidden z-[110] ${isRTL ? 'left-0' : 'right-0'}`}>
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 md:hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{displayEmail}</p>
                    </div>
                    
                    <button 
                        onClick={() => { navigate('/account'); setIsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-3 transition-colors rtl:text-right"
                    >
                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        {t('account')}
                    </button>
                    
                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                    <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors rtl:text-right"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        {t('logout')}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TopNav;
