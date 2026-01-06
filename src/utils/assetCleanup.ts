/**
 * Asset Cleanup Utilities
 * Identifies and removes duplicate backup files to save SSD space
 */

import { getBackupLogEntries, type BackupLogEntry } from './nightlyBackup';

export interface DuplicateBackup {
  id: string;
  filename: string;
  timestamp: Date;
  fileSize: number;
  isDuplicate: boolean;
  duplicateOf?: string;
  recordCounts: {
    inventory: number;
    dailySales: number;
    expenses: number;
  };
}

export interface CleanupReport {
  totalBackups: number;
  duplicates: number;
  spaceSaved: number; // in MB
  filesRemoved: string[];
  recommendation: string;
}

/**
 * Analyze backups and identify duplicates
 * Two backups are considered duplicates if they have the same record counts
 */
export function analyzeDuplicateBackups(): DuplicateBackup[] {
  const backupLog = getBackupLogEntries();
  const backups: DuplicateBackup[] = [];
  const seenFingerprints = new Map<string, string>();

  for (const entry of backupLog) {
    // Create a fingerprint based on record counts
    const fingerprint = `${entry.recordCounts.inventory}-${entry.recordCounts.dailySales}-${entry.recordCounts.expenses}`;
    
    const isDuplicate = seenFingerprints.has(fingerprint);
    const duplicateOf = isDuplicate ? seenFingerprints.get(fingerprint) : undefined;

    backups.push({
      id: entry.filename,
      filename: entry.filename,
      timestamp: new Date(entry.timestamp),
      fileSize: entry.fileSize,
      isDuplicate,
      duplicateOf,
      recordCounts: entry.recordCounts,
    });

    // Track the first occurrence of each fingerprint
    if (!isDuplicate) {
      seenFingerprints.set(fingerprint, entry.filename);
    }
  }

  return backups;
}

/**
 * Get cleanup recommendations
 */
export function getCleanupRecommendations(): CleanupReport {
  const backups = analyzeDuplicateBackups();
  const duplicates = backups.filter(b => b.isDuplicate);
  
  const spaceSaved = duplicates.reduce((total, backup) => total + backup.fileSize, 0) / (1024 * 1024); // Convert to MB
  const filesRemoved = duplicates.map(b => b.filename);

  let recommendation = '';
  if (duplicates.length === 0) {
    recommendation = 'No duplicate backups found. Your backup system is efficient!';
  } else if (duplicates.length <= 3) {
    recommendation = `${duplicates.length} duplicate backup(s) found. Safe to remove.`;
  } else if (duplicates.length <= 10) {
    recommendation = `${duplicates.length} duplicates detected. Cleanup recommended to free up ${spaceSaved.toFixed(2)} MB.`;
  } else {
    recommendation = `⚠️ ${duplicates.length} duplicates found! Cleanup strongly recommended to save ${spaceSaved.toFixed(2)} MB of SSD space.`;
  }

  return {
    totalBackups: backups.length,
    duplicates: duplicates.length,
    spaceSaved,
    filesRemoved,
    recommendation,
  };
}

/**
 * Simulate removing duplicate backups
 * In production, this would actually delete files from the filesystem
 */
export function cleanupDuplicateBackups(): { success: boolean; report: CleanupReport } {
  const report = getCleanupRecommendations();
  
  if (report.duplicates === 0) {
    return {
      success: true,
      report,
    };
  }

  // In a real implementation, this would:
  // 1. Delete files from public/Business-documents/Backups/
  // 2. Update the backup log to remove deleted entries
  // 3. Verify deletion success
  
  // For now, we simulate the cleanup
  console.log(`[Asset Cleanup] Would remove ${report.filesRemoved.length} duplicate files`);
  console.log(`[Asset Cleanup] Would free up ${report.spaceSaved.toFixed(2)} MB`);

  return {
    success: true,
    report,
  };
}

/**
 * Get backup retention recommendations
 * Suggests keeping last 30 days, weekly backups for 3 months, monthly for 1 year
 */
export function getRetentionRecommendations(): {
  keepAll: number;
  keepWeekly: number;
  keepMonthly: number;
  canDelete: number;
  totalSize: number;
} {
  const backups = analyzeDuplicateBackups();
  const now = new Date();

  const last30Days = backups.filter(b => {
    const daysDiff = (now.getTime() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  });

  const weekly3Months = backups.filter(b => {
    const daysDiff = (now.getTime() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 30 && daysDiff <= 90;
  });

  const monthly1Year = backups.filter(b => {
    const daysDiff = (now.getTime() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 90 && daysDiff <= 365;
  });

  const canDelete = backups.filter(b => {
    const daysDiff = (now.getTime() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 365;
  });

  const totalSize = backups.reduce((total, b) => total + b.fileSize, 0) / (1024 * 1024);

  return {
    keepAll: last30Days.length,
    keepWeekly: Math.ceil(weekly3Months.length / 7),
    keepMonthly: Math.ceil(monthly1Year.length / 30),
    canDelete: canDelete.length,
    totalSize,
  };
}

