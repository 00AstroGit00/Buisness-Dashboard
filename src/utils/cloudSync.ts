/**
 * Cloud Sync Utility
 * Exports localStorage state to Windows Documents/Backups folder
 * Runs automatically every night at closing time
 */

interface SyncStatus {
  lastSync: Date | null;
  nextSync: Date | null;
  syncCount: number;
  lastError: string | null;
}

const SYNC_STORAGE_KEY = 'deepa_cloud_sync_status';
const SYNC_TIME_HOUR = 23; // 11 PM (closing time)
const SYNC_TIME_MINUTE = 0;

/**
 * Get Windows Documents folder path
 * Note: Browser security prevents direct file system access
 * This function triggers a download with suggested filename
 */
function getDocumentsBackupPath(): string {
  // In a real implementation with Electron or Tauri, this would return actual path
  // For browser, we'll use a download with suggested location
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `deepa-backup-${dateStr}-${timeStr}.json`;
}

/**
 * Create backup of localStorage state
 */
function createBackupData(): Record<string, unknown> {
  const backupData: Record<string, unknown> = {};
  const keysToBackup = [
    'deepa-business-store',
    'deepa_auth_session',
    'deepa_last_backup',
    'deepa_backup_time',
    'deepa_cloud_sync_status',
  ];

  keysToBackup.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        backupData[key] = JSON.parse(value);
      } catch {
        backupData[key] = value;
      }
    }
  });

  // Also backup all other localStorage keys that start with 'deepa'
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('deepa') && !keysToBackup.includes(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          backupData[key] = JSON.parse(value);
        } catch {
          backupData[key] = value;
        }
      }
    }
  }

  return backupData;
}

/**
 * Save backup to file (triggers download in browser)
 * In production with Electron/Tauri, this would save directly to Documents/Backups
 */
export function saveBackupToDocuments(): File | null {
  try {
    const backupData = createBackupData();
    
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      source: 'Deepa Restaurant & Tourist Home',
      data: backupData,
      totalKeys: Object.keys(backupData).length,
      metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    };

    const backupJson = JSON.stringify(backup, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const filename = getDocumentsBackupPath();
    const file = new File([blob], filename, { type: 'application/json' });

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Try to use File System Access API if available (Chrome/Edge)
    if ('showSaveFilePicker' in window) {
      (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'JSON Backup File',
          accept: { 'application/json': ['.json'] },
        }],
      }).then(async (fileHandle: any) => {
        const writable = await fileHandle.createWritable();
        await writable.write(backupJson);
        await writable.close();
        URL.revokeObjectURL(url);
        console.log('Backup saved via File System Access API');
      }).catch(() => {
        // Fallback to download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } else {
      // Fallback: trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    // Update sync status
    updateSyncStatus(true);

    console.log(`Cloud sync backup created: ${filename}`);
    console.log('💡 Please save this file to: Documents/Backups/');
    
    return file;
  } catch (error) {
    console.error('Error creating cloud sync backup:', error);
    updateSyncStatus(false, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Get sync status
 */
export function getSyncStatus(): SyncStatus {
  const statusStr = localStorage.getItem(SYNC_STORAGE_KEY);
  if (statusStr) {
    try {
      const status = JSON.parse(statusStr);
      return {
        lastSync: status.lastSync ? new Date(status.lastSync) : null,
        nextSync: status.nextSync ? new Date(status.nextSync) : null,
        syncCount: status.syncCount || 0,
        lastError: status.lastError || null,
      };
    } catch {
      // Invalid JSON, return default
    }
  }

  // Calculate next sync time
  const now = new Date();
  const nextSync = new Date();
  nextSync.setHours(SYNC_TIME_HOUR, SYNC_TIME_MINUTE, 0, 0);
  if (now > nextSync) {
    nextSync.setDate(nextSync.getDate() + 1);
  }

  return {
    lastSync: null,
    nextSync,
    syncCount: 0,
    lastError: null,
  };
}

/**
 * Update sync status
 */
function updateSyncStatus(success: boolean, error?: string): void {
  const status = getSyncStatus();
  const now = new Date();
  
  // Calculate next sync time
  const nextSync = new Date();
  nextSync.setHours(SYNC_TIME_HOUR, SYNC_TIME_MINUTE, 0, 0);
  if (now > nextSync) {
    nextSync.setDate(nextSync.getDate() + 1);
  }

  const newStatus: SyncStatus = {
    lastSync: success ? now : status.lastSync,
    nextSync,
    syncCount: success ? status.syncCount + 1 : status.syncCount,
    lastError: success ? null : (error || status.lastError),
  };

  localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(newStatus));
}

/**
 * Schedule automatic sync at closing time (11 PM)
 */
export function scheduleAutoSync(): () => void {
  const now = new Date();
  const syncTime = new Date();
  syncTime.setHours(SYNC_TIME_HOUR, SYNC_TIME_MINUTE, 0, 0);

  // If it's already past 11 PM, schedule for tomorrow
  if (now > syncTime) {
    syncTime.setDate(syncTime.getDate() + 1);
  }

  const timeUntilSync = syncTime.getTime() - now.getTime();

  const timeout = setTimeout(() => {
    saveBackupToDocuments();
    
    // Schedule next day's sync
    scheduleAutoSync();
  }, timeUntilSync);

  console.log(`Cloud sync scheduled for: ${syncTime.toLocaleString()}`);

  // Return cleanup function
  return () => clearTimeout(timeout);
}

/**
 * Manual sync trigger
 */
export function triggerManualSync(): File | null {
  return saveBackupToDocuments();
}

