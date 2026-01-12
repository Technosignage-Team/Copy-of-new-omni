
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_EMAIL_TEMPLATES } from '../data/mockData';
import { useToast } from '../context/ToastContext';

const EmailManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'config' | 'templates'>('config');
  
  // Core Config
  const [emailConfig, setEmailConfig] = useState({
      serviceId: '',
      publicKey: '',
      verificationTemplateId: '',
      resetTemplateId: '',
      ticketCreationTemplateId: '',
      ticketUpdateTemplateId: ''
  });

  // Templates Data
  const [templates, setTemplates] = useState<any[]>(DEFAULT_EMAIL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  useEffect(() => {
    // Load Core Config
    try {
        const savedConfig = localStorage.getItem('omni_email_config');
        if (savedConfig) setEmailConfig(JSON.parse(savedConfig));
    } catch(e) {}

    // Load Templates
    try {
        const savedTemplates = localStorage.getItem('omni_email_templates');
        if (savedTemplates) {
            setTemplates(JSON.parse(savedTemplates));
        } else {
            setTemplates(DEFAULT_EMAIL_TEMPLATES);
            localStorage.setItem('omni_email_templates', JSON.stringify(DEFAULT_EMAIL_TEMPLATES));
        }
    } catch (e) {
        setTemplates(DEFAULT_EMAIL_TEMPLATES);
    }
  }, []);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEmailConfig(prev => ({ ...prev, [name]: value }));
  };

  const populateDefaults = () => {
      const mockConfig = {
          serviceId: 'service_fajlnph',
          publicKey: 'JpNCxWDbviRLP7xl-',
          verificationTemplateId: 'template_8rjy248',
          resetTemplateId: 'template_8rjy248',
          ticketCreationTemplateId: 'template_8rjy248',
          ticketUpdateTemplateId: 'template_8rjy248'
      };
      setEmailConfig(mockConfig);
      // Auto-save immediately when populating defaults to prevent loss
      localStorage.setItem('omni_email_config', JSON.stringify(mockConfig));
      showToast("Defaults populated and saved.");
  };

  const saveConfig = () => {
      try {
          if (!emailConfig.serviceId.trim() || !emailConfig.publicKey.trim()) {
              showToast("Service ID and Public Key are required.", 'error');
              return;
          }
          localStorage.setItem('omni_email_config', JSON.stringify(emailConfig));
          
          // Also update the templates in memory/storage to match these IDs
          const updatedTemplates = templates.map(t => {
              if (t.id === 'verification' && emailConfig.verificationTemplateId) return { ...t, emailjsId: emailConfig.verificationTemplateId };
              if (t.id === 'reset_password' && emailConfig.resetTemplateId) return { ...t, emailjsId: emailConfig.resetTemplateId };
              if (t.id === 'ticket_creation' && emailConfig.ticketCreationTemplateId) return { ...t, emailjsId: emailConfig.ticketCreationTemplateId };
              if (t.id === 'ticket_update' && emailConfig.ticketUpdateTemplateId) return { ...t, emailjsId: emailConfig.ticketUpdateTemplateId };
              return t;
          });
          setTemplates(updatedTemplates);
          localStorage.setItem('omni_email_templates', JSON.stringify(updatedTemplates));

          showToast("Configuration saved successfully.");
      } catch (e) {
          console.error(e);
          showToast("Failed to save configuration.", 'error');
      }
  };

  const saveTemplate = (template: any) => {
      try {
          const updatedTemplates = templates.map(t => t.id === template.id ? template : t);
          setTemplates(updatedTemplates);
          localStorage.setItem('omni_email_templates', JSON.stringify(updatedTemplates));
          
          // Auto-update core config keys if it's a system template
          let newConfig = { ...emailConfig };
          let configChanged = false;

          if (template.id === 'verification') { newConfig.verificationTemplateId = template.emailjsId; configChanged = true; }
          if (template.id === 'reset_password') { newConfig.resetTemplateId = template.emailjsId; configChanged = true; }
          if (template.id === 'ticket_creation') { newConfig.ticketCreationTemplateId = template.emailjsId; configChanged = true; }
          if (template.id === 'ticket_update') { newConfig.ticketUpdateTemplateId = template.emailjsId; configChanged = true; }

          if (configChanged) {
              setEmailConfig(newConfig);
              localStorage.setItem('omni_email_config', JSON.stringify(newConfig));
          }

          setSelectedTemplate(null);
          showToast(`${template.name} updated successfully.`);
      } catch (e) {
          console.error(e);
          showToast("Failed to update template.", 'error');
      }
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col pb-24 md:pb-8 max-w-7xl mx-auto w-full transition-colors duration-300 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6 md:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure EmailJS integration and notification templates.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-6 mb-6">
        <div className="flex gap-4 border-b border-slate-200 dark:border-white/10">
            <button 
                onClick={() => setActiveTab('config')}
                className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Integration Settings
            </button>
            <button 
                onClick={() => setActiveTab('templates')}
                className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Email Templates
            </button>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 overflow-y-auto">
          
          {/* CONFIG TAB */}
          {activeTab === 'config' && (
              <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="size-12 rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-500 flex items-center justify-center border border-orange-100 dark:border-orange-500/20">
                              <span className="material-symbols-outlined text-2xl">mail_lock</span>
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">EmailJS Credentials</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Required to send transactional emails via the platform.</p>
                          </div>
                      </div>

                      <div className="space-y-5">
                          <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Service ID</label>
                              <input 
                                  name="serviceId" 
                                  value={emailConfig.serviceId} 
                                  onChange={handleConfigChange}
                                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm" 
                                  placeholder="service_xxxxxxxx" 
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Public Key (User ID)</label>
                              <input 
                                  name="publicKey" 
                                  value={emailConfig.publicKey} 
                                  onChange={handleConfigChange}
                                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm" 
                                  placeholder="Public Key from EmailJS" 
                              />
                          </div>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="size-12 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                              <span className="material-symbols-outlined text-2xl">settings_system_daydream</span>
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Templates</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Map your EmailJS template IDs to system actions.</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                          <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Verification Template ID</label>
                              <input 
                                  name="verificationTemplateId" 
                                  value={emailConfig.verificationTemplateId} 
                                  onChange={handleConfigChange}
                                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm font-mono" 
                                  placeholder="template_verify" 
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password Reset Template ID</label>
                              <input 
                                  name="resetTemplateId" 
                                  value={emailConfig.resetTemplateId} 
                                  onChange={handleConfigChange}
                                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm font-mono" 
                                  placeholder="template_reset" 
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Ticket Creation Template ID</label>
                              <input 
                                  name="ticketCreationTemplateId" 
                                  value={emailConfig.ticketCreationTemplateId} 
                                  onChange={handleConfigChange}
                                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm font-mono" 
                                  placeholder="template_ticket_new" 
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Ticket Update Template ID</label>
                              <input 
                                  name="ticketUpdateTemplateId" 
                                  value={emailConfig.ticketUpdateTemplateId} 
                                  onChange={handleConfigChange}
                                  className="w-full bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all font-medium text-sm font-mono" 
                                  placeholder="template_ticket_update" 
                              />
                          </div>
                      </div>

                      <div className="mt-8 flex justify-end gap-3">
                          <button 
                              onClick={populateDefaults}
                              className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-2"
                          >
                              <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                              Auto-Fill Defaults
                          </button>
                          <button 
                              onClick={saveConfig}
                              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                          >
                              <span className="material-symbols-outlined text-[18px]">save</span>
                              Save Settings
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {templates.map(template => (
                      <div key={template.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-500">
                                      <span className="material-symbols-outlined text-[20px]">drafts</span>
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-900 dark:text-white">{template.name}</h3>
                                      <p className="text-xs text-slate-500 font-mono mt-0.5">{template.id}</p>
                                  </div>
                              </div>
                              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${template.emailjsId ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}>
                                  {template.emailjsId ? 'Active' : 'Missing ID'}
                              </div>
                          </div>
                          
                          <div className="flex-1 bg-slate-50 dark:bg-background-dark/50 rounded-lg p-3 border border-slate-100 dark:border-white/5 mb-4">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Subject Preview</p>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{template.subject}</p>
                          </div>

                          <button 
                              onClick={() => setSelectedTemplate(template)}
                              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                          >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                              Edit Template
                          </button>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* EDIT MODAL */}
      {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Template: {selectedTemplate.name}</h3>
                      <button onClick={() => setSelectedTemplate(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto flex-1 space-y-5">
                      <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 flex gap-3">
                          <span className="material-symbols-outlined text-blue-500">info</span>
                          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                              <strong>Note:</strong> Content changes here are for reference and variable drafting. 
                              The actual email content layout must be configured in your EmailJS Dashboard using the variables listed below.
                          </p>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">EmailJS Template ID (Required)</label>
                          <input 
                              type="text"
                              value={selectedTemplate.emailjsId}
                              onChange={(e) => setSelectedTemplate({...selectedTemplate, emailjsId: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                              placeholder="template_xxxxx"
                          />
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Subject Line (Draft)</label>
                          <input 
                              type="text"
                              value={selectedTemplate.subject}
                              onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                          />
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Body (Draft)</label>
                          <textarea 
                              rows={8}
                              value={selectedTemplate.body}
                              onChange={(e) => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none resize-none leading-relaxed"
                          />
                      </div>

                      <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Available Variables</p>
                          <div className="flex flex-wrap gap-2">
                              {selectedTemplate.variables?.map((v: string) => (
                                  <span key={v} className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                      {`{{${v}}}`}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                      <button 
                          onClick={() => setSelectedTemplate(null)}
                          className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-sm transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={() => saveTemplate(selectedTemplate)}
                          className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
                      >
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default EmailManagement;
