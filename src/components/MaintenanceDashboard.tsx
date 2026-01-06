/**
 * Maintenance and Update Dashboard
 * Manages system health, updates, cleanup, and growth metrics
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Trash2,
  Download,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Database,
  HardDrive,
  GitBranch,
  Clock,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { useSystemHeartbeat } from '../hooks/useSystemHeartbeat';
import {
  analyzeDuplicateBackups,
  getCleanupRecommendations,
  cleanupDuplicateBackups,
  getRetentionRecommendations,
  performSystemMaintenance,
} from '../utils/assetCleanup';
import {
  checkForUpdates,
  getCachedUpdates,
  shouldCheckForUpdates,
  getCurrentVersion,
  getUpdatePriority,
  getUpdateBadgeColor,
  markUpdateAsSeen,
  type UpdateCheckResult,
} from '../utils/autoUpdater';
import { getHeartbeatSummary } from '../utils/systemHeartbeat';
import { useStore } from '../store/Store';
import { transactionHistory } from '../store/transactionHistory';

export default function MaintenanceDashboard() {
  const { lastHeartbeat, isChecking, performCheck } = useSystemHeartbeat();
  const [cleanupReport, setCleanupReport] = useState(() => getCleanupRecommendations());
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isPerformingMaint, setIsPerformingMaint] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(() => getCachedUpdates());
  
  // ... existing code ...

  const handleSystemMaint = () => {
    if (!confirm('Run System Maintenance? This will permanently clear security logs older than 30 days.')) return;
    
    setIsPerformingMaint(true);
    setTimeout(() => {
      const result = performSystemMaintenance();
      alert(`Maintenance Complete!\nLogs Removed: ${result.logsRemoved}\nSpace Freed: ${result.spaceFreed.toFixed(2)} KB`);
      setIsPerformingMaint(false);
    }, 1000);
  };


  
  // Calculate growth metrics
  const growthMetrics = useMemo(() => {
    const totalPegsSold = transactionHistory.getAllTransactions()
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.pegsSold, 0);
    
    const totalGuests = dailySales.reduce((sum, sale) => {
      // Estimate guests from room rent (assuming avg ₹1000 per room)
      return sum + Math.floor(sale.roomRent / 1000);
    }, 0);
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRevenue = dailySales.reduce(
      (sum, sale) => sum + sale.roomRent + sale.restaurantBills + sale.barSales,
      0
    );
    
    const totalRecords = inventory.length + dailySales.length + expenses.length + transactionHistory.getAllTransactions().length;
    
    return {
      totalPegsSold,
      totalGuests,
      totalExpensesLogged: expenses.length,
      totalExpensesAmount: totalExpenses,
      totalRevenue,
      totalRecords,
      inventoryItems: inventory.length,
      salesEntries: dailySales.length,
      expenseEntries: expenses.length,
      transactions: transactionHistory.getAllTransactions().length,
    };
  }, [inventory, dailySales, expenses]);
  
  const heartbeatSummary = getHeartbeatSummary();
  const retentionInfo = getRetentionRecommendations();
  
  // Check for updates on mount if needed
  useEffect(() => {
    if (shouldCheckForUpdates()) {
      handleCheckUpdates();
    }
  }, []);
  
  const handleCleanup = async () => {
    if (!confirm(`This will remove ${cleanupReport.duplicates} duplicate backup files and free up ${cleanupReport.spaceSaved.toFixed(2)} MB. Continue?`)) {
      return;
    }
    
    setIsCleaningUp(true);
    try {
      const result = cleanupDuplicateBackups();
      setCleanupReport(result.report);
      alert(`Cleanup successful! Removed ${result.report.filesRemoved.length} duplicate files.`);
    } catch (error) {
      alert('Cleanup failed. Please try again.');
      console.error(error);
    } finally {
      setIsCleaningUp(false);
    }
  };
  
  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const result = await checkForUpdates();
      setUpdateInfo(result);
    } catch (error) {
      console.error('Update check failed:', error);
    } finally {
      setIsCheckingUpdates(false);
    }
  };
  
  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-forest-green mb-2 flex items-center gap-3">
          <Wrench className="text-brushed-gold" size={32} />
          Maintenance & Updates
        </h2>
        <p className="text-forest-green/70">
          System health monitoring and infrastructure management
        </p>
      </div>
      
      {/* System Heartbeat */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-forest-green flex items-center gap-2">
            <Activity className="text-brushed-gold" size={20} />
            System Heartbeat
          </h3>
          <button
            onClick={performCheck}
            disabled={isChecking}
            className="px-4 py-2 bg-brushed-gold text-forest-green rounded-lg hover:bg-brushed-gold/90 transition-colors text-sm font-medium flex items-center gap-2 touch-manipulation disabled:opacity-50"
          >
            {isChecking ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />}
            {isChecking ? 'Checking...' : 'Run Check Now'}
          </button>
        </div>
        
        {lastHeartbeat && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-4 rounded-lg border ${getStatusColor(lastHeartbeat.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Status</span>
                {lastHeartbeat.status === 'healthy' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
              </div>
              <p className="text-2xl font-bold capitalize">{lastHeartbeat.status}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-forest-green/70">Uptime (24h)</span>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-forest-green">{heartbeatSummary.uptime}%</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-forest-green/70">Storage Used</span>
                <HardDrive className="text-brushed-gold" size={20} />
              </div>
              <p className="text-2xl font-bold text-forest-green">
                {(lastHeartbeat.storageUsed / 1024).toFixed(1)} MB
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-forest-green/70">Last Check</span>
                <Clock className="text-brushed-gold" size={20} />
              </div>
              <p className="text-sm font-bold text-forest-green">
                {lastHeartbeat.timestamp.toLocaleTimeString('en-IN')}
              </p>
            </div>
          </div>
        )}
        
        {lastHeartbeat && lastHeartbeat.issues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Issues Detected
            </h4>
            <ul className="space-y-1">
              {lastHeartbeat.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-700">• {issue}</li>
              ))}
            </ul>
            {lastHeartbeat.recommendations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm font-medium text-red-800 mb-1">Recommendations:</p>
                <ul className="space-y-1">
                  {lastHeartbeat.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-red-700">→ {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Maintenance Mode */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-forest-green mb-2 flex items-center gap-2">
            <RefreshCw className={`text-brushed-gold ${isPerformingMaint ? 'animate-spin' : ''}`} size={20} />
            Maintenance Mode
          </h3>
          <p className="text-sm text-forest-green/60 mb-6">
            Keep your HP Laptop running at peak performance. This action clears historical data and security logs older than 30 days to free up NVMe SSD space and browser memory.
          </p>
        </div>
        
        <button
          onClick={handleSystemMaint}
          disabled={isPerformingMaint}
          className="w-full py-4 bg-forest-green text-brushed-gold rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-forest-green-light disabled:opacity-50 transition-all"
        >
          {isPerformingMaint ? 'Optimizing System...' : 'Run 30-Day Cleanup'}
        </button>
      </div>
      
      {/* Auto-Updater */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-forest-green flex items-center gap-2">
            <GitBranch className="text-brushed-gold" size={20} />
            Auto-Updater
          </h3>
          <button
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdates}
            className="px-4 py-2 bg-brushed-gold text-forest-green rounded-lg hover:bg-brushed-gold/90 transition-colors text-sm font-medium flex items-center gap-2 touch-manipulation disabled:opacity-50"
          >
            {isCheckingUpdates ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {isCheckingUpdates ? 'Checking...' : 'Check for Updates'}
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-forest-green/70">Current Version: <span className="font-bold text-forest-green">{getCurrentVersion()}</span></p>
          {updateInfo && (
            <p className="text-xs text-forest-green/60 mt-1">
              Last checked: {updateInfo.lastChecked.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        
        {updateInfo && updateInfo.hasUpdates ? (
          <div className="space-y-3">
            {updateInfo.updates.map((update, index) => (
              <div key={index} className="border border-brushed-gold/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-forest-green">{update.title}</h4>
                    <p className="text-xs text-forest-green/60 mt-1">
                      Version {update.version} • {update.releaseDate.toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getUpdateBadgeColor(update)}`}>
                    {update.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-forest-green/80 mb-3">{update.description}</p>
                <button
                  onClick={() => markUpdateAsSeen(update.version)}
                  className="text-sm text-brushed-gold hover:text-brushed-gold/80 font-medium"
                >
                  View Release Notes {'>'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-forest-green/50">
            <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
            <p className="font-medium">You're up to date!</p>
            <p className="text-sm mt-1">No updates available at this time.</p>
          </div>
        )}
      </div>
      
      {/* Asset Cleanup */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-forest-green flex items-center gap-2">
            <Trash2 className="text-brushed-gold" size={20} />
            Asset Cleanup
          </h3>
          <button
            onClick={handleCleanup}
            disabled={isCleaningUp || cleanupReport.duplicates === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCleaningUp ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            {isCleaningUp ? 'Cleaning...' : 'Clean Duplicates'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-forest-green/70 mb-1">Total Backups</p>
            <p className="text-2xl font-bold text-forest-green">{cleanupReport.totalBackups}</p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Duplicates Found</p>
            <p className="text-2xl font-bold text-orange-600">{cleanupReport.duplicates}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 mb-1">Space Recoverable</p>
            <p className="text-2xl font-bold text-green-600">{cleanupReport.spaceSaved.toFixed(2)} MB</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">{cleanupReport.recommendation}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-forest-green mb-2">Retention Policy</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-forest-green/70">Last 30 days:</span>
              <span className="ml-2 font-bold text-forest-green">{retentionInfo.keepAll}</span>
            </div>
            <div>
              <span className="text-forest-green/70">Weekly (3mo):</span>
              <span className="ml-2 font-bold text-forest-green">{retentionInfo.keepWeekly}</span>
            </div>
            <div>
              <span className="text-forest-green/70">Monthly (1yr):</span>
              <span className="ml-2 font-bold text-forest-green">{retentionInfo.keepMonthly}</span>
            </div>
            <div>
              <span className="text-forest-green/70">Can Delete:</span>
              <span className="ml-2 font-bold text-red-600">{retentionInfo.canDelete}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Growth Metrics */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
        <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
          <BarChart3 className="text-brushed-gold" size={20} />
          Total Records Managed
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Pegs Sold</span>
              <Database className="text-green-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-green-700">{growthMetrics.totalPegsSold.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">Total liquor sales</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Guests</span>
              <Database className="text-blue-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-blue-700">{growthMetrics.totalGuests.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">Checked-in guests</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700">Expenses</span>
              <Database className="text-orange-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-orange-700">{growthMetrics.totalExpensesLogged.toLocaleString()}</p>
            <p className="text-xs text-orange-600 mt-1">Expense records</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Total Records</span>
              <TrendingUp className="text-purple-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-purple-700">{growthMetrics.totalRecords.toLocaleString()}</p>
            <p className="text-xs text-purple-600 mt-1">All database entries</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-forest-green to-forest-green/90 rounded-lg text-white">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={18} />
            Digital Infrastructure Growth
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-brushed-gold/80">Inventory Items</p>
              <p className="text-xl font-bold">{growthMetrics.inventoryItems}</p>
            </div>
            <div>
              <p className="text-brushed-gold/80">Sales Entries</p>
              <p className="text-xl font-bold">{growthMetrics.salesEntries}</p>
            </div>
            <div>
              <p className="text-brushed-gold/80">Expense Logs</p>
              <p className="text-xl font-bold">{growthMetrics.expenseEntries}</p>
            </div>
            <div>
              <p className="text-brushed-gold/80">Transactions</p>
              <p className="text-xl font-bold">{growthMetrics.transactions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

