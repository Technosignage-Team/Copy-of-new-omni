
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_TICKETS, DEFAULT_USERS } from '../data/mockData';

// FIX: Added explicit interface for Analytics stats to resolve 'unknown' and arithmetic errors
interface AnalyticsStats {
    total: number;
    closed: number;
    open: number;
    critical: number;
    resolutionRate: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
    agentPerf: Record<string, { total: number, closed: number }>;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState('12m'); // 1m, 3m, 6m, 12m

  useEffect(() => {
      // Check permissions
      if (user && user.role !== 'Admin' && user.role !== 'Agent') {
          navigate('/');
          return;
      }

      // Load tickets
      try {
          const saved = localStorage.getItem('omni_tickets');
          let loadedTickets = saved ? JSON.parse(saved) : DEFAULT_TICKETS;
          
          // Force use of default if local storage has stale/small data for demo purposes
          if (loadedTickets.length < 50) {
              loadedTickets = DEFAULT_TICKETS;
              localStorage.setItem('omni_tickets', JSON.stringify(DEFAULT_TICKETS));
          }
          setTickets(loadedTickets);
      } catch (e) {
          setTickets(DEFAULT_TICKETS);
      }
  }, [user, navigate]);

  // --- Calculations ---

  const stats = useMemo<AnalyticsStats>(() => {
      const now = Date.now();
      let cutoff = now;
      if (dateRange === '1m') cutoff = now - 30 * 24 * 60 * 60 * 1000;
      if (dateRange === '3m') cutoff = now - 90 * 24 * 60 * 60 * 1000;
      if (dateRange === '6m') cutoff = now - 180 * 24 * 60 * 60 * 1000;
      if (dateRange === '12m') cutoff = now - 365 * 24 * 60 * 60 * 1000;

      const filtered = tickets.filter(t => t.timestamp >= cutoff);
      const total = filtered.length;
      const closed = filtered.filter(t => t.tags.some((tag: any) => tag.label === 'Closed' || tag.label === 'Resolved')).length;
      const open = filtered.filter(t => t.tags.some((tag: any) => tag.label === 'Open' || tag.label === 'In Progress')).length;
      const critical = filtered.filter(t => t.tags.some((tag: any) => tag.label === 'Critical')).length;
      
      const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

      // Group by Type
      const byType: Record<string, number> = {};
      filtered.forEach(t => {
          const type = t.typeName || 'Other';
          byType[type] = (byType[type] || 0) + 1;
      });

      // Group by Status
      const byStatus: Record<string, number> = {};
      filtered.forEach(t => {
          const statusTag = t.tags.find((tag: any) => ['Open', 'In Progress', 'Pending', 'Closed', 'Resolved'].includes(tag.label));
          const status = statusTag ? statusTag.label : 'Unknown';
          byStatus[status] = (byStatus[status] || 0) + 1;
      });

      // Group by Month (for Trend)
      const byMonth: Record<string, number> = {};
      filtered.forEach(t => {
          const date = new Date(t.timestamp);
          const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
          byMonth[key] = (byMonth[key] || 0) + 1;
      });

      // Agent Performance
      const agentPerf: Record<string, { total: number, closed: number }> = {};
      filtered.forEach(t => {
          if (t.assignee && t.assignee !== 'Unassigned') {
              if (!agentPerf[t.assignee]) agentPerf[t.assignee] = { total: 0, closed: 0 };
              agentPerf[t.assignee].total++;
              const isClosed = t.tags.some((tag: any) => tag.label === 'Closed' || tag.label === 'Resolved');
              if (isClosed) agentPerf[t.assignee].closed++;
          }
      });

      return { total, closed, open, critical, resolutionRate, byType, byStatus, byMonth, agentPerf };
  }, [tickets, dateRange]);

  // --- SVG Chart Helpers ---

  const renderTrendLine = () => {
      // Ideally sort keys by date
      // Fixed: Explicitly handle Date conversion and numeric subtraction for sorting to fix line 252 error
      const sortedKeys = Object.keys(stats.byMonth).sort((a, b) => {
          const timeA = new Date(a).getTime() || 0;
          const timeB = new Date(b).getTime() || 0;
          return timeA - timeB;
      });
      const values = sortedKeys.map(k => stats.byMonth[k] || 0);
      
      if (values.length < 2) return null;

      // Prevent division by zero if all values are 0
      const max = Math.max(...values) || 1;
      const width = 1000;
      const height = 200;
      const step = width / (values.length - 1);

      const points = values.map((val, i) => {
          const x = i * step;
          // Fixed: Wrapped arithmetic components in Number() to satisfy type checker for line 264 error
          const y = Number(height) - ((Number(val) / Number(max)) * Number(height) * 0.8) - 10; // Padding
          // Guard against NaN
          const safeY = isNaN(y) ? height - 10 : y;
          return `${x},${safeY}`;
      }).join(' ');

      // Split for fill path
      const firstX = 0;
      // Fixed: Ensured all operands are explicitly treated as numbers to resolve 1-based line 281 and 287 errors
      const firstYValue = Number(values[0]) || 0;
      const firstY = Number(height) - ((Number(firstYValue) / Number(max)) * Number(height) * 0.8) - 10;

      return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="4" 
                points={points} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d={`M0,${height} L${firstX},${isNaN(firstY) ? height : firstY} ${points.replace(/,/g, ' L')} L${width},${height} Z`} 
                fill="url(#gradient)" 
              />
              {values.map((val, i) => (
                  <circle key={i} cx={i * step} cy={Number(height) - ((Number(val) / Number(max)) * Number(height) * 0.8) - 10} r="4" fill="#3b82f6" className="hover:r-6 transition-all" />
              ))}
          </svg>
      );
  };

  return (
    <div className="bg-slate-50 dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col relative w-full transition-colors duration-300">
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics & Reports</h1>
                <p className="text-slate-500 dark:text-slate-400">Performance metrics and ticket trends.</p>
            </div>
            <div className="flex bg-white dark:bg-surface-dark p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                {['1m', '3m', '6m', '12m'].map(range => (
                    <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dateRange === range ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        {range.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">confirmation_number</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Volume</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">trending_up</span> +12% vs last period</p>
            </div>
            
            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Resolution Rate</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.resolutionRate}%</p>
                <p className="text-xs text-slate-400 mt-1">Target: 90%</p>
            </div>

            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Critical Issues</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.critical}</p>
                <p className="text-xs text-red-500 mt-1 font-bold">Needs Attention</p>
            </div>

            <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Avg Time</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">4.2h</p>
                <p className="text-xs text-green-500 mt-1">-0.5h improvement</p>
            </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Ticket Volume Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Ticket Volume Trends</h3>
                <div className="flex-1 min-h-[200px] w-full px-2">
                    {renderTrendLine()}
                </div>
                <div className="flex justify-between mt-4 px-2 text-xs text-slate-400 font-mono">
                    {/* FIX: Explicitly cast operands to Number to resolve 1-based arithmetic errors on line 256 */}
                    {(Object.keys(stats.byMonth).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) as string[]).map((m, i, arr) => (
                        Number(i) % Math.ceil(Number(arr.length) / 6) === 0 ? <span key={m}>{m}</span> : null
                    ))}
                </div>
            </div>

            {/* Distribution by Status */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Status Distribution</h3>
                <div className="space-y-4">
                    {/* FIX: Explicitly cast entries and operands to resolve 1-based arithmetic errors on line 285 */}
                    {(Object.entries(stats.byStatus) as [string, number][]).map(([status, count]) => {
                        const percent = Math.round((Number(count) / Number(stats.total)) * 100) || 0;
                        let color = 'bg-slate-400';
                        if(status === 'Open') color = 'bg-green-500';
                        if(status === 'In Progress') color = 'bg-blue-500';
                        if(status === 'Pending') color = 'bg-orange-500';
                        if(status === 'Closed' || status === 'Resolved') color = 'bg-slate-600';

                        return (
                            <div key={status}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{status}</span>
                                    <span className="text-slate-500">{count} ({percent}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Ticket Types Bar Chart */}
             <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Volume by Type</h3>
                <div className="space-y-3">
                    {/* FIX: Explicitly cast entries and operands to resolve 1-based arithmetic errors on line 291/307 */}
                    {(Object.entries(stats.byType) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-32 truncate text-right">{type}</span>
                            <div className="flex-1 h-8 bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden relative group">
                                <div 
                                    className="h-full bg-primary/80 group-hover:bg-primary transition-colors rounded-lg flex items-center px-2" 
                                    style={{ width: `${(Number(count) / Number(stats.total)) * 100}%` }}
                                >
                                    <span className="text-xs font-bold text-white drop-shadow-md">{count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Agent Leaderboard */}
             <div className="bg-white dark:bg-surface-dark p-0 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agent Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3 font-bold">Agent</th>
                                <th className="px-6 py-3 font-bold text-center">Assigned</th>
                                <th className="px-6 py-3 font-bold text-center">Resolved</th>
                                <th className="px-6 py-3 font-bold text-center">Efficiency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {/* FIX: Explicitly cast stats.agentPerf entries to resolve unknown property access errors at lines 315-329 */}
                            {(Object.entries(stats.agentPerf) as [string, { total: number; closed: number }][])
                                .sort((a,b) => b[1].closed - a[1].closed)
                                .slice(0, 6)
                                .map(([name, data]) => {
                                    const eff = Math.round((data.closed / data.total) * 100) || 0;
                                    const userObj = DEFAULT_USERS.find(u => u.name === name);
                                    return (
                                        <tr key={name} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                    <img src={userObj?.avatar || `https://ui-avatars.com/api/?name=${name}`} alt={name} className="w-full h-full object-cover" />
                                                </div>
                                                {name}
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">{data.total}</td>
                                            <td className="px-6 py-4 text-center font-bold text-primary">{data.closed}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${eff > 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : eff > 50 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {eff}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
