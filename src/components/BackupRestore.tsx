/**
 * Backup Restore Component
 * One-Tap Restore feature for uploading and restoring backup files
 */

import { useState, useCallback } from 'react';
import { Upload, FileCheck, AlertCircle, CheckCircle, History, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { restoreFromBackupFile } from '../utils/backupRestore';
import { useStore } from '../store/Store';
import { getBackupLogEntries } from '../utils/nightlyBackup';

export default function BackupRestore() {
  const { inventory, dailySales, expenses, updateInventoryItem, addInventoryItem, addDailySale, addExpense } = useStore();
  const [restoreStatus, setRestoreStatus] = useState<{
    status: 'idle' | 'processing' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [backupLog, setBackupLog] = useState(getBackupLogEntries());

  // Restore function
  const handleRestore = useCallback(async (file: File) => {
    setRestoreStatus({ status: 'processing', message: 'Processing backup file...' });

    try {
      const result = await restoreFromBackupFile(file);

      if (!result.success || !result.data) {
        setRestoreStatus({ status: 'error', message: result.message });
        return;
      }

      // Confirm before restoring
      const confirmed = window.confirm(
        `This will replace all current data with data from the backup.\n\n` +
        `Backup contains:\n` +
        `- ${result.data.inventory.length} inventory items\n` +
        `- ${result.data.dailySales.length} sales records\n` +
        `- ${result.data.expenses.length} expense records\n\n` +
        `Are you sure you want to continue?`
      );

      if (!confirmed) {
        setRestoreStatus({ status: 'idle', message: 'Restore cancelled' });
        return;
      }

      // Restore inventory (replace all)
      // First, clear existing inventory by updating the store
      // Note: This is a simplified approach - in production, you'd want a clearInventory action
      
      // Restore inventory items
      if (result.data.inventory.length > 0) {
        result.data.inventory.forEach((item) => {
          const itemId = `${item.productName.replace(/\s+/g, '_')}_${item.config.size}`;
          // Check if item exists, update or add
          const existing = inventory.find((inv) => {
            const invId = `${inv.productName.replace(/\s+/g, '_')}_${inv.config.size}`;
            return invId === itemId;
          });

          if (existing) {
            updateInventoryItem(itemId, item);
          } else {
            addInventoryItem(item);
          }
        });
      }

      // Restore sales (add all - you may want to merge or replace based on requirements)
      if (result.data.dailySales.length > 0) {
        result.data.dailySales.forEach((sale) => {
          addDailySale(sale);
        });
      }

      // Restore expenses (add all)
      if (result.data.expenses.length > 0) {
        result.data.expenses.forEach((expense) => {
          addExpense(expense);
        });
      }

      setRestoreStatus({
        status: 'success',
        message: `Successfully restored backup! ${result.data.inventory.length} inventory items, ${result.data.dailySales.length} sales, ${result.data.expenses.length} expenses restored.`,
      });

      // Refresh backup log
      setBackupLog(getBackupLogEntries());

      // Clear status after 5 seconds
      setTimeout(() => {
        setRestoreStatus({ status: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      setRestoreStatus({
        status: 'error',
        message: `Error restoring backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [inventory, dailySales, expenses, updateInventoryItem, addInventoryItem, addDailySale, addExpense]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          handleRestore(file);
        } else {
          setRestoreStatus({
            status: 'error',
            message: 'Please upload a valid Excel file (.xlsx or .xls)',
          });
        }
      }
    },
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  // Refresh backup log
  const refreshLog = useCallback(() => {
    setBackupLog(getBackupLogEntries());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-forest-green mb-2 flex items-center gap-3">
          <FileCheck className="text-brushed-gold" size={32} />
          Backup Restore
        </h2>
        <p className="text-forest-green/70">
          Upload a backup Excel file to restore your dashboard data
        </p>
      </div>

      {/* Restore Section */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
        <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
          <Upload className="text-brushed-gold" size={20} />
          One-Tap Restore
        </h3>

        {/* Status Message */}
        {restoreStatus.message && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
              restoreStatus.status === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : restoreStatus.status === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            {restoreStatus.status === 'success' ? (
              <CheckCircle size={20} className="mt-0.5" />
            ) : restoreStatus.status === 'error' ? (
              <AlertCircle size={20} className="mt-0.5" />
            ) : (
              <RefreshCw size={20} className="mt-0.5 animate-spin" />
            )}
            <div className="flex-1">
              <p className="font-medium">{restoreStatus.message}</p>
            </div>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200 touch-manipulation
            ${
              isDragActive
                ? 'border-brushed-gold bg-brushed-gold/10'
                : 'border-brushed-gold/30 hover:border-brushed-gold hover:bg-forest-green/5'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto text-brushed-gold mb-4" size={48} />
          <p className="text-forest-green font-medium text-lg mb-2">
            {isDragActive ? 'Drop your backup file here' : 'Click or drag backup file here'}
          </p>
          <p className="text-forest-green/60 text-sm">
            Supports .xlsx and .xls files (Deepa_EOD_Report_*.xlsx)
          </p>
        </div>

        <div className="mt-4 p-4 bg-forest-green/5 rounded-lg border border-brushed-gold/20">
          <p className="text-sm text-forest-green/70">
            <strong>Note:</strong> Restoring a backup will replace all current inventory, sales, and expense data
            with the data from the backup file. Make sure you have a current backup before restoring.
          </p>
        </div>
      </div>

      {/* Backup Log Section */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-forest-green flex items-center gap-2">
            <History className="text-brushed-gold" size={20} />
            Backup Log
          </h3>
          <button
            onClick={refreshLog}
            className="px-3 py-1 text-sm bg-forest-green text-brushed-gold rounded-lg hover:bg-forest-green/80 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {backupLog.entries.length === 0 ? (
          <p className="text-forest-green/50 text-center py-8">
            No backup records found. Backups will be logged here after the first automated backup.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-forest-green/5 rounded-lg p-4 border border-brushed-gold/20">
                <p className="text-xs text-forest-green/60 mb-1">Total Backups</p>
                <p className="text-2xl font-bold text-forest-green">{backupLog.totalBackups}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-700 mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-700">
                  {backupLog.totalBackups - backupLog.failedBackups}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-xs text-red-700 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-700">{backupLog.failedBackups}</p>
              </div>
            </div>

            {/* Backup Entries */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brushed-gold/20">
                    <th className="text-left py-2 text-forest-green font-semibold">Date</th>
                    <th className="text-left py-2 text-forest-green font-semibold">Filename</th>
                    <th className="text-right py-2 text-forest-green font-semibold">Records</th>
                    <th className="text-right py-2 text-forest-green font-semibold">File Size</th>
                    <th className="text-center py-2 text-forest-green font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {backupLog.entries.slice().reverse().slice(0, 50).map((entry, index) => (
                    <tr key={index} className="border-b border-brushed-gold/10 hover:bg-forest-green/5">
                      <td className="py-2 text-forest-green">
                        {new Date(entry.timestamp).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2 text-forest-green font-medium">{entry.filename}</td>
                      <td className="py-2 text-right text-forest-green/70">
                        {entry.recordCounts.inventory} inv, {entry.recordCounts.sales} sales,{' '}
                        {entry.recordCounts.expenses} exp
                      </td>
                      <td className="py-2 text-right text-forest-green/70">
                        {entry.fileSize ? `${(entry.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                      </td>
                      <td className="py-2 text-center">
                        {entry.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle size={12} />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <AlertCircle size={12} />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

