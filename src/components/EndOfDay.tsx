/**
 * End of Day Summary Component
 * Daily Closing Report with Export and Auto-Backup
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Download, Calendar, TrendingUp, Package, DollarSign, CheckCircle, Save, Bell } from 'lucide-react';
import { useStore } from '../store/Store';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { exportEndOfDayReport, exportInventoryToExcel } from '../utils/endOfDayExporter';
import { createBackup, getBackupReminderStatus } from '../utils/backupManager';
import { scheduleAutoSync, getSyncStatus, triggerManualSync } from '../utils/cloudSync';
import PrivateNumber from './PrivateNumber';

export default function EndOfDay() {
  const { inventory, dailySales, expenses } = useStore();
  const [backupStatus, setBackupStatus] = useState<{ lastBackup: Date | null; nextBackup: Date | null } | null>(null);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ lastSync: Date | null; nextSync: Date | null; syncCount: number } | null>(null);

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Calculate daily closing report metrics
  const closingReport = useMemo(() => {
    // Total Pegs Sold (from inventory)
    const totalPegsSold = inventory.reduce((sum, item) => {
      return sum + (item.sales || 0);
    }, 0);

    // Room Revenue for today
    const todaySales = dailySales.filter((sale) => sale.date === today);
    const roomRevenue = todaySales.reduce((sum, sale) => sum + sale.roomRent, 0);
    const restaurantRevenue = todaySales.reduce((sum, sale) => sum + sale.restaurantBills, 0);
    const barRevenue = todaySales.reduce((sum, sale) => sum + sale.barSales, 0);
    const totalRevenue = roomRevenue + restaurantRevenue + barRevenue;

    // Total Expenses for today
    const todayExpenses = expenses.filter((expense) => expense.date === today);
    const totalExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Expenses by category
    const expensesByCategory = todayExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Net Profit
    const netProfit = totalRevenue - totalExpenses;

    return {
      date: today,
      totalPegsSold,
      roomRevenue,
      restaurantRevenue,
      barRevenue,
      totalRevenue,
      totalExpenses,
      expensesByCategory,
      netProfit,
      salesCount: todaySales.length,
      expenseCount: todayExpenses.length,
    };
  }, [inventory, dailySales, expenses, today]);

  // Handle auto-backup (triggered at 11 PM) - using useCallback to avoid dependency issues
  const handleAutoBackup = useCallback(() => {
    const backupFile = createBackup();
    if (backupFile) {
      console.log(`Auto-backup completed: ${backupFile.name}`);
      setBackupStatus(getBackupReminderStatus());
      
      // Show notification (could be enhanced with a toast library)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Auto-Backup Complete', {
          body: `Backup saved: ${backupFile.name}`,
          icon: '/favicon.ico',
        });
      }
    }
  }, []);

  // Check backup status and set up reminder
  useEffect(() => {
    // Schedule cloud sync (returns cleanup function)
    let cleanupSync: (() => void) | undefined;
    try {
      cleanupSync = scheduleAutoSync();
    } catch (error) {
      console.error('Error scheduling cloud sync:', error);
    }
    
    const checkBackupStatus = () => {
      const status = getBackupReminderStatus();
      setBackupStatus(status);
      
      // Check cloud sync status
      const sync = getSyncStatus();
      setSyncStatus(sync);

      // Show reminder if backup is due (within 1 hour of 11 PM)
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's between 10:30 PM and 11:30 PM
      if ((hours === 22 && minutes >= 30) || (hours === 23 && minutes <= 30)) {
        setShowBackupReminder(true);
      }
    };

    checkBackupStatus();
    
    // Check every minute
    const interval = setInterval(checkBackupStatus, 60000);

    // Set up 11 PM backup reminder
    const now = new Date();
    const backupTime = new Date();
    backupTime.setHours(23, 0, 0, 0); // 11:00 PM

    // If it's already past 11 PM today, schedule for tomorrow
    if (now > backupTime) {
      backupTime.setDate(backupTime.getDate() + 1);
    }

    const timeUntilBackup = backupTime.getTime() - now.getTime();
    const backupTimeout = setTimeout(() => {
      setShowBackupReminder(true);
      
      // Trigger auto-backup
      handleAutoBackup();
    }, timeUntilBackup);

    return () => {
      clearInterval(interval);
      clearTimeout(backupTimeout);
      if (cleanupSync) cleanupSync();
    };
  }, [handleAutoBackup]);

  // Handle export to Excel (Inventory Management format)
  const handleExportToExcel = () => {
    exportInventoryToExcel(inventory, closingReport);
  };

  // Handle export daily closing report
  const handleExportClosingReport = () => {
    exportEndOfDayReport(closingReport, dailySales.filter(s => s.date === today), expenses.filter(e => e.date === today));
  };

  // Handle manual backup
  const handleManualBackup = () => {
    const backupFile = createBackup();
    if (backupFile) {
      setBackupStatus(getBackupReminderStatus());
      alert(`Backup created successfully: ${backupFile.name}`);
    }
  };

  // Handle cloud sync
  const handleCloudSync = () => {
    const syncFile = triggerManualSync();
    if (syncFile) {
      setSyncStatus(getSyncStatus());
      alert(`Cloud sync completed. Please save to Documents/Backups/: ${syncFile.name}`);
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-hotel-forest mb-2 flex items-center gap-3">
          <Calendar className="text-hotel-gold" size={32} />
          End of Day Summary
        </h2>
        <p className="text-hotel-forest/70">
          Daily closing report for {new Date(today).toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Backup Reminder Banner */}
      {showBackupReminder && (
        <div className="bg-brushed-gold/20 border-2 border-brushed-gold rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Bell className="text-brushed-gold mt-1 shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-hotel-forest mb-1">Auto-Backup Reminder</h3>
              <p className="text-sm text-hotel-forest/80 mb-3">
                It's time for your daily backup at 11:00 PM. Your localStorage data will be automatically saved to Business-documents/Backups.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleAutoBackup();
                    setShowBackupReminder(false);
                  }}
                  className="px-4 py-2 bg-brushed-gold text-forest-green rounded-lg hover:bg-brushed-gold/90 transition-colors font-medium flex items-center gap-2 touch-manipulation"
                >
                  <Save size={18} />
                  Create Backup Now
                </button>
                <button
                  onClick={() => setShowBackupReminder(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium touch-manipulation"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Closing Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pegs Sold */}
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Total Pegs Sold</span>
            <Package className="text-hotel-gold" size={20} />
          </div>
          <p className="text-3xl font-bold text-hotel-forest">{formatNumber(closingReport.totalPegsSold, 0)}</p>
          <p className="text-xs text-hotel-forest/50 mt-1">across all products</p>
        </div>

        {/* Room Revenue */}
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Room Revenue</span>
            <DollarSign className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-hotel-forest">
            <PrivateNumber value={closingReport.roomRevenue} format={formatCurrency} />
          </div>
          <p className="text-xs text-hotel-forest/50 mt-1">from {closingReport.salesCount} sale(s)</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl p-6 border border-hotel-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-hotel-forest/70">Total Expenses</span>
            <TrendingUp className="text-red-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-hotel-forest">
            <PrivateNumber value={closingReport.totalExpenses} format={formatCurrency} />
          </div>
          <p className="text-xs text-hotel-forest/50 mt-1">{closingReport.expenseCount} expense entries</p>
        </div>

        {/* Net Profit */}
        <div className={`rounded-xl p-6 border shadow-md ${
          closingReport.netProfit >= 0
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Net Profit</span>
            <TrendingUp className={closingReport.netProfit >= 0 ? 'text-green-600' : 'text-red-600'} size={20} />
          </div>
          <div className={`text-3xl font-bold ${
            closingReport.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            <PrivateNumber 
              value={closingReport.netProfit} 
              format={formatCurrency} 
              alwaysBlur={true} 
            />
          </div>
          <p className="text-xs opacity-70 mt-1">
            {closingReport.totalRevenue > 0 
              ? `${formatNumber((closingReport.netProfit / closingReport.totalRevenue) * 100, 1)}% margin`
              : 'No revenue'
            }
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
          <h3 className="text-lg font-semibold text-hotel-forest mb-4 flex items-center gap-2">
            <TrendingUp className="text-hotel-gold" size={20} />
            Revenue Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-hotel-gold/10">
              <span className="text-hotel-forest">Room Rent</span>
              <span className="font-semibold text-hotel-forest">{formatCurrency(closingReport.roomRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-hotel-gold/10">
              <span className="text-hotel-forest">Restaurant Bills</span>
              <span className="font-semibold text-hotel-forest">{formatCurrency(closingReport.restaurantRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-hotel-gold/10">
              <span className="text-hotel-forest">Bar Sales</span>
              <span className="font-semibold text-hotel-forest">{formatCurrency(closingReport.barRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-hotel-gold/30">
              <span className="font-bold text-hotel-forest text-lg">Total Revenue</span>
              <span className="font-bold text-brushed-gold text-lg">{formatCurrency(closingReport.totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
          <h3 className="text-lg font-semibold text-hotel-forest mb-4 flex items-center gap-2">
            <TrendingUp className="text-red-600" size={20} />
            Expenses Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(closingReport.expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center py-2 border-b border-hotel-gold/10">
                <span className="text-hotel-forest capitalize">{category}</span>
                <span className="font-semibold text-hotel-forest">{formatCurrency(amount)}</span>
              </div>
            ))}
            {Object.keys(closingReport.expensesByCategory).length === 0 && (
              <p className="text-hotel-forest/50 text-center py-4">No expenses recorded for today</p>
            )}
            <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-hotel-gold/30">
              <span className="font-bold text-hotel-forest text-lg">Total Expenses</span>
              <span className="font-bold text-red-600 text-lg">{formatCurrency(closingReport.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
        <h3 className="text-lg font-semibold text-hotel-forest mb-4 flex items-center gap-2">
          <FileText className="text-hotel-gold" size={20} />
          Export Reports
        </h3>
        <p className="text-sm text-hotel-forest/70 mb-4">
          Export today's closing report and inventory data for physical filing
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportClosingReport}
            className="px-6 py-4 bg-hotel-forest text-hotel-gold rounded-lg hover:bg-hotel-forest-light transition-colors font-medium flex items-center justify-center gap-3 touch-manipulation"
          >
            <Download size={20} />
            Export Daily Closing Report
          </button>
          <button
            onClick={handleExportToExcel}
            className="px-6 py-4 bg-brushed-gold text-forest-green rounded-lg hover:bg-brushed-gold/90 transition-colors font-medium flex items-center justify-center gap-3 touch-manipulation"
          >
            <FileText size={20} />
            Export Inventory (Excel Format)
          </button>
        </div>
      </div>

      {/* Backup Status */}
      <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
        <h3 className="text-lg font-semibold text-hotel-forest mb-4 flex items-center gap-2">
          <Save className="text-hotel-gold" size={20} />
          Auto-Backup Status
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 mt-1 shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-medium text-hotel-forest">Automatic Backup</p>
              <p className="text-sm text-hotel-forest/70 mt-1">
                Your localStorage data is automatically backed up every day at 11:00 PM to Business-documents/Backups folder.
              </p>
            </div>
          </div>
          {backupStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-hotel-forest/5 rounded-lg">
                <p className="text-xs text-hotel-forest/60 mb-1">Last Backup</p>
                <p className="font-semibold text-hotel-forest">
                  {backupStatus.lastBackup
                    ? backupStatus.lastBackup.toLocaleString('en-IN')
                    : 'Never'}
                </p>
              </div>
              <div className="p-4 bg-hotel-forest/5 rounded-lg">
                <p className="text-xs text-hotel-forest/60 mb-1">Next Backup</p>
                <p className="font-semibold text-hotel-forest">
                  {backupStatus.nextBackup
                    ? backupStatus.nextBackup.toLocaleString('en-IN')
                    : 'Scheduled for 11:00 PM'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleManualBackup}
            className="w-full md:w-auto px-6 py-3 bg-hotel-forest text-hotel-gold rounded-lg hover:bg-hotel-forest-light transition-colors font-medium flex items-center justify-center gap-2 touch-manipulation"
          >
            <Save size={18} />
            Create Backup Now
          </button>
        </div>

        {/* Cloud Sync Status */}
        <div className="bg-white rounded-xl border border-hotel-gold/20 shadow-md p-6">
          <h3 className="text-lg font-semibold text-hotel-forest mb-4 flex items-center gap-2">
            <Download className="text-hotel-gold" size={20} />
            Cloud Sync Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1 shrink-0" size={20} />
              <div className="flex-1">
                <p className="font-medium text-hotel-forest">Automatic Cloud Sync</p>
                <p className="text-sm text-hotel-forest/70 mt-1">
                  Your localStorage data is automatically synced every night at 11:00 PM to Documents/Backups folder.
                </p>
              </div>
            </div>
            {syncStatus && (
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="p-4 bg-hotel-forest/5 rounded-lg">
                  <p className="text-xs text-hotel-forest/60 mb-1">Last Sync</p>
                  <p className="font-semibold text-hotel-forest">
                    {syncStatus.lastSync
                      ? syncStatus.lastSync.toLocaleString('en-IN')
                      : 'Never'}
                  </p>
                </div>
                <div className="p-4 bg-hotel-forest/5 rounded-lg">
                  <p className="text-xs text-hotel-forest/60 mb-1">Next Sync</p>
                  <p className="font-semibold text-hotel-forest">
                    {syncStatus.nextSync
                      ? syncStatus.nextSync.toLocaleString('en-IN')
                      : 'Scheduled for 11:00 PM'}
                  </p>
                </div>
                <div className="p-4 bg-hotel-forest/5 rounded-lg">
                  <p className="text-xs text-hotel-forest/60 mb-1">Total Syncs</p>
                  <p className="font-semibold text-hotel-forest">{syncStatus.syncCount}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleCloudSync}
              className="w-full px-6 py-3 bg-brushed-gold text-forest-green rounded-lg hover:bg-brushed-gold/90 transition-colors font-medium flex items-center justify-center gap-2 touch-manipulation"
            >
              <Download size={18} />
              Sync to Documents/Backups Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

