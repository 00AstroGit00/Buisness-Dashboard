/**
 * Backup Manager Utilities
 * Handles localStorage backups to Business-documents/Backups folder
 */

const BACKUP_STORAGE_KEY = 'deepa_last_backup';
const BACKUP_TIME_KEY = 'deepa_backup_time';

interface BackupStatus {
  lastBackup: Date | null;
  nextBackup: Date | null;
}

/**
 * Create a backup of current localStorage state
 * Returns the backup file blob
 */
export function createBackup(): File | null {
  try {
    // Collect all localStorage data
    const backupData: Record<string, unknown> = {};
    const keysToBackup = [
      'deepa-business-store',
      'deepa_auth_session',
      // Add other keys as needed
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

    // Create backup object with metadata
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: backupData,
      totalKeys: Object.keys(backupData).length,
    };

    // Convert to JSON string
    const backupJson = JSON.stringify(backup, null, 2);

    // Create blob
    const blob = new Blob([backupJson], { type: 'application/json' });

    // Generate filename
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `deepa-backup-${dateStr}-${timeStr}.json`;

    // Create file and trigger download
    const file = new File([blob], filename, { type: 'application/json' });
    
    // Save backup time to localStorage
    localStorage.setItem(BACKUP_STORAGE_KEY, now.toISOString());
    localStorage.setItem(BACKUP_TIME_KEY, String(now.getTime()));

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Backup created: ${filename}`);
    return file;
  } catch (error) {
    console.error('Error creating backup:', error);
    return null;
  }
}

/**
 * Get backup reminder status
 */
export function getBackupReminderStatus(): BackupStatus {
  const lastBackupStr = localStorage.getItem(BACKUP_STORAGE_KEY);
  const lastBackupTime = localStorage.getItem(BACKUP_TIME_KEY);

  let lastBackup: Date | null = null;
  if (lastBackupStr) {
    try {
      lastBackup = new Date(lastBackupStr);
    } catch {
      lastBackup = null;
    }
  }

  // Calculate next backup time (11:00 PM today or tomorrow)
  const now = new Date();
  const nextBackup = new Date();
  nextBackup.setHours(23, 0, 0, 0); // 11:00 PM

  // If it's already past 11 PM today, schedule for tomorrow
  if (now > nextBackup) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }

  return {
    lastBackup,
    nextBackup,
  };
}

/**
 * Restore from backup file
 * @param file - Backup JSON file
 */
export async function restoreFromBackup(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup.data || typeof backup.data !== 'object') {
      throw new Error('Invalid backup format');
    }

    // Restore data to localStorage
    Object.entries(backup.data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
    });

    console.log(`Backup restored from: ${backup.timestamp}`);
    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
}

