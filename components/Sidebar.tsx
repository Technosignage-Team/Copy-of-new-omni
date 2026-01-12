
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: t('home'), icon: 'dashboard' },
    { path: '/tickets', label: t('tickets'), icon: 'confirmation_number' },
  ];

  const displayNavItems = [...navItems];
  if (user?.role === 'Admin' || user?.role === 'Agent') {
      displayNavItems.push({ path: '/analytics', label: t('analytics'), icon: 'analytics' });
  }

  const adminItems = [
      { path: '/users', label: t('users'), icon: 'group' },
      { path: '/settings', label: t('settings'), icon: 'settings' },
  ];

  return (
    <aside className={`hidden md:flex flex-col w-64 h-screen fixed top-0 bg-white dark:bg-background-dark border-slate-200 dark:border-white/5 z-50 pt-6 px-4 transition-colors duration-300 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'}`}>
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[20px]">confirmation_number</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">OmniTicket</h1>
      </div>

      <nav className="flex flex-col gap-2">
        {displayNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group font-display ${
              isActive(item.path)
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}

        {user?.role === 'Admin' && (
            <>
                <div className="my-2 border-t border-slate-100 dark:border-white/5 mx-4"></div>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Tools</p>
                {adminItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group font-display ${
                        isActive(item.path)
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                        }`}
                    >
                        <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill-1' : ''}`}>
                        {item.icon}
                        </span>
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
