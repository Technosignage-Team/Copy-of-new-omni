
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  file?: File;
}

const EditTicket: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [assigneeUsers, setAssigneeUsers] = useState<any[]>([]);
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Low');
  const [assignee, setAssignee] = useState('Unassigned');
  
  const [isListening, setIsListening] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Attachments State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Role Permission Check
  const canEditClassification = user?.role === 'Admin' || user?.role === 'Agent';

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
        // 1. Fetch Ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single();

        if (ticketError) throw ticketError;

        // 2. Fetch Ticket Types
        const { data: types } = await supabase
            .from('ticket_types')
            .select('*')
            .eq('active', true);

        // 3. Fetch Potential Assignees
        const { data: users } = await supabase
            .from('profiles')
            .select('name')
            .in('role', ['Admin', 'Agent']);

        if (ticket) {
            setTitle(ticket.title || '');
            setDescription(ticket.description || '');
            setSelectedTypeId(ticket.type_id || '');
            setAssignee(ticket.assignee || 'Unassigned');
            
            // Extract Status and Priority from tags
            const statusTag = ticket.tags?.find((t: any) => ['Open', 'Pending', 'Resolved', 'Closed', 'In Progress'].includes(t.label));
            const priorityTag = ticket.tags?.find((t: any) => ['Low', 'Medium', 'High', 'Critical'].includes(t.label));
            
            if (statusTag) setStatus(statusTag.label);
            if (priorityTag) setPriority(priorityTag.label);
        }

        if (types) setTicketTypes(types);
        if (users) setAssigneeUsers(users);

    } catch (e: any) {
        showToast(e.message || "Error loading ticket", "error");
        navigate('/tickets');
    } finally {
        setLoading(false);
    }
  };

  const currentTicketType = useMemo(() => 
    ticketTypes.find(t => t.id === selectedTypeId) || ticketTypes[0],
  [selectedTypeId, ticketTypes]);

  // Speech to Text Logic
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => {
         const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
         return prev + spacer + transcript;
      });
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const insertFormat = (format: string) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    let newText = description;
    let newCursorPos = end;

    switch (format) {
        case 'bold': newText = description.substring(0, start) + `**${selectedText || 'bold text'}**` + description.substring(end); newCursorPos = end + 2 + (selectedText ? 0 : 9); break;
        case 'italic': newText = description.substring(0, start) + `*${selectedText || 'italic text'}*` + description.substring(end); newCursorPos = end + 1 + (selectedText ? 0 : 11); break;
        case 'h1': newText = description.substring(0, start) + `\n# ${selectedText || 'Heading 1'}\n` + description.substring(end); newCursorPos = end + 3; break;
        case 'list': newText = description.substring(0, start) + `\n- ${selectedText || 'List item'}` + description.substring(end); newCursorPos = end + 3; break;
        case 'list-ol': newText = description.substring(0, start) + `\n1. ${selectedText || 'List item'}` + description.substring(end); newCursorPos = end + 4; break;
        case 'link': newText = description.substring(0, start) + `[${selectedText || 'Link Text'}](url)` + description.substring(end); newCursorPos = end + 1; break;
        case 'image': newText = description.substring(0, start) + `\n![Alt Text](https://)` + description.substring(end); newCursorPos = end + 13; break;
        case 'table': 
            const table = `\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`;
            newText = description.substring(0, start) + table + description.substring(end); 
            newCursorPos = start + table.length; 
            break;
        case 'code': newText = description.substring(0, start) + `\n\`\`\`\n${selectedText || 'code block'}\n\`\`\`\n` + description.substring(end); newCursorPos = end + 4; break;
        case 'quote': newText = description.substring(0, start) + `\n> ${selectedText || 'Blockquote'}\n` + description.substring(end); newCursorPos = end + 3; break;
    }

    setDescription(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(newCursorPos, newCursorPos); }, 0);
  };

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const newAttachments: Attachment[] = Array.from(e.target.files).map((file: File) => ({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type,
            url: URL.createObjectURL(file),
            file: file
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const handleRemoveAttachment = (id: string) => setAttachments(prev => prev.filter(a => a.id !== id));
  const handleDownload = (e: React.MouseEvent, attachment: Attachment) => {
      e.preventDefault(); e.stopPropagation();
      const link = document.createElement('a'); link.href = attachment.url; link.download = attachment.name;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  const handlePreview = (attachment: Attachment) => {
    if (attachment.type.startsWith('image/') || attachment.type.startsWith('video/')) setPreviewAttachment(attachment);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
        const typeObj = ticketTypes.find(t => t.id === selectedTypeId) || ticketTypes[0];
        
        // Construct standard tags based on status/priority
        const statusConfig: any = {
            'Open': { bg: 'bg-green-900/30', color: 'text-green-300', icon: 'radio_button_checked' },
            'Pending': { bg: 'bg-orange-900/30', color: 'text-orange-300', icon: 'hourglass_empty' },
            'Resolved': { bg: 'bg-slate-800', color: 'text-slate-400', icon: 'check_circle' },
            'Closed': { bg: 'bg-slate-800', color: 'text-slate-400', icon: 'check_circle' },
            'In Progress': { bg: 'bg-blue-900/30', color: 'text-blue-300', icon: 'timelapse' }
        };

        const priorityConfig: any = {
            'Low': { bg: 'bg-slate-700', color: 'text-slate-300', icon: 'low_priority' },
            'Medium': { bg: 'bg-blue-900/30', color: 'text-blue-300', icon: 'remove' },
            'High': { bg: 'bg-orange-900/30', color: 'text-orange-300', icon: 'priority_high' },
            'Critical': { bg: 'bg-red-900/30', color: 'text-red-300', icon: 'priority_high' }
        };

        const newTags = [
            { label: status, ...statusConfig[status] },
            { label: priority, ...priorityConfig[priority] },
            { label: typeObj?.name || 'Other', bg: 'bg-slate-700', color: 'text-slate-300', icon: typeObj?.icon || 'extension' }
        ];

        // IMPORTANT: We do NOT send 'status' or 'priority' as columns because they are managed via the 'tags' array
        const { error } = await supabase
            .from('tickets')
            .update({
                title,
                description,
                assignee: assignee === 'Unassigned' ? null : assignee,
                type_id: selectedTypeId,
                type_name: typeObj?.name,
                tags: newTags
            })
            .eq('id', id);

        if (error) throw error;

        showToast("Ticket updated successfully.");
        navigate(`/ticket/${id}`);
    } catch (e: any) {
        showToast(e.message || "Failed to update ticket", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        showToast("Ticket deleted.");
        navigate('/tickets');
    } catch (e: any) {
        showToast(e.message || "Failed to delete ticket", "error");
    }
  };

  if (loading) return <div className="min-h-screen bg-background-dark flex items-center justify-center font-display"><span className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full"></span></div>;

  return (
    <div className="bg-background-dark font-display text-white antialiased min-h-screen flex flex-col relative w-full">
      <header className="sticky top-0 z-10 flex items-center bg-background-dark/90 backdrop-blur-md px-4 py-4 justify-between border-b border-white/10 max-w-2xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-highlight transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-tight uppercase flex-1 text-center pr-10">Edit Ticket</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 w-full max-w-2xl mx-auto">
         <div className="p-4 space-y-4">
            <div className="bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden">
                <details className="group" open>
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none bg-surface-dark hover:bg-surface-highlight transition-colors">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Core Information</h3>
                        <span className="material-symbols-outlined text-slate-400 text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="p-4 pt-0 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm" />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                            <div className="bg-background-dark/50 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                                <div className="flex items-center gap-1 p-2 bg-surface-highlight/30 border-b border-white/5 overflow-x-auto no-scrollbar">
                                    <button type="button" onClick={() => insertFormat('h1')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">title</span></button>
                                    <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
                                    <button type="button" onClick={() => insertFormat('bold')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                                    <button type="button" onClick={() => insertFormat('italic')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                                    <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
                                    <button type="button" onClick={() => insertFormat('list')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                                    <button type="button" onClick={() => insertFormat('list-ol')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">format_list_numbered</span></button>
                                    <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
                                    <button type="button" onClick={() => insertFormat('link')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">link</span></button>
                                    <button type="button" onClick={() => insertFormat('quote')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">format_quote</span></button>
                                    <button type="button" onClick={() => insertFormat('code')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">code</span></button>
                                    <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
                                    <button type="button" onClick={() => insertFormat('image')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">image</span></button>
                                    <button type="button" onClick={() => insertFormat('table')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors shrink-0"><span className="material-symbols-outlined text-[20px]">table_chart</span></button>
                                    <div className="w-px h-4 bg-white/10 mx-1 shrink-0"></div>
                                    <button type="button" onClick={toggleListening} className={`p-1.5 rounded-md transition-colors flex items-center gap-1 shrink-0 ${isListening ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}><span className="material-symbols-outlined text-[20px]">{isListening ? 'mic_off' : 'mic'}</span></button>
                                </div>
                                <textarea ref={descriptionRef} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-transparent border-none px-4 py-3 text-white placeholder-slate-500 focus:ring-0 resize-none text-sm leading-relaxed" placeholder="Detailed description of the issue..."></textarea>
                            </div>
                        </div>
                    </div>
                </details>
            </div>

            <div className="bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden">
                <details className="group" open>
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none bg-surface-dark hover:bg-surface-highlight transition-colors">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Attachments</h3>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white">{attachments.length}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="p-4 pt-0">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                        <div className="grid grid-cols-2 gap-3 mb-2">
                             {attachments.map(att => (
                                <div key={att.id} onClick={() => handlePreview(att)} className={`relative group/att aspect-video bg-background-dark/50 border border-white/5 rounded-xl overflow-hidden shadow-sm transition-all ${att.type.startsWith('image/') ? 'cursor-pointer hover:border-primary/50 hover:ring-1 hover:ring-primary/50' : ''}`}>
                                    {att.type.startsWith('image/') ? <img src={att.url} alt={att.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-surface-highlight/10 gap-2"><span className="material-symbols-outlined text-4xl text-slate-500">draft</span></div>}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 flex items-end justify-between opacity-100 sm:opacity-0 group-hover/att:opacity-100 transition-opacity">
                                        <div className="min-w-0 flex-1 mr-2"><p className="text-xs text-white font-medium truncate">{att.name}</p></div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={(e) => handleDownload(e, att)} className="size-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"><span className="material-symbols-outlined text-[16px]">download</span></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(att.id); }} className="size-7 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                                        </div>
                                    </div>
                                </div>
                             ))}
                             <button onClick={handleAttachClick} className="flex flex-col items-center justify-center aspect-video bg-background-dark/30 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 hover:bg-surface-highlight/10 transition-all group/upload">
                                <div className="size-10 rounded-full bg-surface-highlight/50 flex items-center justify-center mb-2 group-hover/upload:bg-primary/20 group-hover/upload:text-primary"><span className="material-symbols-outlined">add</span></div>
                                <span className="text-xs font-medium text-slate-400 group-hover/upload:text-white">Upload</span>
                             </button>
                        </div>
                    </div>
                </details>
            </div>

            <div className="bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden">
                <details className="group" open>
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none bg-surface-dark hover:bg-surface-highlight transition-colors">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Classification</h3>
                        <span className="material-symbols-outlined text-slate-400 text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
                            <div className="relative">
                                <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!canEditClassification} className={`w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium ${!canEditClassification ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <option>Open</option>
                                    <option>In Progress</option>
                                    <option>Pending</option>
                                    <option>Resolved</option>
                                    <option>Closed</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Priority</label>
                            <div className="relative">
                                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium">
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Critical</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assignee</label>
                            <div className="relative">
                                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={!canEditClassification} className={`w-full bg-background-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-medium ${!canEditClassification ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <option value="Unassigned">Unassigned</option>
                                    {assigneeUsers.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">person</span>
                            </div>
                        </div>
                    </div>
                </details>
            </div>

            <div className="bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden">
                 <details className="group" open>
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none bg-surface-dark hover:bg-surface-highlight transition-colors">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Type & Specifics</h3>
                        <span className="material-symbols-outlined text-slate-400 text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="p-4 pt-0 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {ticketTypes.map(t => (
                                <button type="button" key={t.id} onClick={() => setSelectedTypeId(t.id)} className={`flex flex-col sm:flex-row items-center sm:justify-start gap-2 p-3 rounded-xl border transition-all active:scale-[0.98] ${selectedTypeId === t.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background-dark/30 border-white/10 text-slate-400 hover:bg-surface-highlight hover:text-white'}`}>
                                    <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                                    <span className="text-sm font-bold">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                 </details>
            </div>
            
            <div className="flex justify-center pt-2">
                 <button onClick={() => setShowDeleteConfirm(true)} className="text-red-400 text-sm font-bold flex items-center gap-2 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span> Delete Ticket</button>
            </div>
         </div>
      </main>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background-dark border-t border-white/10 flex gap-3 z-20 pb-safe">
        <div className="max-w-2xl mx-auto w-full flex gap-3">
            <button onClick={() => navigate(-1)} className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white font-bold tracking-wide hover:bg-surface-highlight active:scale-[0.98] transition-all uppercase text-sm">Cancel</button>
            <button onClick={handleSave} disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all uppercase text-sm flex justify-center items-center gap-2">
                {isSubmitting ? <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full"></span> : <><span className="material-symbols-outlined text-[20px]">save</span> Save Changes</>}
            </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="size-12 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4"><span className="material-symbols-outlined text-3xl">warning</span></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Ticket?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Are you sure you want to delete this ticket? This action cannot be undone.</p>
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold rounded-xl">Cancel</button>
                        <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30">Delete Ticket</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default EditTicket;
