
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (!error && data) setUsers(data);
      setLoading(false);
  };

  const tabs = ['All', 'Admins', 'Agents', 'Users'];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesRole = true;
        if (activeTab === 'Admins') matchesRole = user.role === 'Admin';
        else if (activeTab === 'Agents') matchesRole = user.role === 'Agent';
        else if (activeTab === 'Users') matchesRole = user.role === 'User';

        return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, activeTab]);

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display antialiased min-h-screen relative overflow-x-hidden pb-24 md:pb-8 text-slate-900 dark:text-white max-w-7xl mx-auto w-full transition-colors duration-300">
      <div className="flex flex-col gap-6 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <button 
              onClick={() => navigate('/users/new')}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20"
          >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="hidden md:inline">New User</span>
          </button>
        </div>

        <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-white dark:bg-surface-dark border-none rounded-2xl pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 text-sm font-medium shadow-sm transition-all" 
              placeholder="Search team members..." 
            />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-white text-slate-600 dark:bg-surface-dark dark:text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="flex flex-col gap-3 px-4 md:px-6 pb-20">
        {loading ? (
            <div className="flex justify-center py-10">
                <span className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            </div>
        ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                    <div key={user.id} onClick={() => navigate(`/user/${user.id}/edit`)} className="group relative flex items-center gap-5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 p-5 rounded-3xl hover:border-blue-300 dark:hover:border-white/20 transition-all cursor-pointer shadow-sm">
                        <div className="relative shrink-0">
                            <img src={user.avatar} className="size-16 rounded-full object-cover ring-2 ring-slate-100" />
                            <div className={`absolute bottom-0 right-0 size-4 border-[3px] border-white dark:border-surface-dark rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.name}</h3>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent dark:border-white/5 ${user.badge_color || 'bg-slate-100 text-slate-500'}`}>
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm truncate font-medium">{user.email}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                <p>No users found.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default Users;
