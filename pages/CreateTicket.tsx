
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('Unassigned');
  const [priority, setPriority] = useState('Low');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [allTicketTypes, setAllTicketTypes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
      setLoadingTypes(true);
      const { data, error } = await supabase.from('ticket_types').select('*').eq('active', true);
      if (!error && data) {
          setAllTicketTypes(data);
          if (data.length > 0) setSelectedTypeId(data[0].id);
      }
      setLoadingTypes(false);
  };

  const currentType = useMemo(() => 
      allTicketTypes.find(t => t.id === selectedTypeId), 
  [selectedTypeId, allTicketTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !selectedTypeId) return;

      setIsSubmitting(true);
      const referenceCode = currentType?.reference || 'TKT';
      const ticketId = `${referenceCode}-${Math.floor(1000 + Math.random() * 8999)}`;

      const { error } = await supabase.from('tickets').insert({
          id: ticketId,
          title,
          description,
          timestamp: Date.now(),
          assignee: assignee === 'Unassigned' ? null : assignee,
          creator: user?.name || 'Guest',
          avatar: user?.avatar,
          type_id: selectedTypeId,
          type_name: currentType?.name,
          tags: [
              { label: 'Open', color: 'text-green-300', bg: 'bg-green-900/30', icon: 'radio_button_checked' },
              { label: priority, color: 'text-slate-300', bg: 'bg-slate-700' }
          ]
      });

      if (!error) {
          showToast("Ticket created successfully!", "success");
          navigate('/tickets');
      } else {
          showToast("Error creating ticket", "error");
      }
      setIsSubmitting(false);
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col w-full">
      <header className="sticky top-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5"><span className="material-symbols-outlined">arrow_back</span></button>
          <h1 className="font-bold">Create New Ticket</h1>
          <div className="w-10"></div>
      </header>

      <main className="flex-1 p-5 max-w-2xl mx-auto w-full pb-32">
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" placeholder="What's the issue?" />
              </div>

              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ticket Type</label>
                  <div className="grid grid-cols-2 gap-3">
                      {allTicketTypes.map(t => (
                          <button key={t.id} type="button" onClick={() => setSelectedTypeId(t.id)} className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 transition-all ${selectedTypeId === t.id ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}>
                              <span className="material-symbols-outlined">{t.icon}</span>
                              {t.name}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 outline-none">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                  </select>
              </div>

              <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none h-32 resize-none" placeholder="Describe the problem in detail..." />
              </div>

              <button disabled={isSubmitting} type="submit" className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-primary text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full"></span> : <><span className="material-symbols-outlined">add_task</span> Create Ticket</>}
              </button>
          </form>
      </main>
    </div>
  );
};

export default CreateTicket;
