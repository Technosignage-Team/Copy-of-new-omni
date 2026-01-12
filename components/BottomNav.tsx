import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: 'dashboard' },
    { path: '/tickets', label: 'Tickets', icon: 'confirmation_number' },
    { path: '/users', label: 'Users', icon: 'group' },
    { path: '/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/5 px-6 pb-safe z-40 h-[80px] transition-colors duration-300">
      <div className="flex justify-between items-center h-full pb-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 w-14 transition-colors ${
              isActive(item.path) ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <span className={`material-symbols-outlined text-[26px] ${isActive(item.path) ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;