
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { getEmailConfig, sendEmail, getAppTemplate, fillTemplate } from '../utils/email';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

interface ActivityItem {
  id: string;
  type: 'system' | 'message';
  content?: string;
  title?: string;
  highlight?: string;
  highlightColor?: string;
  meta: string;
  author?: { name: string; avatar: string; email?: string };
  attachments?: Attachment[];
  iconBorder?: string;
}

const TicketDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const { setTicketContext, clearTicketContext, openVoice } = useVoice();

  // State
  const [replyText, setReplyText] = useState('');
  const [isReplyListening, setIsReplyListening] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [assigneeUsers, setAssigneeUsers] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyRecognitionRef = useRef<any>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  const canEditProperties = user?.role === 'Admin' || user?.role === 'Agent';

  useEffect(() => {
    fetchTicket();
    fetchUsers();
  }, [id]);

  const fetchTicket = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
          setCurrentTicket(data);
          // Load activities
          const savedActivities = localStorage.getItem(`omni_activities_${id}`);
          if (savedActivities) {
              setActivities(JSON.parse(savedActivities));
          } else {
              setActivities([
                  { id: '1', type: 'system', title: 'Ticket Created', meta: `By ${data.creator}`, iconBorder: 'border-slate-500' }
              ]);
          }
      }
      setLoading(false);
  };

  const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setAssigneeUsers(data);
  };

  const updateTicketData = async (updatedFields: any) => {
      if (!currentTicket) return;

      // Note: If updating status, we must update the tags array
      let finalPayload = { ...updatedFields };
      
      if (updatedFields.status) {
          const statusConfig: any = {
              'Open': { bg: 'bg-green-900/30', color: 'text-green-300', icon: 'radio_button_checked' },
              'Pending': { bg: 'bg-orange-900/30', color: 'text-orange-300', icon: 'hourglass_empty' },
              'Resolved': { bg: 'bg-slate-800', color: 'text-slate-400', icon: 'check_circle' },
              'Closed': { bg: 'bg-slate-800', color: 'text-slate-400', icon: 'check_circle' },
              'In Progress': { bg: 'bg-blue-900/30', color: 'text-blue-300', icon: 'timelapse' }
          };

          // Keep current non-status tags (like Priority and Type)
          const otherTags = currentTicket.tags?.filter((t: any) => 
            !['Open', 'Pending', 'Resolved', 'Closed', 'In Progress'].includes(t.label)
          ) || [];
          
          finalPayload.tags = [
              { label: updatedFields.status, ...statusConfig[updatedFields.status] },
              ...otherTags
          ];
          // Remove status key as it doesn't exist in the table schema
          delete finalPayload.status;
      }

      const { error } = await supabase
        .from('tickets')
        .update(finalPayload)
        .eq('id', id);
    
      if (!error) {
          const updated = { ...currentTicket, ...finalPayload };
          setCurrentTicket(updated);
          
          if (updatedFields.status || updatedFields.assignee) {
             const newActivity: ActivityItem = {
                id: Date.now().toString(),
                type: 'system',
                title: updatedFields.status ? 'Status changed to' : 'Assignee changed to',
                highlight: updatedFields.status || updatedFields.assignee,
                meta: `Just now • ${user?.name || 'User'}`,
                iconBorder: 'border-primary'
             };
             const updatedActivities = [newActivity, ...activities];
             setActivities(updatedActivities);
             localStorage.setItem(`omni_activities_${id}`, JSON.stringify(updatedActivities));
          }
          showToast("Ticket updated.");
      } else {
          showToast(error.message, "error");
      }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && attachments.length === 0) return;
    
    const newMessage: ActivityItem = {
        id: Date.now().toString(),
        type: 'message',
        content: replyText,
        meta: `Just now • ${user?.name}`,
        author: {
            name: user?.name,
            avatar: user?.avatar,
            email: user?.email
        },
        attachments: [...attachments]
    };

    const updated = [newMessage, ...activities];
    setActivities(updated);
    localStorage.setItem(`omni_activities_${id}`, JSON.stringify(updated));
    setReplyText('');
    setAttachments([]);
    showToast("Reply sent.");
  };

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center"><span className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full"></span></div>;
  if (!currentTicket) return <div className="min-h-screen flex items-center justify-center">Ticket not found</div>;

  const currentStatus = currentTicket?.tags?.find((t: any) => 
    ['Open', 'Pending', 'Resolved', 'Closed', 'In Progress'].includes(t.label)
  )?.label || 'Open';

  return (
    <div className="bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col relative w-full transition-colors duration-300">
      <div className="flex items-center px-4 py-4 justify-between bg-white/95 dark:bg-background-dark/95 z-10 sticky top-0 backdrop-blur-sm border-b border-slate-200 dark:border-white/5 md:px-8 max-w-4xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-surface-highlight transition">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">#{currentTicket.id}</h2>
        <div className="flex items-center gap-2">
             <button onClick={openVoice} className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20"><span className="material-symbols-outlined">headphones</span></button>
             <button onClick={() => navigate(`/ticket/${id}/edit`)} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-surface-highlight transition"><span className="material-symbols-outlined">edit</span></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-64 no-scrollbar max-w-4xl mx-auto w-full md:px-4">
        <div className="px-5 pt-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{currentTicket.title}</h1>
          <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5">
            <img src={currentTicket.avatar || `https://ui-avatars.com/api/?name=${currentTicket.creator}`} className="size-10 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{currentTicket.creator}</span>
              <span className="text-xs text-slate-500">Reported on {new Date(Number(currentTicket.timestamp)).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{currentTicket.description}</p>
        </div>

        {/* Properties */}
        <div className="px-5 mb-8 grid grid-cols-2 gap-3">
             <div className="p-3.5 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                 <p className="font-bold text-sm mt-1">{currentStatus}</p>
             </div>
             <div className="p-3.5 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Assignee</span>
                 <p className="font-bold text-sm mt-1">{currentTicket.assignee || 'Unassigned'}</p>
             </div>
        </div>

        {/* Activity Feed */}
        <div className="px-5 space-y-6">
            {activities.map(act => (
                <div key={act.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`size-3 rounded-full border-2 ${act.type === 'system' ? 'border-slate-400' : 'border-primary'} mt-1`}></div>
                        <div className="w-px flex-1 bg-slate-200 dark:bg-white/5 mt-1"></div>
                    </div>
                    <div className="flex-1 pb-4">
                        {act.type === 'system' ? (
                            <p className="text-sm text-slate-500">{act.title} <span className="font-bold text-slate-900 dark:text-white">{act.highlight}</span> • {act.meta}</p>
                        ) : (
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">{act.author?.name}</span>
                                    <span className="text-[10px] text-slate-400">{act.meta}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{act.content}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-white/5 z-20">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
              <div className="flex-1 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/5 rounded-2xl p-2">
                <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full bg-transparent border-none focus:ring-0 text-sm h-12 resize-none"
                />
              </div>
              <button 
                onClick={handleSendReply}
                className="size-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20"
              >
                  <span className="material-symbols-outlined">send</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default TicketDetail;
