/**
 * System Heartbeat Utilities
 * Verifies localStorage data integrity every hour
 */

export interface HeartbeatCheck {
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    inventoryIntegrity: boolean;
    salesDataIntegrity: boolean;
    expensesIntegrity: boolean;
    storeHydration: boolean;
    storageQuota: boolean;
  };
  issues: string[];
  storageUsed: number; // in KB
  storageQuota: number; // in KB
  recommendations: string[];
}

const HEARTBEAT_LOG_KEY = 'deepa_heartbeat_log';
const MAX_HEARTBEAT_ENTRIES = 100;

/**
 * Run a complete system health check
 */
export async function runHeartbeatCheck(): Promise<HeartbeatCheck> {
  const checks = {
    inventoryIntegrity: checkInventoryIntegrity(),
    salesDataIntegrity: checkSalesDataIntegrity(),
    expensesIntegrity: checkExpensesDataIntegrity(),
    storeHydration: checkStoreHydration(),
    storageQuota: await checkStorageQuota(),
  };

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Analyze checks
  if (!checks.inventoryIntegrity) {
    issues.push('Inventory data structure is corrupted or invalid');
    recommendations.push('Clear and re-import inventory from Excel file');
  }

  if (!checks.salesDataIntegrity) {
    issues.push('Sales data contains invalid entries');
    recommendations.push('Review and fix sales entries in Accounting module');
  }

  if (!checks.expensesIntegrity) {
    issues.push('Expense data is inconsistent');
    recommendations.push('Verify expense amounts and dates');
  }

  if (!checks.storeHydration) {
    issues.push('Store failed to hydrate from localStorage');
    recommendations.push('Check browser console for errors');
  }

  if (!checks.storageQuota) {
    issues.push('localStorage is approaching capacity');
    recommendations.push('Run Asset Cleanup to free up space');
  }

  // Get storage info
  const { used, quota } = await getStorageEstimate();

  // Determine overall status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (issues.length >= 3) {
    status = 'critical';
  } else if (issues.length > 0) {
    status = 'warning';
  }

  const heartbeat: HeartbeatCheck = {
    timestamp: new Date(),
    status,
    checks,
    issues,
    storageUsed: used,
    storageQuota: quota,
    recommendations,
  };

  // Log the heartbeat
  logHeartbeat(heartbeat);

  return heartbeat;
}

/**
 * Check inventory data integrity
 */
function checkInventoryIntegrity(): boolean {
  try {
    const storeData = localStorage.getItem('deepa-store');
    if (!storeData) return true; // No data yet is okay

    const store = JSON.parse(storeData);
    const inventory = store.state?.inventory;

    if (!Array.isArray(inventory)) return false;

    // Check each item has required fields
    for (const item of inventory) {
      if (!item.productName || !item.config || !item.currentStock) {
        return false;
      }

      // Check for NaN or negative values
      if (isNaN(item.currentStock.totalMl) || item.currentStock.totalMl < 0) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check sales data integrity
 */
function checkSalesDataIntegrity(): boolean {
  try {
    const storeData = localStorage.getItem('deepa-store');
    if (!storeData) return true;

    const store = JSON.parse(storeData);
    const sales = store.state?.dailySales;

    if (!Array.isArray(sales)) return false;

    // Check each sale has valid amounts
    for (const sale of sales) {
      if (
        isNaN(sale.roomRent) ||
        isNaN(sale.restaurantBills) ||
        isNaN(sale.barSales) ||
        sale.roomRent < 0 ||
        sale.restaurantBills < 0 ||
        sale.barSales < 0
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check expenses data integrity
 */
function checkExpensesDataIntegrity(): boolean {
  try {
    const storeData = localStorage.getItem('deepa-store');
    if (!storeData) return true;

    const store = JSON.parse(storeData);
    const expenses = store.state?.expenses;

    if (!Array.isArray(expenses)) return false;

    // Check each expense has valid amount
    for (const expense of expenses) {
      if (isNaN(expense.amount) || expense.amount < 0) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if store hydrated successfully
 */
function checkStoreHydration(): boolean {
  try {
    const storeData = localStorage.getItem('deepa-store');
    if (!storeData) return true;

    const store = JSON.parse(storeData);
    return store.state && typeof store.state === 'object';
  } catch {
    return false;
  }
}

/**
 * Check localStorage quota
 */
async function checkStorageQuota(): Promise<boolean> {
  const { used, quota } = await getStorageEstimate();
  const usagePercent = (used / quota) * 100;
  return usagePercent < 80; // Warning if over 80% used
}

/**
 * Get storage usage estimate
 */
async function getStorageEstimate(): Promise<{ used: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: Math.round((estimate.usage || 0) / 1024), // KB
        quota: Math.round((estimate.quota || 10485760) / 1024), // KB, default 10MB
      };
    } catch {
      // Fallback
    }
  }

  // Fallback: calculate localStorage size
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      used += key.length + value.length;
    }
  }

  return {
    used: Math.round(used / 1024), // KB
    quota: 10240, // Assume 10MB quota
  };
}

/**
 * Log heartbeat to history
 */
function logHeartbeat(heartbeat: HeartbeatCheck): void {
  try {
    const log = getHeartbeatLog();
    log.unshift(heartbeat);

    // Keep only recent entries
    const trimmed = log.slice(0, MAX_HEARTBEAT_ENTRIES);

    localStorage.setItem(HEARTBEAT_LOG_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to log heartbeat:', error);
  }
}

/**
 * Get heartbeat history
 */
export function getHeartbeatLog(): HeartbeatCheck[] {
  try {
    const stored = localStorage.getItem(HEARTBEAT_LOG_KEY);
    if (!stored) return [];

    const log = JSON.parse(stored);
    return log.map((entry: HeartbeatCheck) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch {
    return [];
  }
}

/**
 * Get latest heartbeat
 */
export function getLatestHeartbeat(): HeartbeatCheck | null {
  const log = getHeartbeatLog();
  return log.length > 0 ? log[0] : null;
}

/**
 * Get heartbeat summary (last 24 hours)
 */
export function getHeartbeatSummary(): {
  totalChecks: number;
  healthyChecks: number;
  warningChecks: number;
  criticalChecks: number;
  uptime: number; // percentage
  lastCheck: Date | null;
} {
  const log = getHeartbeatLog();
  const last24h = log.filter(entry => {
    const hoursDiff = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  });

  const healthy = last24h.filter(e => e.status === 'healthy').length;
  const warning = last24h.filter(e => e.status === 'warning').length;
  const critical = last24h.filter(e => e.status === 'critical').length;

  const uptime = last24h.length > 0 ? (healthy / last24h.length) * 100 : 100;

  return {
    totalChecks: last24h.length,
    healthyChecks: healthy,
    warningChecks: warning,
    criticalChecks: critical,
    uptime: Math.round(uptime * 10) / 10,
    lastCheck: log.length > 0 ? log[0].timestamp : null,
  };
}

