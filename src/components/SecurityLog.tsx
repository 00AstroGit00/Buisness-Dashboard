/**
 * Security Log Component - Upgraded UI
 * Displays all login attempts with device information and timestamps
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Shield, CheckCircle2, XCircle, LogOut, Lock, 
  Clock, Smartphone, Filter, Trash2, ShieldAlert,
  Fingerprint, Hash, ShieldCheck, Activity,
  ChevronRight, Search, History
} from 'lucide-react';
import { getSecurityLog, getSecurityLogSummary, clearSecurityLog, type SecurityLogEntry } from '../utils/securityLog';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

export default function SecurityLog() {
  const [logs, setLogs] = useState<SecurityLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'failure' | 'emergency'>('all');
  
  useEffect(() => {
    setLogs(getSecurityLog());
    const interval = setInterval(() => setLogs(getSecurityLog()), 10000);
    return () => clearInterval(interval);
  }, []);
  
  const summary = useMemo(() => getSecurityLogSummary(7), [logs]);
  
  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs;
    if (filter === 'success') return logs.filter((l) => l.eventType === 'login_success');
    if (filter === 'failure') return logs.filter((l) => l.eventType === 'login_failure');
    if (filter === 'emergency') return logs.filter((l) => l.eventType === 'emergency_lock');
    return logs;
  }, [logs, filter]);
  
  const handleClearLogs = () => {
    if (confirm('Authorize system wipe of all security logs? This audit trail cannot be recovered.')) {
      clearSecurityLog();
      setLogs([]);
    }
  };
  
  const getEventIcon = (eventType: SecurityLogEntry['eventType']) => {
    switch (eventType) {
      case 'login_success': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'login_failure': return <ShieldAlert className="text-red-500" size={18} />;
      case 'logout': return <LogOut className="text-blue-500" size={18} />;
      case 'emergency_lock': return <Lock className="text-orange-500" size={18} />;
      default: return <Shield className="text-gray-400" size={18} />;
    }
  };
  
  const getEventLabel = (eventType: SecurityLogEntry['eventType']) => {
    switch (eventType) {
      case 'login_success': return 'Access Granted';
      case 'login_failure': return 'Access Denied';
      case 'logout': return 'Session Terminated';
      case 'emergency_lock': return 'Emergency Protocol';
      default: return eventType.replace('_', ' ').toUpperCase();
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Security Auditing</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Authentication <span className="text-brushed-gold">Registry</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1">Enterprise-Grade Logging</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <ShieldCheck size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">W3C WebAuthn v2 Standard</span>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="danger" onClick={handleClearLogs} leftIcon={<Trash2 size={18} />} className="rounded-2xl shadow-xl shadow-red-500/10 font-black tracking-widest uppercase text-xs">
              Clear Audit Trail
           </Button>
        </div>
      </div>

      {/* Security Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-forest-green border-0 shadow-xl group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle2 size={80} /></div>
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-white/40">Verified Logins</p>
              <CheckCircle2 className="text-green-400" size={16} />
           </CardHeader>
           <h3 className="text-3xl font-black text-white tracking-tighter">{summary.totalLogins}</h3>
           <p className="text-[10px] font-bold text-white/40 mt-2 uppercase">Last 7 days aggregation</p>
        </Card>

        <Card className="bg-white border-0 shadow-xl group">
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-gray-400">Failed Intrusions</p>
              <ShieldAlert className="text-red-500" size={16} />
           </CardHeader>
           <h3 className="text-3xl font-black text-red-600 tracking-tighter">{summary.failedLogins}</h3>
           <p className="text-[10px] font-bold text-red-400 mt-2 uppercase tracking-widest animate-pulse">Critical Observation</p>
        </Card>

        <Card className="bg-white border-0 shadow-xl group">
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-gray-400">Integrity Score</p>
              <ShieldCheck className="text-brushed-gold" size={16} />
           </CardHeader>
           <h3 className="text-3xl font-black text-forest-green tracking-tighter">{summary.successRate}<span className="text-sm text-brushed-gold">%</span></h3>
           <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-brushed-gold rounded-full" style={{ width: `${summary.successRate}%` }}></div>
           </div>
        </Card>

        <Card className="bg-white border-0 shadow-xl group">
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-gray-400">Unique Nodes</p>
              <Smartphone className="text-forest-green" size={16} />
           </CardHeader>
           <h3 className="text-3xl font-black text-forest-green tracking-tighter">{summary.uniqueDevices.size}</h3>
           <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Authorized Terminals</p>
        </Card>
      </div>

      {/* Control Area */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-brushed-gold/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <Input 
              placeholder="Search by username, device ID or details..."
              leftIcon={<Search className="text-brushed-gold" size={20} />}
              className="py-4 rounded-2xl border-0 shadow-xl bg-white relative z-10 font-bold"
            />
         </div>
         <div className="flex gap-2 p-1.5 bg-white shadow-xl rounded-2xl border border-gray-100">
            {(['all', 'success', 'failure', 'emergency'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-forest-green text-white shadow-lg'
                    : 'text-forest-green/40 hover:bg-forest-green/5 hover:text-forest-green'
                }`}
              >
                {f}
              </button>
            ))}
         </div>
      </div>

      {/* Audit Table - Upgraded */}
      <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden p-0 bg-white/50 backdrop-blur-xl">
         <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/80">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-forest-green text-brushed-gold rounded-xl"><History size={20} /></div>
               <div>
                  <h3 className="text-xl font-black text-forest-green uppercase tracking-tight">System Audit Stream</h3>
                  <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">Immutable chronological events</p>
               </div>
            </div>
            <Badge variant="secondary" className="bg-forest-green/5 text-forest-green border-0 font-black px-4 py-1">LIVE FEED ACTIVE</Badge>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50">
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Timestamp</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Security Event</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Identity</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Terminal Node</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Protocol</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Telemetry</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-20">
                             <Shield size={64} />
                             <p className="font-black uppercase tracking-[0.3em] text-sm">No Security Events Intercepted</p>
                          </div>
                       </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className={`group transition-all duration-300 ${log.eventType === 'login_failure' ? 'bg-red-50/30' : log.eventType === 'emergency_lock' ? 'bg-orange-50/30' : 'hover:bg-brushed-gold/5'}`}>
                        <td className="px-6 py-5">
                           <p className="text-xs font-black text-forest-green/60 font-mono">
                              {log.timestamp.toLocaleTimeString('en-IN', { hour12: false })}
                           </p>
                           <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                              {log.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                           </p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
                                 {getEventIcon(log.eventType)}
                              </div>
                              <span className="font-black text-xs text-forest-green uppercase tracking-tight">
                                 {getEventLabel(log.eventType)}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-sm font-black text-forest-green tracking-tight">{log.userName || log.userId || 'ANONYMOUS'}</p>
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Principal ID</p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              <Smartphone size={12} className="text-forest-green/40" />
                              <span className="text-xs font-bold text-forest-green">{log.deviceName}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              {log.authMethod === 'webauthn' ? <Fingerprint size={12} className="text-green-600" /> : <Hash size={12} className="text-blue-600" />}
                              <Badge variant="secondary" className={`text-[8px] font-black border-0 uppercase ${log.authMethod === 'webauthn' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {log.authMethod === 'webauthn' ? 'Biometric' : 'PIN'}
                              </Badge>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-[10px] font-bold text-forest-green/60 leading-relaxed max-w-[200px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                              {log.details || 'SYSTEM_AUTO_LOG'}
                           </p>
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}