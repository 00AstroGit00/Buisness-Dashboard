/**
 * Security Log Component
 * Displays all login attempts with device information and timestamps
 */

import { useState, useEffect, useMemo } from 'react';
import { Shield, CheckCircle, XCircle, LogOut, Lock, Clock, Smartphone, Filter } from 'lucide-react';
import { getSecurityLog, getSecurityLogSummary, clearSecurityLog, type SecurityLogEntry } from '../utils/securityLog';

export default function SecurityLog() {
  const [logs, setLogs] = useState<SecurityLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'failure' | 'emergency'>('all');
  
  useEffect(() => {
    // Load logs
    setLogs(getSecurityLog());
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      setLogs(getSecurityLog());
    }, 10000);
    
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
    if (confirm('Are you sure you want to clear all security logs? This action cannot be undone.')) {
      clearSecurityLog();
      setLogs([]);
    }
  };
  
  const getEventIcon = (eventType: SecurityLogEntry['eventType']) => {
    switch (eventType) {
      case 'login_success':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'login_failure':
        return <XCircle className="text-red-600" size={18} />;
      case 'logout':
        return <LogOut className="text-blue-600" size={18} />;
      case 'emergency_lock':
        return <Lock className="text-orange-600" size={18} />;
      default:
        return <Shield className="text-gray-600" size={18} />;
    }
  };
  
  const getEventLabel = (eventType: SecurityLogEntry['eventType']) => {
    switch (eventType) {
      case 'login_success':
        return 'Login Success';
      case 'login_failure':
        return 'Login Failed';
      case 'logout':
        return 'Logout';
      case 'emergency_lock':
        return 'Emergency Lock';
      case 'session_expired':
        return 'Session Expired';
      default:
        return eventType;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-forest-green mb-2 flex items-center gap-3">
          <Shield className="text-brushed-gold" size={32} />
          Security Log
        </h2>
        <p className="text-forest-green/70">
          Track all login attempts and security events across devices
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-forest-green/70">Total Logins (7d)</span>
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-forest-green">{summary.totalLogins}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-forest-green/70">Failed Attempts</span>
            <XCircle className="text-red-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-red-600">{summary.failedLogins}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-forest-green/70">Success Rate</span>
            <Shield className="text-brushed-gold" size={20} />
          </div>
          <p className="text-3xl font-bold text-forest-green">{summary.successRate}%</p>
        </div>
        
        <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-forest-green/70">Devices</span>
            <Smartphone className="text-brushed-gold" size={20} />
          </div>
          <p className="text-3xl font-bold text-forest-green">{summary.uniqueDevices.size}</p>
        </div>
      </div>
      
      {/* Filters and Actions */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="text-brushed-gold" size={20} />
            <span className="text-sm font-medium text-forest-green">Filter:</span>
            <div className="flex gap-2">
              {(['all', 'success', 'failure', 'emergency'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    filter === f
                      ? 'bg-brushed-gold text-forest-green'
                      : 'bg-gray-100 text-forest-green/70 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium touch-manipulation"
          >
            Clear All Logs
          </button>
        </div>
      </div>
      
      {/* Security Log Table */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-forest-green/10 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forest-green uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    Timestamp
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forest-green uppercase tracking-wider">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forest-green uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forest-green uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} />
                    Device
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forest-green uppercase tracking-wider">
                  Auth Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forest-green uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brushed-gold/10">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-forest-green/50">
                    No security log entries found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-forest-green/5 transition-colors ${
                      log.eventType === 'login_failure' ? 'bg-red-50/30' :
                      log.eventType === 'emergency_lock' ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-forest-green whitespace-nowrap">
                      {log.timestamp.toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getEventIcon(log.eventType)}
                        <span className="font-medium text-forest-green">
                          {getEventLabel(log.eventType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-forest-green">
                      {log.userName || log.userId || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-forest-green font-medium">
                      {log.deviceName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.authMethod === 'webauthn'
                            ? 'bg-green-100 text-green-800'
                            : log.authMethod === 'pin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.authMethod === 'webauthn' ? 'Fingerprint' : log.authMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-forest-green/70">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

