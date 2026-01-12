
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MyAccount: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      avatar: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
  });

  // Password Policy State
  const [passwordCriteria, setPasswordCriteria] = useState({
      length: false,
      upper: false,
      number: false,
      special: false
  });

  useEffect(() => {
      if (user) {
          setFormData(prev => ({
              ...prev,
              name: user.name || '',
              email: user.email || '',
              avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`
          }));
      }
  }, [user]);

  useEffect(() => {
      setPasswordCriteria({
          length: formData.newPassword.length >= 8,
          upper: /[A-Z]/.test(formData.newPassword),
          number: /[0-9]/.test(formData.newPassword),
          special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
      });
  }, [formData.newPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
      if (!user) return;

      // Validate Password Change if attempted
      if (formData.newPassword) {
          const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
          if (!isPasswordValid) {
              showToast("New password does not meet security requirements.", 'error');
              return;
          }
          if (formData.newPassword !== formData.confirmPassword) {
              showToast("New passwords do not match.", 'error');
              return;
          }
          if (!formData.currentPassword) {
              showToast("Please enter current password to confirm changes.", 'error');
              return;
          }
      }

      // Update user object
      const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar
      };

      updateUser(updatedUser);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' })); // Clear passwords
      showToast('Account updated successfully!');
  };

  if (!user) return null;

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative w-full transition-colors duration-300">
      
      <main className="flex-1 overflow-y-auto pb-32 w-full max-w-3xl mx-auto px-4 pt-6">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center pb-10">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
          >
            <div className="size-32 rounded-full border-4 border-white dark:border-surface-highlight shadow-2xl bg-cover bg-center" style={{ backgroundImage: `url("${formData.avatar}")` }}></div>
            
            <div className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2.5 border-[3px] border-slate-50 dark:border-background-dark shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px] block">edit</span>
            </div>
          </div>
          
          <div className="mt-5 text-center">
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{formData.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{user.role}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Details */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Personal Details</h3>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-[20px]">expand_less</span>
            </div>
            <div className="p-6 space-y-6">
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                  <div className="relative flex items-center">
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-sm" 
                        type="text" 
                    />
                    <span className="material-symbols-outlined absolute right-4 text-slate-400 dark:text-slate-500 pointer-events-none text-[20px]">person</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                  <div className="relative flex items-center">
                    <input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-sm" 
                        type="email" 
                    />
                    <span className="material-symbols-outlined absolute right-4 text-slate-400 dark:text-slate-500 pointer-events-none text-[20px]">mail</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Security (Password) */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm border-t-2 border-t-primary/50">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Security</h3>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-[20px]">expand_less</span>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Current Password</label>
                  <div className="relative flex items-center">
                    <input 
                        name="currentPassword" 
                        value={formData.currentPassword} 
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-sm" 
                        type="password" 
                        placeholder="••••••••"
                    />
                    <span className="material-symbols-outlined absolute right-4 text-slate-400 dark:text-slate-500 pointer-events-none text-[20px]">lock</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">New Password</label>
                  <div className="relative flex items-center">
                    <input 
                        name="newPassword" 
                        value={formData.newPassword} 
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-sm" 
                        type="password" 
                        placeholder="Leave blank to keep current"
                    />
                    <span className="material-symbols-outlined absolute right-4 text-slate-400 dark:text-slate-500 pointer-events-none text-[20px]">key</span>
                  </div>
                  
                  {/* Password Guidelines - Only show when typing new password */}
                  {formData.newPassword && (
                      <div className="grid grid-cols-2 gap-2 mt-2 px-1 animate-in fade-in slide-in-from-top-1">
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.length ? 'text-green-500' : 'text-slate-500'}`}>
                            <span className="material-symbols-outlined text-[10px]">{passwordCriteria.length ? 'check_circle' : 'circle'}</span>
                            8+ Characters
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.upper ? 'text-green-500' : 'text-slate-500'}`}>
                            <span className="material-symbols-outlined text-[10px]">{passwordCriteria.upper ? 'check_circle' : 'circle'}</span>
                            Uppercase Letter
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.number ? 'text-green-500' : 'text-slate-500'}`}>
                            <span className="material-symbols-outlined text-[10px]">{passwordCriteria.number ? 'check_circle' : 'circle'}</span>
                            Number
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${passwordCriteria.special ? 'text-green-500' : 'text-slate-500'}`}>
                            <span className="material-symbols-outlined text-[10px]">{passwordCriteria.special ? 'check_circle' : 'circle'}</span>
                            Special Character
                        </div>
                    </div>
                  )}
                </div>

                {formData.newPassword && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Confirm New Password</label>
                        <div className="relative flex items-center">
                            <input 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-sm" 
                                type="password" 
                                placeholder="Re-enter new password"
                            />
                            <span className={`material-symbols-outlined absolute right-4 pointer-events-none text-[20px] ${formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-500' : 'text-slate-400'}`}>
                                {formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'check_circle' : 'check_circle'}
                            </span>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p className="text-[10px] text-red-500 ml-1 font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">error</span> Passwords do not match
                            </p>
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 w-full bg-white dark:bg-background-dark border-t border-slate-200 dark:border-white/10 p-4 z-20 pb-safe transition-colors">
        <div className="flex gap-3 max-w-3xl mx-auto w-full">
          <button onClick={() => navigate(-1)} className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-white/20 text-slate-600 dark:text-white font-bold tracking-wide hover:bg-slate-50 dark:hover:bg-surface-highlight active:scale-[0.98] transition-all text-sm uppercase">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all text-sm flex justify-center items-center gap-2 uppercase">
            <span className="material-symbols-outlined text-[20px]">save</span>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
