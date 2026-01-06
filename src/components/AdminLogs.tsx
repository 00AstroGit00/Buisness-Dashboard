/**
 * Admin Activity Audit Logs Component
 * Features: Comprehensive shift audit trail with date/user filtering.
 * High-performance list for audit transparency.
 */

import { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Smartphone, 
  Clock, 
  Calendar,
  ChevronDown,
  XCircle,
  FileSearch,
  ArrowRightCircle
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';

export default function AdminLogs() {
  const { activityLogs } = useBusinessStore();
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterAction, setFilterAction] = useState('');

  // --- 1. Audit Filtering Logic ---
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchUser = filterUser ? log.userName.toLowerCase().includes(filterUser.toLowerCase()) : true;
      const matchDate = filterDate ? log.timestamp.startsWith(filterDate) : true;
      const matchAction = filterAction ? log.action === filterAction : true;
      return matchUser && matchDate && matchAction;
    });
  }, [activityLogs, filterUser, filterDate, filterAction]);

  // Unique users for filter
  const users = useMemo(() => {
    return Array.from(new Set(activityLogs.map(l => l.userName)));
  }, [activityLogs]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in font-sans">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-forest-green flex items-center gap-3 font-serif">
          <History className="text-brushed-gold" size={32} />
          Shift Audit Trail
        </h2>
        <p className="text-forest-green/60 text-sm font-bold uppercase tracking-widest mt-1 tracking-tighter">Real-time activity logging for management</p>
      </div>

      {/* 2. Advanced Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2"><User size={12}/> Filter by Staff</label>
          <select 
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm text-forest-green outline-none focus:ring-2 focus:ring-brushed-gold"
          >
            <option value="">All Personnel</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2"><Calendar size={12}/> Select Date</label>
          <input 
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="w-full p-3 bg-gray-50 border-none rounded-xl font-bold text-sm text-forest-green outline-none"
          />
        </div>

        <button 
          onClick={() => { setFilterUser(''); setFilterDate(''); setFilterAction(''); }}
          className="py-3 bg-gray-100 text-forest-green rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <XCircle size={16}/> Reset Filters
        </button>
      </div>

      {/* 3. Audit Log List */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-forest-green p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <FileSearch className="text-brushed-gold" size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Event Audit Stream</span>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full">{filteredLogs.length} Records Found</span>
        </div>

        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-20 text-center text-gray-300 italic">No activity logs matching current filters</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-6 group">
                <div className="flex-shrink-0 flex items-center gap-4 w-48">
                  <div className="p-3 bg-gray-100 rounded-2xl text-forest-green group-hover:bg-brushed-gold/10 group-hover:text-brushed-gold transition-colors">
                    {log.action.includes('Room') ? <Calendar size={20}/> : <ArrowRightCircle size={20}/>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">{new Date(log.timestamp).toLocaleDateString('en-IN')}</p>
                    <p className="text-xs font-black text-forest-green tracking-tighter">{new Date(log.timestamp).toLocaleTimeString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.action === 'Peg Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.action}
                    </span>
                    <span className="text-xs font-black text-forest-green uppercase tracking-tight">{log.userName}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">{log.description}</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-2 justify-end text-gray-400">
                    <Smartphone size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{log.deviceId}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-400">
        <p className="text-xs text-blue-800 font-medium leading-relaxed">
          <strong>Security Protocol:</strong> Activity logs are immutable and cannot be deleted by shift personnel. The system maintains a rotating log of the last 1,000 major actions to optimize performance on the HP Laptop while ensuring a complete audit trail.
        </p>
      </div>
    </div>
  );
}
