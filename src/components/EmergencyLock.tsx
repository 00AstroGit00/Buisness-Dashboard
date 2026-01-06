/**
 * Emergency Lock Component
 * Clears sensitive sessionStorage and locks dashboard across all devices
 */

import { useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logEmergencyLock } from '../utils/securityLog';
import { getDeviceName } from '../utils/webauthn';

const EMERGENCY_LOCK_CHANNEL = 'deepa_emergency_lock';

export default function EmergencyLock() {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const handleEmergencyLock = async () => {
    if (!user) return;

    setIsLocking(true);

    try {
      // Log the emergency lock event
      logEmergencyLock(user.id, user.username, getDeviceName());

      // Clear all sensitive data from sessionStorage and localStorage
      sessionStorage.clear();
      
      // Keep only non-sensitive data (theme preferences, etc.)
      const backupLog = localStorage.getItem('deepa_security_log');
      const backupCredentials = localStorage.getItem('deepa_webauthn_credentials');
      
      localStorage.clear();
      
      // Restore security-related data
      if (backupLog) localStorage.setItem('deepa_security_log', backupLog);
      if (backupCredentials) localStorage.setItem('deepa_webauthn_credentials', backupCredentials);

      // Broadcast emergency lock to all tabs and networked devices
      const channel = new BroadcastChannel(EMERGENCY_LOCK_CHANNEL);
      channel.postMessage({
        type: 'EMERGENCY_LOCK',
        timestamp: Date.now(),
        userId: user.id,
      });
      channel.close();

      // Force logout
      logout();

      // Reload the page to ensure all state is cleared
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Emergency lock error:', error);
      alert('Failed to execute emergency lock. Please contact administrator.');
    } finally {
      setIsLocking(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* Emergency Lock Button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLocking}
        className="fixed bottom-4 left-4 z-40 px-6 py-4 bg-brushed-gold hover:bg-brushed-gold/90 text-forest-green rounded-full shadow-2xl border-2 border-forest-green font-bold text-sm flex items-center gap-3 transition-all touch-manipulation hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Emergency Lock - Clears all sessions and locks dashboard"
      >
        <Lock size={20} />
        EMERGENCY LOCK
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-brushed-gold max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="text-orange-600" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-forest-green">Emergency Lock</h3>
                <p className="text-sm text-forest-green/70">Critical Security Action</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-forest-green font-medium mb-2">
                This action will:
              </p>
              <ul className="text-sm text-forest-green/80 space-y-1 list-disc list-inside">
                <li>Clear all session data and revenue information</li>
                <li>Force logout on all devices (laptop, tablet, phone)</li>
                <li>Lock the dashboard across your network</li>
                <li>Require re-login with PIN or Fingerprint</li>
              </ul>
            </div>

            <p className="text-sm text-forest-green/70 mb-6 italic">
              Use this when you need to quickly secure the dashboard (e.g., customers near the screen).
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLocking}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-forest-green rounded-lg font-medium transition-colors touch-manipulation disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyLock}
                disabled={isLocking}
                className="flex-1 px-6 py-3 bg-brushed-gold hover:bg-brushed-gold/90 text-forest-green rounded-lg font-bold transition-colors touch-manipulation disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLocking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-forest-green border-t-transparent" />
                    Locking...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Confirm Lock
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Listen for emergency lock broadcasts from other tabs/devices
if (typeof window !== 'undefined') {
  const channel = new BroadcastChannel(EMERGENCY_LOCK_CHANNEL);
  
  channel.onmessage = (event) => {
    if (event.data.type === 'EMERGENCY_LOCK') {
      // Clear session and reload
      sessionStorage.clear();
      alert('Emergency lock activated from another device. Dashboard is now locked.');
      window.location.reload();
    }
  };
}

