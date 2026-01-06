/**
 * Auto-Updater Utilities
 * Checks for dashboard updates and security patches
 * In production, this would integrate with your Git repository
 */

export interface UpdateInfo {
  available: boolean;
  version: string;
  currentVersion: string;
  releaseDate: Date;
  type: 'feature' | 'security' | 'bugfix' | 'performance';
  title: string;
  description: string;
  breaking: boolean;
}

export interface UpdateCheckResult {
  hasUpdates: boolean;
  updates: UpdateInfo[];
  lastChecked: Date;
  nextCheck: Date;
}

const CURRENT_VERSION = '1.0.0';
const UPDATE_CHECK_KEY = 'deepa_last_update_check';
const UPDATE_CACHE_KEY = 'deepa_available_updates';

/**
 * Check for available updates
 * In production, this would make an API call to your Git repository
 */
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  const now = new Date();
  
  // Simulate checking Git repository
  // In production, this would be:
  // const response = await fetch('https://api.github.com/repos/yourrepo/releases/latest');
  
  // For demonstration, return mock updates
  const mockUpdates: UpdateInfo[] = [
    // Uncomment to simulate available updates
    // {
    //   available: true,
    //   version: '1.1.0',
    //   currentVersion: CURRENT_VERSION,
    //   releaseDate: new Date('2026-01-15'),
    //   type: 'feature',
    //   title: 'Enhanced Inventory Forecasting',
    //   description: 'AI-powered stock prediction based on historical sales patterns. Automatically suggests reorder quantities.',
    //   breaking: false,
    // },
    // {
    //   available: true,
    //   version: '1.0.1',
    //   currentVersion: CURRENT_VERSION,
    //   releaseDate: new Date('2026-01-10'),
    //   type: 'security',
    //   title: 'Security Patch: Enhanced Session Management',
    //   description: 'Improved session timeout handling and cross-site scripting (XSS) protection.',
    //   breaking: false,
    // },
  ];

  // Store check timestamp
  localStorage.setItem(UPDATE_CHECK_KEY, now.toISOString());
  
  // Cache available updates
  if (mockUpdates.length > 0) {
    localStorage.setItem(UPDATE_CACHE_KEY, JSON.stringify(mockUpdates));
  }

  // Next check in 24 hours
  const nextCheck = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    hasUpdates: mockUpdates.length > 0,
    updates: mockUpdates,
    lastChecked: now,
    nextCheck,
  };
}

/**
 * Get cached update information
 */
export function getCachedUpdates(): UpdateCheckResult | null {
  try {
    const lastCheckedStr = localStorage.getItem(UPDATE_CHECK_KEY);
    const updatesStr = localStorage.getItem(UPDATE_CACHE_KEY);

    if (!lastCheckedStr) return null;

    const lastChecked = new Date(lastCheckedStr);
    const updates = updatesStr ? JSON.parse(updatesStr) : [];
    const nextCheck = new Date(lastChecked.getTime() + 24 * 60 * 60 * 1000);

    return {
      hasUpdates: updates.length > 0,
      updates: updates.map((u: UpdateInfo) => ({
        ...u,
        releaseDate: new Date(u.releaseDate),
      })),
      lastChecked,
      nextCheck,
    };
  } catch {
    return null;
  }
}

/**
 * Should check for updates now?
 */
export function shouldCheckForUpdates(): boolean {
  const cached = getCachedUpdates();
  if (!cached) return true;

  const now = new Date();
  return now >= cached.nextCheck;
}

/**
 * Get current dashboard version
 */
export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}

/**
 * Get update priority level
 */
export function getUpdatePriority(update: UpdateInfo): 'critical' | 'high' | 'medium' | 'low' {
  if (update.type === 'security') return 'critical';
  if (update.breaking) return 'high';
  if (update.type === 'bugfix') return 'medium';
  return 'low';
}

/**
 * Get update badge color
 */
export function getUpdateBadgeColor(update: UpdateInfo): string {
  const priority = getUpdatePriority(update);
  switch (priority) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-forest-green';
    case 'low':
      return 'bg-blue-500 text-white';
  }
}

/**
 * Mark update as seen
 */
export function markUpdateAsSeen(version: string): void {
  const seenKey = `deepa_update_seen_${version}`;
  localStorage.setItem(seenKey, new Date().toISOString());
}

/**
 * Check if update has been seen
 */
export function isUpdateSeen(version: string): boolean {
  const seenKey = `deepa_update_seen_${version}`;
  return localStorage.getItem(seenKey) !== null;
}

