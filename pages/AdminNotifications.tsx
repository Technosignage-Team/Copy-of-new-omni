
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_NOTIFICATIONS } from '../data/mockData';

const AdminNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [audience, setAudience] = useState('All');

  // Delete State
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
        const saved = localStorage.getItem('omni_notifications');
        setNotifications(saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS);
    } catch (e) {
        setNotifications(DEFAULT_NOTIFICATIONS);
    }
  }, []);

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      const newNotif = {
          id: `sys-${Date.now()}`,
          title,
          message,
          type,
          audience,
          timestamp: Date.now()
      };

      const updated = [newNotif, ...notifications];
      setNotifications(updated);
      localStorage.setItem('omni_notifications', JSON.stringify(updated));
      
      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setAudience('All');
      alert('Notification sent successfully!');
  };

  const handleDeleteTrigger = (id: string) => {
      setNotificationToDelete(id);
  };

  const confirmDelete = () => {
      if (notificationToDelete) {
          const updated = notifications.filter(n => n.id !== notificationToDelete);
          setNotifications(updated);
          localStorage.setItem('omni_notifications', JSON.stringify(updated));
          setNotificationToDelete(null);
      }
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative w-full transition-colors duration-300">
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-24">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Manage System Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Broadcast messages to your team or specific roles.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Creation Form */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm sticky top-24">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Compose Alert</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Audience</label>
                            <select 
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary"
                            >
                                <option value="All">All Users</option>
                                <option value="Admins">Admins Only</option>
                                <option value="Agents">Agents Only</option>
                                <option value="Users">Regular Users Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['info', 'warning', 'alert'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`py-2 rounded-lg text-xs font-bold capitalize border transition-all ${type === t 
                                            ? 'bg-primary text-white border-primary' 
                                            : 'bg-slate-50 dark:bg-background-dark text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-primary/50'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Title</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400"
                                placeholder="e.g. System Maintenance"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Message</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-400 resize-none"
                                placeholder="Enter your message here..."
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            Broadcast Notification
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Alerts History</h3>
                        <span className="text-xs font-mono text-slate-500">{notifications.length} Total</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No active notifications.</div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className="p-5 flex items-start gap-4 group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className={`p-2 rounded-lg shrink-0 ${notif.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : notif.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {notif.type === 'alert' ? 'error' : notif.type === 'warning' ? 'warning' : 'info'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{notif.audience}</span>
                                            <span className="text-xs text-slate-400">• {new Date(notif.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{notif.title}</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteTrigger(notif.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Notification"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {notificationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="size-12 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Notification?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Are you sure you want to delete this alert? Users will no longer be able to see it in their feed.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setNotificationToDelete(null)}
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
