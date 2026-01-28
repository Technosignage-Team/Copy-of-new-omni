import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
      total: 0,
      open: 0,
      inProgress: 0,
      closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [edgeLoading, setEdgeLoading] = useState(false);
  const [edgeResult, setEdgeResult] = useState<string | null>(null);
  const [escalationCount, setEscalationCount] = useState(0);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    checkEscalations();
  }, []);

  const fetchDashboardData = async () => {
      setLoading(true);
      try {
          const { data: tickets, error } = await supabase.from('tickets').select('tags, title, id, creator, timestamp');
          if (error) throw error;

          if (tickets) {
              const total = tickets.length;
              const open = tickets.filter(t => t.tags.some((tag: any) => tag.label === 'Open')).length;
              const inProgress = tickets.filter(t => t.tags.some((tag: any) => tag.label === 'In Progress')).length;
              const closed = tickets.filter(t => t.tags.some((tag: any) => tag.label === 'Closed' || tag.label === 'Resolved')).length;
              
              setStats({ total, open, inProgress, closed });
              setRecentUpdates(tickets.slice(0, 5));
          }
      } catch (e) {
          console.error("Dashboard load failed", e);
      } finally {
          setLoading(false);
      }
  };

  const callEdgeFunction = async () => {
      setEdgeLoading(true);
      setEdgeResult(null);
      try {
          const { data, error } = await supabase.functions.invoke('hello-omni', {
              body: { name: 'Omni Agent' }
          });

          if (error) throw error;
          setEdgeResult(data.message);
          showToast("Edge Function Success!");
      } catch (e: any) {
          console.error("Edge function failed", e);
          showToast("Edge Function not deployed or unreachable", "error");
          setEdgeResult("Error: Ensure you have deployed the 'hello-omni' function via Supabase CLI.");
      } finally {
          setEdgeLoading(false);
      }
  };

  const checkEscalations = async () => {
      try {
          const { data: tickets } = await supabase.from('tickets').select('*');
          const { data: users } = await supabase.from('profiles').select('*');
          const { data: types } = await supabase.from('ticket_types').select('*');

          if (!tickets || !users || !types) return;

          const now = Date.now();
          let count = 0;

          for (const ticket of tickets) {
              const isClosed = ticket.tags.some((t: any) => t.label === 'Closed' || t.label === 'Resolved');
              const isEscalated = ticket.tags.some((t: any) => t.label === 'Escalated');
              if (isClosed || isEscalated) continue;

              const assigneeUser = users.find(u => u.name === ticket.assignee);
              if (!assigneeUser) continue;

              let targetId = null;
              if (assigneeUser.status === 'Inactive' && assigneeUser.escalate_on_inactive) {
                  targetId = assigneeUser.escalation_inactive_contact_id || assigneeUser.supervisor_id;
              }

              if (!targetId && assigneeUser.escalate_on_no_action) {
                  const type = types.find(t => t.id === ticket.type_id || t.name === ticket.type_name);
                  if (type?.escalation_wait_time) {
                      const waitMs = type.escalation_wait_time * 60 * 60 * 1000;
                      if (now - Number(ticket.timestamp) > waitMs) {
                          targetId = assigneeUser.escalation_timeout_contact_id || assigneeUser.supervisor_id;
                      }
                  }
              }

              if (targetId) {
                  const targetUser = users.find(u => u.id === targetId);
                  if (targetUser) {
                      count++;
                      const newTags = [
                          { label: 'Escalated', color: 'text-white', bg: 'bg-red-600', icon: 'campaign' },
                          ...ticket.tags.filter((t: any) => !['Low', 'Medium', 'High', 'Critical'].includes(t.label)),
                          { label: 'Critical', color: 'text-red-300', bg: 'bg-red-900/30', icon: 'priority_high' }
                      ];
                      await supabase.from('tickets').update({
                          assignee: targetUser.name,
                          tags: newTags,
                          description: ticket.description + `\n\n[System] Auto-escalated to ${targetUser.name}`
                      }).eq('id', ticket.id);
                  }
              }
          }
          setEscalationCount(count);
      } catch (e) {
          console.error("Escalation check error", e);
      }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-8 font-display w-full bg-slate-50 dark:bg-background-dark transition-colors duration-300">
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 pt-6 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">{t('welcome_agent')}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('happening_today')}</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={callEdgeFunction}
                    disabled={edgeLoading}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-surface-dark text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    {edgeLoading ? (
                        <span className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                    ) : (
                        <span className="material-symbols-outlined text-[20px]">bolt</span>
                    )}
                    <span>Test Edge</span>
                </button>
                <button 
                    onClick={() => navigate('/tickets/new')}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 w-full md:w-auto"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>{t('create_new_ticket')}</span>
                </button>
            </div>
        </div>

        {edgeResult && (
            <div className="bg-green-50 border border-green-200 dark:bg-green-500/10 dark:border-green-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="bg-green-500 rounded-full p-2 text-white shrink-0">
                    <span className="material-symbols-outlined">info</span>
                </div>
                <p className="text-sm text-green-900 dark:text-green-200 font-medium">{edgeResult}</p>
                <button onClick={() => setEdgeResult(null)} className="ml-auto text-slate-400">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        )}

        {escalationCount > 0 && (
            <div className="bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
                <div className="bg-red-500 rounded-full p-2 text-white">
                    <span className="material-symbols-outlined">campaign</span>
                </div>
                <div>
                    <p className="text-red-900 dark:text-white font-bold">System Escalation</p>
                    <p className="text-sm text-red-600 dark:text-red-200">{escalationCount} ticket{escalationCount > 1 ? 's' : ''} triggered automatic escalation protocols.</p>
                </div>
                <button onClick={() => setEscalationCount(0)} className="ml-auto text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="flex flex-col justify-between rounded-3xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5 min-h-[140px] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-full"><span className="material-symbols-outlined text-green-500 dark:text-green-400" style={{ fontSize: '20px' }}>confirmation_number</span></div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">+5%</span>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('total_tickets')}</p>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-3xl p-5 bg-primary shadow-lg shadow-primary/20 min-h-[140px] hover:shadow-primary/30 transition-shadow">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/20 rounded-full"><span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>lock_open</span></div>
              <span className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight mb-1 text-white">{stats.open}</p>
              <p className="text-sm font-bold text-green-100">{t('open_now')}</p>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-3xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5 min-h-[140px] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-full"><span className="material-symbols-outlined text-green-500 dark:text-green-400" style={{ fontSize: '20px' }}>timelapse</span></div>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white">{stats.inProgress}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('in_progress')}</p>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-3xl p-5 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-white/5 min-h-[140px] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-full"><span className="material-symbols-outlined text-green-500 dark:text-green-400" style={{ fontSize: '20px' }}>check_circle</span></div>
              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">+8%</span>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white">{stats.closed}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('closed')}</p>
            </div>
          </div>
        </div>

        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Analytics Overview</h2>
              <button onClick={() => navigate('/analytics')} className="text-primary text-sm font-bold hover:text-primary-dark transition-colors">See All</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col rounded-3xl bg-white dark:bg-surface-dark p-6 h-full border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tickets by Status</p>
                      <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">Live Health</p>
                    </div>
                    <div className="size-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center"><span className="material-symbols-outlined text-green-500 dark:text-green-400">bar_chart</span></div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-5 items-center">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12">{t('s_open')}</p>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(stats.open/stats.total)*100 || 0}%` }}></div>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12">{t('in_progress')}</p>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(stats.inProgress/stats.total)*100 || 0}%` }}></div>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 w-12">{t('s_closed')}</p>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.closed/stats.total)*100 || 0}%` }}></div>
                    </div>
                  </div>
              </div>
           </div>
        </div>

         <div>
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('recent_updates')}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentUpdates.map(ticket => (
                  <div key={ticket.id} onClick={() => navigate(`/ticket/${ticket.id}`)} className="flex items-center gap-4 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 p-4 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-highlight/50 transition-colors">
                    <div className="bg-green-50 dark:bg-green-500/10 text-green-500 dark:text-green-400 rounded-full p-2.5 shrink-0"><span className="material-symbols-outlined text-[20px]">update</span></div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-slate-900 dark:text-white">{ticket.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Updated by {ticket.creator} • #{ticket.id}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px] rtl:rotate-180">chevron_right</span>
                  </div>
              ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;