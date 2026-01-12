
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('configuration');
  const [theme, setTheme] = useState(() => localStorage.getItem('omni_theme') || 'dark');
  const [loading, setLoading] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);

  // Delete State
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'types') {
        fetchTicketTypes();
    }
  }, [activeTab]);

  const fetchTicketTypes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .order('name');
      
      if (!error && data) {
          setTicketTypes(data);
      }
      setLoading(false);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('omni_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleDeleteType = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setTypeToDelete(id);
  };

  const confirmDelete = async () => {
      if (typeToDelete) {
          const { error } = await supabase.from('ticket_types').delete().eq('id', typeToDelete);
          if (!error) {
              setTicketTypes(prev => prev.filter(t => t.id !== typeToDelete));
          }
          setTypeToDelete(null);
      }
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col pb-24 md:pb-8 max-w-7xl mx-auto w-full transition-colors duration-300">
      {/* Header - Unified Style */}
      <div className="flex items-center justify-between px-4 py-6 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 md:px-6 mb-6">
        <div className="p-1 bg-slate-100 dark:bg-surface-dark rounded-xl flex border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar shadow-sm">
          <button 
            onClick={() => setActiveTab('types')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'types' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'}`}
          >
             Ticket Types
          </button>
          <button 
             onClick={() => setActiveTab('escalations')}
             className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'escalations' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'}`}
          >
             Escalations
          </button>
          <button 
             onClick={() => setActiveTab('configuration')}
             className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'configuration' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'}`}
          >
             Configuration
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-6 flex flex-col gap-5 overflow-y-auto">
        
        {activeTab === 'types' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              </span>
              <input className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 shadow-sm ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-shadow md:max-w-md" placeholder="Search ticket types..." type="text"/>
            </div>

            <div className="flex items-center justify-between mt-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Defined Types</h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{ticketTypes.filter(t => t.active).length} Active</span>
            </div>

            <div className="flex flex-col gap-4">
                 {loading ? (
                     <div className="flex justify-center py-12"><span className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full"></span></div>
                 ) : ticketTypes.map(type => (
                    <div key={type.id} onClick={() => navigate(`/settings/ticket-type/${type.id}/edit`)} className={`bg-white dark:bg-surface-dark rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden group active:scale-[0.99] hover:ring-primary/50 dark:hover:ring-white/30 transition-all cursor-pointer ${!type.active ? 'opacity-75 bg-slate-50 dark:bg-background-dark' : ''}`}>
                        <div className="p-4 md:p-6 flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{type.name}</h3>
                            {type.active ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">Active</span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">Inactive</span>
                            )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{type.field_count || 0} Field{type.field_count !== 1 ? 's' : ''} defined</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={(e) => handleDeleteType(e, type.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-white/5 rounded-full transition-colors z-10"
                            >
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                            <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                        </div>
                        </div>
                        {type.tags && type.tags.length > 0 && (
                             <div className="px-4 md:px-6 pb-4 pt-0 border-t border-dashed border-slate-100 dark:border-white/10 mt-2 pt-3">
                                <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                                    {type.tags.map((tag: string, i: number) => (
                                        <span key={i} className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">label</span> {tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                 ))}
            </div>
          </div>
        )}

        {activeTab === 'escalations' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                   <div className="flex items-start gap-4">
                       <div className="p-3 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 rounded-full">
                           <span className="material-symbols-outlined text-3xl">warning_amber</span>
                       </div>
                       <div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Escalation Policy</h3>
                           <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                               Escalation rules are currently defined at the <strong>User Level</strong>. 
                               You can configure specific escalation paths for each agent in the User Management screen.
                           </p>
                           <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                               The system automatically checks for:
                           </p>
                           <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 mt-1 ml-1 space-y-1">
                               <li>Agent inactivity (Away/Offline status)</li>
                               <li>SLA breaches based on Ticket Type wait times</li>
                           </ul>
                       </div>
                   </div>
                   <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                       <button onClick={() => navigate('/users')} className="text-primary hover:text-primary-dark dark:hover:text-white text-sm font-bold flex items-center gap-2 transition-colors">
                           Configure Users <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                       </button>
                   </div>
               </div>

               <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-4 md:p-6 opacity-60 pointer-events-none shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">System Defaults</h3>
                        <span className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Coming Soon</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-900 dark:text-white">Default SLA Timeout</span>
                            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">24 Hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-900 dark:text-white">Auto-Close Resolved</span>
                            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">48 Hours</span>
                        </div>
                    </div>
               </div>
           </div>
        )}

        {activeTab === 'configuration' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-4 md:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Appearance</h3>
                
                <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-base font-bold text-slate-900 dark:text-white">Application Theme</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Toggle between light and dark mode</span>
                   </div>
                   
                   <button 
                     onClick={toggleTheme}
                     className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                   >
                     <div className={`absolute top-1 left-1 bg-white rounded-full h-6 w-6 transition-transform duration-300 flex items-center justify-center shadow-md ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
                        <span className={`material-symbols-outlined text-[14px] ${theme === 'dark' ? 'text-primary' : 'text-slate-600'}`}>
                            {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                        </span>
                     </div>
                   </button>
                </div>
             </div>

             <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-4 md:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">System Info</h3>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Version</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">1.0.5 (Beta)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Build ID</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">2204b-stable</span>
                </div>
                <div className="flex items-center justify-between py-2 pt-4">
                     <span className="text-sm font-medium text-slate-900 dark:text-white">Data Sync</span>
                     <span className="text-xs bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-1 rounded-full font-bold">Online</span>
                </div>
             </div>
          </div>
        )}

      </div>

      {activeTab === 'types' && (
        <button onClick={() => navigate('/settings/ticket-type/new/edit')} className="fixed bottom-24 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-20">
            <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      )}

      {/* Confirmation Modal for Delete */}
      {typeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="size-12 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Ticket Type?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Are you sure you want to delete this ticket type? This may affect existing tickets associated with it.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setTypeToDelete(null)}
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

export default Settings;
