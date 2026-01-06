import { useState, useEffect, useCallback } from 'react';
import { Cpu, Database, Smartphone, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useStoreSync } from '../hooks/useStoreSync';
import { useSystemHeartbeat } from '../hooks/useSystemHeartbeat';

export default function SystemHealth() {
  const syncStatus = useStoreSync();
  const { performCheck } = useSystemHeartbeat();
  const [metrics, setMetrics] = useState({
    ramUsage: 0,
    ramTotal: 0,
    dbSize: 0,
    activeDevices: 1 // Self
  });
  const [isCleaning, setIsCleaning] = useState(false);

  // BroadcastChannel for Active Devices count
  useEffect(() => {
    const channel = new BroadcastChannel('deepa_presence');
    const updatePresence = () => {
      channel.postMessage({ type: 'presence', id: crypto.randomUUID() });
    };

    channel.onmessage = (event) => {
      if (event.data.type === 'presence') {
        setMetrics(prev => ({ ...prev, activeDevices: prev.activeDevices + 1 }));
        // Reset count after a delay to avoid infinite accumulation (simplified logic)
        setTimeout(() => setMetrics(prev => ({ ...prev, activeDevices: 1 })), 10000);
      }
    };

    // Initial ping
    updatePresence();
    const interval = setInterval(updatePresence, 30000);
    return () => {
      clearInterval(interval);
      channel.close();
    };
  }, []);

  // Metrics Updater (RAM & DB)
  useEffect(() => {
    const updateMetrics = async () => {
      // RAM Usage (Chrome Only)
      let ramUsage = 0;
      let ramTotal = 0;
      if ('memory' in performance) {
        const perfMemory = (performance as any).memory;
        ramUsage = Math.round(perfMemory.usedJSHeapSize / (1024 * 1024));
        ramTotal = Math.round(perfMemory.jsHeapSizeLimit / (1024 * 1024));
      }

      // Database Size (IndexedDB + Cache)
      let dbSize = 0;
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          dbSize = Math.round((estimate.usage || 0) / (1024 * 1024)); // MB
        } catch (e) {
          console.error('Storage estimate failed', e);
        }
      }

      setMetrics(prev => ({ ...prev, ramUsage, ramTotal, dbSize }));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (!confirm('Clear Vite Cache & Refresh? This will reload the dashboard.')) return;
    
    setIsCleaning(true);
    try {
      // 1. Clear LocalStorage (preserve critical Auth/Identity if needed, but "Clear Vite Cache" implies deep clean)
      // keeping only critical IDs might be safer
      const deviceId = localStorage.getItem('deepa_device_id');
      localStorage.clear();
      if (deviceId) localStorage.setItem('deepa_device_id', deviceId);

      // 2. Clear SessionStorage
      sessionStorage.clear();

      // 3. Clear Cache API (Vite/PWA caches)
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // 4. Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }

      // 5. IndexedDB (Optional: might be too destructive for "Vite Cache" - keeping DB for data safety)
      // await indexedDB.deleteDatabase('DeepaHotelDB'); 

      // Reload
      window.location.reload();
    } catch (error) {
      console.error('Cache clear failed', error);
      setIsCleaning(false);
    }
  };

  return (
    <div className="mt-auto px-4 py-4 bg-forest-green-dark/30 border-t border-brushed-gold/20 backdrop-blur-sm">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-brushed-gold/50 mb-3 flex items-center gap-2">
        <Cpu size={12} /> System Health
      </h3>

      {/* Metrics Grid */}
      <div className="space-y-3 mb-4">
        {/* RAM Usage */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-brushed-gold/80 flex items-center gap-1">
            RAM
          </span>
          <span className={`font-mono font-bold ${metrics.ramUsage / metrics.ramTotal > 0.8 ? 'text-red-400' : 'text-brushed-gold'}`}>
            {metrics.ramUsage}MB
          </span>
        </div>
        <div className="w-full bg-forest-green-dark rounded-full h-1 overflow-hidden">
           <div 
             className={`h-full transition-all duration-500 ${metrics.ramUsage / metrics.ramTotal > 0.8 ? 'bg-red-500' : 'bg-brushed-gold'}`}
             style={{ width: `${Math.min((metrics.ramUsage / metrics.ramTotal) * 100, 100)}%` }}
           />
        </div>

        {/* Database Size */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-brushed-gold/80 flex items-center gap-1">
            <Database size={10} /> DB Size
          </span>
          <span className="font-mono text-brushed-gold font-bold">{metrics.dbSize} MB</span>
        </div>

        {/* Active Devices */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-brushed-gold/80 flex items-center gap-1">
            <Smartphone size={10} /> Devices
          </span>
          <span className="font-mono text-brushed-gold font-bold">{metrics.activeDevices} Active</span>
        </div>

        {/* Sync Status */}
        <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
          <span className="text-brushed-gold/80">S23 Ultra Sync</span>
          <div className="flex items-center gap-1.5">
             <span className={`w-2 h-2 rounded-full ${syncStatus.isSynced ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'} animate-pulse`} />
             <span className={`text-[10px] font-bold ${syncStatus.isSynced ? 'text-green-400' : 'text-red-400'}`}>
               {syncStatus.isSynced ? 'ONLINE' : 'OFFLINE'}
             </span>
          </div>
        </div>
      </div>

      {/* Clear Cache Button */}
      <button
        onClick={handleClearCache}
        disabled={isCleaning}
        className="w-full py-2 bg-white/5 hover:bg-white/10 text-brushed-gold/80 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 group border border-transparent hover:border-brushed-gold/20"
      >
        {isCleaning ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} className="group-hover:text-red-400 transition-colors" />}
        {isCleaning ? 'REFRESHING...' : 'CLEAR VITE CACHE'}
      </button>
    </div>
  );
}