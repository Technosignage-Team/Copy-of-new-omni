
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_NOTIFICATIONS } from '../data/mockData';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Load notifications from LocalStorage or default
    try {
        const saved = localStorage.getItem('omni_notifications');
        const allNotifications = saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
        
        if (!saved) {
            localStorage.setItem('omni_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
        }

        // Filter based on audience
        const filtered = allNotifications.filter((n: any) => {
            if (n.audience === 'All') return true;
            if (user?.role === 'Admin') return true; // Admins see everything? Or just admin things? Let's say Admins see 'All' and 'Admins' specific.
            return n.audience === user?.role;
        });

        // Sort by newest
        setNotifications(filtered.sort((a: any, b: any) => b.timestamp - a.timestamp));
    } catch (e) {
        console.error("Failed to load notifications", e);
        setNotifications(DEFAULT_NOTIFICATIONS);
    }
  }, [user]);

  const getIcon = (type: string) => {
      switch(type) {
          case 'alert': return 'error';
          case 'warning': return 'warning';
          case 'info': return 'info';
          case 'success': return 'check_circle';
          default: return 'notifications';
      }
  };

  const getColorClass = (type: string) => {
      switch(type) {
          case 'alert': return 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/30';
          case 'warning': return 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-900/30';
          case 'success': return 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-900/30';
          default: return 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-900/30';
      }
  };

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative w-full transition-colors duration-300">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 pt-6 pb-24">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Notifications</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Updates and alerts from the OmniTicket team.</p>

        {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-8 text-center bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-full mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-400">notifications_off</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">All Caught Up</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">You have no new notifications at this time.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {notifications.map(notif => (
                    <div key={notif.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex gap-4">
                        <div className={`size-12 rounded-full shrink-0 flex items-center justify-center border ${getColorClass(notif.type)}`}>
                            <span className="material-symbols-outlined text-[24px]">{getIcon(notif.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{notif.title}</h3>
                                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{formatDate(notif.timestamp)}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                            {notif.audience !== 'All' && (
                                <div className="mt-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                                        Target: {notif.audience}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
