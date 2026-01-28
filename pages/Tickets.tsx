import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

const Tickets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (!error && data) {
          setTickets(data);
      }
      setLoading(false);
  };

  const tabs = [
    { key: 'All', label: language === 'ar' ? 'الكل' : 'All' },
    { key: 'My Tickets', label: language === 'ar' ? 'تذاكري' : 'My Tickets' },
    { key: 'Urgent', label: language === 'ar' ? 'عاجل' : 'Urgent' }
  ];

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = ticket.title.toLowerCase().includes(query) || ticket.id.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (activeTab === 'My Tickets' && ticket.assignee !== user?.name) return false;
      if (activeTab === 'Urgent') {
        const isUrgent = Array.isArray(ticket.tags) && ticket.tags.some((t: any) => 
            t.label?.toLowerCase().includes('high') || t.label?.toLowerCase().includes('critical')
        );
        if(!isUrgent) return false;
      }
      return true;
    });
  }, [searchQuery, activeTab, tickets, user]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-background-dark text-slate-900 dark:text-white pb-24 md:pb-8 font-display max-w-7xl mx-auto w-full relative transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold tracking-tight">{t('tickets')}</h1>
        <div className="flex items-center gap-2">
            <button onClick={fetchTickets} className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm border border-slate-200 dark:border-white/10">
                <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
        </div>
      </div>

      <div className="px-4 py-2">
          <div className="flex w-full items-center rounded-2xl bg-white dark:bg-surface-dark px-4 py-3 shadow-sm border border-slate-200 dark:border-white/5 transition-all">
              <span className="material-symbols-outlined mr-3 text-slate-400">search</span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-full w-full bg-transparent text-base font-medium focus:outline-none border-none focus:ring-0" placeholder={t('search_placeholder')} />
          </div>
      </div>

      <div className="flex w-full overflow-x-auto px-4 py-2 no-scrollbar gap-3 pb-4">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 dark:bg-surface-dark dark:text-slate-400'}`}>{tab.label}</button>
        ))}
      </div>

      <main className="flex flex-col gap-3 px-4">
        {loading ? (
            <div className="flex justify-center py-10">
                <span className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            </div>
        ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
                <div key={ticket.id} onClick={() => navigate(`/ticket/${ticket.id}`)} className="group relative flex flex-col bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 p-5 rounded-3xl cursor-pointer shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-xs text-primary bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">#{ticket.id}</span>
                        <span className="text-xs text-slate-400">{new Date(Number(ticket.timestamp)).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-4 group-hover:text-primary transition-colors">{ticket.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Array.isArray(ticket.tags) && ticket.tags.map((tag: any, i: number) => (
                            <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${tag.bg} ${tag.color}`}>
                                {tag.icon && <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>}
                                {tag.label === 'Open' ? t('s_open') : tag.label === 'Closed' ? t('s_closed') : tag.label}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                         <div className="flex items-center gap-2">
                            <img src={ticket.avatar || 'https://ui-avatars.com/api/?name=User'} alt="user" className="size-8 rounded-full object-cover" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{ticket.assignee ? `${t('assignee')}: ${ticket.assignee}` : 'Unassigned'}</span>
                         </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-20 text-slate-500">No tickets found.</div>
        )}
      </main>

      <button onClick={() => navigate('/tickets/new')} className={`fixed bottom-24 size-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 ${isRTL ? 'left-5 md:left-8' : 'right-5 md:right-8'}`}><span className="material-symbols-outlined text-[32px]">add</span></button>
    </div>
  );
};

export default Tickets;