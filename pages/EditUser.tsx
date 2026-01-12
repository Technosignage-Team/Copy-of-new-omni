
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const EditUser: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [availableTicketTypes, setAvailableTicketTypes] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'User',
      status: 'Active',
      avatar: '',
      supervisor_id: '',
      escalate_on_no_action: false,
      escalation_timeout_contact_id: '',
      escalate_on_inactive: false,
      escalation_inactive_contact_id: '',
      allowed_ticket_types: [] as string[]
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
      setLoading(true);
      try {
          // 1. Fetch Target User
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

          if (userError) throw userError;

          // 2. Fetch All Profiles for Supervisor/Escalation lists
          const { data: allProfiles } = await supabase
            .from('profiles')
            .select('id, name, role')
            .neq('id', id);

          // 3. Fetch Ticket Types
          const { data: types } = await supabase
            .from('ticket_types')
            .select('name, icon, id');

          if (userData) {
              setFormData({
                  name: userData.name || '',
                  email: userData.email || '',
                  role: userData.role || 'User',
                  status: userData.status || 'Active',
                  avatar: userData.avatar || '',
                  supervisor_id: userData.supervisor_id || '',
                  escalate_on_no_action: userData.escalate_on_no_action || false,
                  escalation_timeout_contact_id: userData.escalation_timeout_contact_id || '',
                  escalate_on_inactive: userData.escalate_on_inactive || false,
                  escalation_inactive_contact_id: userData.escalation_inactive_contact_id || '',
                  allowed_ticket_types: Array.isArray(userData.allowed_ticket_types) ? userData.allowed_ticket_types : []
              });
          }

          if (allProfiles) setAvailableAgents(allProfiles.filter(p => p.role === 'Admin' || p.role === 'Agent'));
          if (types) setAvailableTicketTypes(types);

      } catch (e: any) {
          showToast(e.message || "Error loading user", "error");
          navigate('/users');
      } finally {
          setLoading(false);
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      setFormData(prev => ({ ...prev, [name]: val }));
  };

  const toggleTicketType = (typeName: string) => {
      setFormData(prev => {
          const exists = prev.allowed_ticket_types.includes(typeName);
          const newList = exists 
            ? prev.allowed_ticket_types.filter(t => t !== typeName) 
            : [...prev.allowed_ticket_types, typeName];
          return { ...prev, allowed_ticket_types: newList };
      });
  };

  const handleSave = async () => {
      try {
          const badgeColor = formData.role === 'Admin' ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-600';
          
          const { error } = await supabase
            .from('profiles')
            .update({
                ...formData,
                badge_color: badgeColor
            })
            .eq('id', id);

          if (error) throw error;
          
          showToast("User profile updated.");
          navigate('/users');
      } catch (e: any) {
          showToast(e.message || "Failed to save changes", "error");
      }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center font-display"><span className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full"></span></div>;

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative w-full transition-colors duration-300">
      <main className="flex-1 overflow-y-auto pb-32 w-full max-w-3xl mx-auto px-4 pt-6">
        <div className="bg-white dark:bg-surface-dark rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Basic Information</h3>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email (Login ID)</label>
                  <input value={formData.email} disabled className="w-full bg-slate-100 dark:bg-background-dark/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold opacity-60 cursor-not-allowed" type="email" />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold">
                        <option value="Admin">Admin</option>
                        <option value="Agent">Agent</option>
                        <option value="User">User</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Escalation Config - Only for Agents/Admins */}
        {formData.role !== 'User' && (
            <div className="bg-white dark:bg-surface-dark rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm mb-6 animate-in slide-in-from-bottom-2">
                 <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5"><h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Escalation Policy</h3></div>
                 <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-background-dark rounded-xl">
                        <span className="text-sm font-bold">Escalate on Inactivity</span>
                        <input type="checkbox" name="escalate_on_inactive" checked={formData.escalate_on_inactive} onChange={handleChange} />
                    </div>
                    {formData.escalate_on_inactive && (
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase">Redirect to:</label>
                            <select name="escalation_inactive_contact_id" value={formData.escalation_inactive_contact_id} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 rounded-xl px-4 py-3 text-sm">
                                <option value="">Select fallback agent...</option>
                                {availableAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                         </div>
                    )}
                 </div>
            </div>
        )}
      </main>

      <div className="fixed bottom-0 w-full bg-white dark:bg-background-dark border-t border-slate-200 dark:border-white/10 p-4 z-20 transition-colors">
        <div className="flex gap-3 max-w-3xl mx-auto w-full">
          <button onClick={() => navigate(-1)} className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-white/20 text-slate-600 dark:text-white font-bold text-sm uppercase">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 text-sm flex justify-center items-center gap-2 uppercase">
            <span className="material-symbols-outlined text-[20px]">save</span> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
