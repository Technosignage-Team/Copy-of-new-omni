
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'User',
      status: 'Active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // NOTE: In Supabase, you cannot create AUTH users from a public client.
        // We will insert a record into 'profiles' and assume the user will sign up 
        // using this email later, OR you can invite them via Supabase Dashboard.
        
        const { error } = await supabase
            .from('profiles')
            .insert({
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`,
                badge_color: formData.role === 'Admin' ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-600'
            });

        if (error) throw error;

        showToast("Profile placeholder created. User can now sign up with this email.");
        navigate('/users');
    } catch (e: any) {
        showToast(e.message || "Failed to create user", "error");
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative w-full">
      <header className="sticky top-0 z-10 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-4 justify-between border-b border-slate-200 dark:border-white/5 max-w-2xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5"><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="font-bold">Add User</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-5 max-w-xl mx-auto w-full">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Default Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 outline-none">
                    <option value="Admin">Admin</option>
                    <option value="Agent">Agent</option>
                    <option value="User">User</option>
                </select>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2">
                {loading ? <span className="animate-spin size-5 border-2 border-white/30 border-t-white rounded-full"></span> : "Create User Profile"}
            </button>
         </form>
      </main>
    </div>
  );
};

export default CreateUser;
