/**
 * Security Log Utilities
 * Tracks login attempts, device information, and security events
 */

export interface SecurityLogEntry {
  id: string;
  timestamp: Date;
  eventType: 'login_success' | 'login_failure' | 'logout' | 'emergency_lock' | 'session_expired';
  userId?: string;
  userName?: string;
  deviceName: string;
  ipAddress?: string;
  authMethod: 'pin' | 'webauthn' | 'unknown';
  details?: string;
}

const SECURITY_LOG_KEY = 'deepa_security_log';
const MAX_LOG_ENTRIES = 1000; // Keep last 1000 entries

/**
 * Get all security log entries
 */
export function getSecurityLog(): SecurityLogEntry[] {
  try {
    const stored = localStorage.getItem(SECURITY_LOG_KEY);
    if (!stored) return [];
    
    const entries = JSON.parse(stored);
    // Parse dates
    return entries.map((entry: SecurityLogEntry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch {
    return [];
  }
}

/**
 * Add a security log entry
 */
export function addSecurityLogEntry(
  entry: Omit<SecurityLogEntry, 'id' | 'timestamp'>
): void {
  const entries = getSecurityLog();
  
  const newEntry: SecurityLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  
  entries.unshift(newEntry); // Add to beginning
  
  // Keep only the most recent entries
  const trimmedEntries = entries.slice(0, MAX_LOG_ENTRIES);
  
  localStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(trimmedEntries));
}

/**
 * Log successful login
 */
export function logLoginSuccess(
  userId: string,
  userName: string,
  deviceName: string,
  authMethod: 'pin' | 'webauthn'
): void {
  addSecurityLogEntry({
    eventType: 'login_success',
    userId,
    userName,
    deviceName,
    authMethod,
    details: `Successful login via ${authMethod === 'pin' ? 'PIN' : 'Fingerprint'}`,
  });
}

/**
 * Log failed login attempt
 */
export function logLoginFailure(
  deviceName: string,
  authMethod: 'pin' | 'webauthn',
  reason?: string
): void {
  addSecurityLogEntry({
    eventType: 'login_failure',
    deviceName,
    authMethod,
    details: reason || 'Invalid credentials',
  });
}

/**
 * Log logout
 */
export function logLogout(
  userId: string,
  userName: string,
  deviceName: string
): void {
  addSecurityLogEntry({
    eventType: 'logout',
    userId,
    userName,
    deviceName,
    authMethod: 'unknown',
    details: 'User logged out',
  });
}

/**
 * Log emergency lock
 */
export function logEmergencyLock(
  userId: string,
  userName: string,
  deviceName: string
): void {
  addSecurityLogEntry({
    eventType: 'emergency_lock',
    userId,
    userName,
    deviceName,
    authMethod: 'unknown',
    details: 'Emergency lock activated - all sessions cleared',
  });
}

/**
 * Get security log summary
 */
export function getSecurityLogSummary(days: number = 7): {
  totalLogins: number;
  failedLogins: number;
  successRate: number;
  uniqueDevices: Set<string>;
  recentEvents: SecurityLogEntry[];
} {
  const entries = getSecurityLog();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentEntries = entries.filter((e) => e.timestamp >= cutoffDate);
  
  const totalLogins = recentEntries.filter(
    (e) => e.eventType === 'login_success' || e.eventType === 'login_failure'
  ).length;
  
  const failedLogins = recentEntries.filter(
    (e) => e.eventType === 'login_failure'
  ).length;
  
  const successRate = totalLogins > 0 ? ((totalLogins - failedLogins) / totalLogins) * 100 : 100;
  
  const uniqueDevices = new Set(recentEntries.map((e) => e.deviceName));
  
  return {
    totalLogins,
    failedLogins,
    successRate: Math.round(successRate * 10) / 10,
    uniqueDevices,
    recentEvents: entries.slice(0, 10), // Last 10 events
  };
}

/**
 * Clear all security logs (admin only)
 */
export function clearSecurityLog(): void {
  localStorage.removeItem(SECURITY_LOG_KEY);
}

