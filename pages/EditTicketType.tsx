
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

interface CustomField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: string;
}

const EditTicketType: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  // Core Settings State
  const [typeName, setTypeName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [reference, setReference] = useState('');
  const [escalationTime, setEscalationTime] = useState<number | ''>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fields, setFields] = useState<CustomField[]>([]);

  // Load Data
  useEffect(() => {
    if (id && id !== 'new') {
        fetchType();
    }
  }, [id]);

  const fetchType = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
          setTypeName(data.name);
          setIsActive(data.active);
          setReference(data.reference || '');
          setEscalationTime(data.escalation_wait_time || '');
          setFields(Array.isArray(data.fields) ? data.fields : []);
      }
      setLoading(false);
  };

  const addField = () => {
    const newField: CustomField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Field',
      type: 'TEXT',
      required: false,
      options: ''
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      const temp = newFields[index];
      newFields[index] = newFields[targetIndex];
      newFields[targetIndex] = temp;
      setFields(newFields);
    }
  };

  const updateField = (fieldId: string, key: keyof CustomField, value: any) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f));
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toUpperCase();
      if (val.length <= 4) {
          setReference(val);
      }
  };
  
  const handleSave = async () => {
      if (!typeName.trim()) {
          showToast("Type Name is required.", "error");
          return;
      }
      if (reference.length !== 4) {
          showToast("Reference code must be exactly 4 characters.", "error");
          return;
      }
      
      setLoading(true);
      try {
          const typeData: any = {
              name: typeName,
              active: isActive,
              reference: reference,
              escalation_wait_time: escalationTime === '' ? 0 : Number(escalationTime),
              field_count: fields.length,
              fields: fields,
              icon: 'extension'
          };

          if (id !== 'new') {
              typeData.id = id;
          }

          const { error } = await supabase
            .from('ticket_types')
            .upsert(typeData);

          if (error) throw error;
          
          showToast("Ticket type saved successfully.");
          navigate('/settings');
      } catch(e: any) {
          showToast(e.message || "Error saving ticket type", "error");
      } finally {
          setLoading(false);
      }
  };
  
  const handleDeleteTrigger = () => {
      setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
      if (id === 'new') {
          navigate('/settings');
          return;
      }
      try {
        const { error } = await supabase.from('ticket_types').delete().eq('id', id);
        if (error) throw error;
        showToast("Ticket type deleted.");
        navigate('/settings');
      } catch(e: any) {
          showToast(e.message || "Failed to delete", "error");
      }
  };

  return (
    <div className="bg-background-dark font-display text-white transition-colors duration-200 antialiased min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-10 flex items-center bg-background-dark/90 backdrop-blur-md px-4 py-4 justify-between border-b border-white/10 max-w-2xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-highlight transition-colors">
          <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-tight uppercase flex-1 text-center pr-10">
            {id === 'new' ? 'Create Ticket Type' : 'Edit Ticket Type'}
        </h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full flex flex-col space-y-6 pb-32">
        
        {/* Core Settings */}
        <div className="bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden">
            <details className="group" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none bg-surface-dark hover:bg-surface-highlight transition-colors">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Core Settings</h3>
                    <span className="material-symbols-outlined text-slate-400 text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="p-4 pt-0 space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Type Name</label>
                        <input 
                            className="w-full bg-background-dark/50 border border-surface-highlight rounded-lg px-3 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm" 
                            placeholder="e.g. IT Support" 
                            type="text" 
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Reference Code</label>
                                <span className="text-[10px] text-slate-500">{reference.length}/4</span>
                            </div>
                            <input 
                                className="w-full bg-background-dark/50 border border-surface-highlight rounded-lg px-3 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono tracking-widest text-sm uppercase" 
                                placeholder="e.g. ITSP" 
                                type="text" 
                                value={reference}
                                onChange={handleReferenceChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Escalation Wait Time (Hours)</label>
                            <input 
                                className="w-full bg-background-dark/50 border border-surface-highlight rounded-lg px-3 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm" 
                                placeholder="e.g. 24" 
                                type="number" 
                                min="0"
                                value={escalationTime}
                                onChange={(e) => setEscalationTime(e.target.valueAsNumber || '')}
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-1">If an agent does not reply within the wait time, the ticket will be automatically assigned to their supervisor.</p>

                    <div className="flex items-center justify-between p-3 bg-background-dark/30 rounded-lg border border-white/5 mt-2">
                        <span className="text-sm font-medium text-white pl-1">Active Status</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)} 
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </details>
        </div>

        {/* Custom Fields */}
        <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Custom Fields</h3>
                <button 
                    onClick={addField}
                    className="text-primary hover:text-primary-dark text-xs font-bold flex items-center space-x-1 focus:outline-none bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Field</span>
                </button>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="bg-surface-dark rounded-xl border border-surface-highlight overflow-hidden relative group animate-in slide-in-from-bottom-2 duration-300">
                    <div className="absolute right-3 top-3 flex items-center space-x-1">
                        <div className="flex bg-white/5 rounded-lg mr-2">
                             <button 
                                onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }}
                                disabled={index === 0}
                                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                             >
                                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                             </button>
                             <div className="w-px bg-white/10 my-1"></div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }}
                                disabled={index === fields.length - 1}
                                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                             >
                                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                             </button>
                        </div>

                         <button 
                            onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                            className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                    
                    <details className="group/details" open>
                        <summary className="flex items-center space-x-3 p-4 cursor-pointer list-none bg-surface-dark hover:bg-surface-highlight transition-colors pr-32">
                            <div className="text-slate-500">
                                <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                            </div>
                            <h3 className="font-bold text-white text-sm truncate">#{index + 1}: {field.label}</h3>
                            <span className="material-symbols-outlined text-slate-400 text-[20px] ml-auto transition-transform group-open/details:rotate-180">expand_more</span>
                        </summary>
                        <div className="p-4 pt-0 space-y-4 border-t border-white/5 mt-1">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Label</label>
                                <input 
                                    className="w-full bg-background-dark/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary" 
                                    type="text" 
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Type</label>
                                    <div className="relative">
                                        <select 
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, 'type', e.target.value)}
                                            className="w-full bg-background-dark/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white appearance-none focus:ring-1 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="DROPDOWN">Dropdown</option>
                                            <option value="TEXT">Text</option>
                                            <option value="NUMBER">Number</option>
                                            <option value="EMAIL">Email</option>
                                            <option value="DATE">Date</option>
                                            <option value="RTF">Rich Text (RTF)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                                    </div>
                                </div>
                                <div className="flex items-end mb-1">
                                    <label className="flex items-center justify-between w-full p-2.5 bg-background-dark/30 rounded-lg border border-white/5 cursor-pointer hover:bg-background-dark/50 transition-colors">
                                        <span className="text-sm font-medium text-slate-300">Required</span>
                                        <input 
                                            type="checkbox" 
                                            checked={field.required}
                                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                            className="form-checkbox text-primary rounded border-white/10 bg-background-dark h-4 w-4 focus:ring-primary focus:ring-offset-0 focus:ring-offset-background-dark"
                                        />
                                    </label>
                                </div>
                            </div>
                            {field.type === 'DROPDOWN' && (
                                <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Options (Comma separated)</label>
                                    <textarea 
                                        className="w-full bg-background-dark/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary resize-none leading-relaxed" 
                                        rows={2} 
                                        value={field.options}
                                        onChange={(e) => updateField(field.id, 'options', e.target.value)}
                                        placeholder="Option 1, Option 2, Option 3"
                                    ></textarea>
                                </div>
                            )}
                        </div>
                    </details>
                </div>
            ))}
            
            <div className="flex justify-center pt-2">
                 <button 
                    onClick={handleDeleteTrigger}
                    className="text-red-400 text-sm font-bold flex items-center gap-2 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                 >
                     <span className="material-symbols-outlined text-[20px]">delete</span>
                     Delete Ticket Type
                 </button>
            </div>
        </div>
      </main>

      <div className="absolute bottom-0 w-full bg-background-dark border-t border-white/10 p-4 z-20 pb-safe">
        <div className="flex gap-3 max-w-2xl mx-auto w-full">
            <button onClick={() => navigate(-1)} className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white font-bold tracking-wide hover:bg-surface-highlight active:scale-[0.98] transition-all uppercase text-sm">
                Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all uppercase text-sm flex justify-center items-center gap-2">
                {loading ? <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full"></span> : <><span className="material-symbols-outlined text-[20px]">save</span> Save Changes</>}
            </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="size-12 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Ticket Type?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Are you sure you want to delete this ticket type? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
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

export default EditTicketType;
