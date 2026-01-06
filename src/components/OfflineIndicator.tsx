/**
 * Offline Indicator Component
 * Shows sync status and connection state
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

export default function OfflineIndicator() {
  const { isOnline, isSyncing, lastSyncTime, syncError } = useOfflineStatus();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for relative time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
        <WifiOff size={16} />
        <span>Offline Mode - Changes saved to local storage</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
        <Loader2 size={16} className="animate-spin" />
        <span>Syncing to server...</span>
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
        <AlertCircle size={16} />
        <span>{syncError}</span>
      </div>
    );
  }

  if (lastSyncTime) {
    const timeAgo = Math.floor((currentTime.getTime() - lastSyncTime.getTime()) / 1000 / 60); // minutes
    const timeText = timeAgo < 1 ? 'Just now' : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`;
    
    return (
      <div className="fixed top-2 right-2 z-50 bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium shadow-lg lg:top-4 lg:right-4">
        <CheckCircle size={14} />
        <Wifi size={14} />
        <span className="hidden sm:inline">
          Synced {timeText}
        </span>
        <span className="sm:hidden">Synced</span>
      </div>
    );
  }

  return (
    <div className="fixed top-2 right-2 z-50 bg-gray-500 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium shadow-lg lg:top-4 lg:right-4">
      <Wifi size={14} />
      <span>Online</span>
    </div>
  );
}

