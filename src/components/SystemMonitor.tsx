/**
 * System Monitor Component
 * Hidden admin panel for performance monitoring and optimization
 * Tracks component render times, memory usage, and system health
 */

import { useState, useEffect, useRef, Profiler } from 'react';
import type { ProfilerOnRenderCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  Battery,
  Cpu,
  MemoryStick,
  RefreshCw,
  Shield,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import PerformanceHUD from './PerformanceHUD';

interface RenderMetrics {
  componentName: string;
  phase: string;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  renderCount: number;
  avgDuration: number;
  maxDuration: number;
}

interface SystemMetrics {
  memoryUsage: {
    used: number; // MB
    total: number; // MB
    percentage: number;
    jsHeapSizeLimit?: number; // MB
    totalJSHeapSize?: number; // MB
    usedJSHeapSize?: number; // MB
  };
  renderMetrics: RenderMetrics[];
  batteryLevel?: number;
  batteryCharging?: boolean;
  cpuWarning: boolean;
  memoryWarning: boolean;
  lastUpdate: Date;
}

// Extended Performance interface for memory API
interface PerformanceMemory {
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
}

interface BatteryManager {
  level: number;
  charging: boolean;
}

const MEMORY_WARNING_THRESHOLD = 500; // MB
const CPU_WARNING_DURATION = 100; // ms (if render takes longer than this, show warning)
const UPDATE_INTERVAL = 5000; // 5 seconds

export default function SystemMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: { used: 0, total: 0, percentage: 0 },
    renderMetrics: [],
    cpuWarning: false,
    memoryWarning: false,
    lastUpdate: new Date(),
  });
  const renderMetricsRef = useRef<Map<string, RenderMetrics>>(new Map());
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // React Profiler callback - set as global so components can use it
  const onRenderCallback: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    const existing = renderMetricsRef.current.get(id) || {
      componentName: id,
      phase: 'mount',
      actualDuration: 0,
      baseDuration: 0,
      startTime: 0,
      commitTime: 0,
      renderCount: 0,
      avgDuration: 0,
      maxDuration: 0,
    };

    const newRenderCount = existing.renderCount + 1;
    const newAvgDuration = (existing.avgDuration * existing.renderCount + actualDuration) / newRenderCount;
    const newMaxDuration = Math.max(existing.maxDuration, actualDuration);

    const renderMetric: RenderMetrics = {
      componentName: id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      renderCount: newRenderCount,
      avgDuration: newAvgDuration,
      maxDuration: newMaxDuration,
    };

    renderMetricsRef.current.set(id, renderMetric);

    // Check for CPU warning (if render takes too long)
    if (actualDuration > CPU_WARNING_DURATION) {
      setMetrics((prev) => ({ ...prev, cpuWarning: true }));
    }
  };

  // Set global callback when component mounts
  useEffect(() => {
    setGlobalRenderCallback(onRenderCallback);
    return () => {
      setGlobalRenderCallback(() => {});
    };
  }, []);

  // Update system metrics
  const updateMetrics = () => {
    // Memory metrics
      const performanceMemory = (performance as unknown as { memory?: PerformanceMemory }).memory;
    let memoryUsed = 0;
    let memoryTotal = 0;

    if (performanceMemory) {
      memoryUsed = (performanceMemory.usedJSHeapSize || 0) / (1024 * 1024); // MB
      memoryTotal = (performanceMemory.jsHeapSizeLimit || 0) / (1024 * 1024); // MB
    } else {
      // Fallback: estimate from localStorage
      let localStorageSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          localStorageSize += key.length + value.length;
        }
      }
      memoryUsed = localStorageSize / (1024 * 1024) * 10; // Rough estimate
      memoryTotal = 2048; // Assume 2GB
    }

    const memoryPercentage = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;
    const memoryWarning = memoryUsed > MEMORY_WARNING_THRESHOLD;

    // Battery level (if available)
    let batteryLevel: number | undefined;
    let batteryCharging: boolean | undefined;

    if ('getBattery' in navigator) {
      ((navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery?.() || Promise.resolve(null as unknown as BatteryManager)).then((battery: BatteryManager | null) => {
        if (battery) {
          batteryLevel = battery.level * 100;
          batteryCharging = battery.charging;
        }
      });
    }

    // Collect render metrics
    const renderMetrics = Array.from(renderMetricsRef.current.values());

    setMetrics({
      memoryUsage: {
        used: memoryUsed,
        total: memoryTotal,
        percentage: memoryPercentage,
        jsHeapSizeLimit: performanceMemory?.jsHeapSizeLimit
          ? performanceMemory.jsHeapSizeLimit / (1024 * 1024)
          : undefined,
        totalJSHeapSize: performanceMemory?.totalJSHeapSize
          ? performanceMemory.totalJSHeapSize / (1024 * 1024)
          : undefined,
        usedJSHeapSize: performanceMemory?.usedJSHeapSize
          ? performanceMemory.usedJSHeapSize / (1024 * 1024)
          : undefined,
      },
      renderMetrics,
      batteryLevel,
      batteryCharging,
      cpuWarning: renderMetrics.some((m) => m.actualDuration > CPU_WARNING_DURATION),
      memoryWarning,
      lastUpdate: new Date(),
    });
  };

  // Set up interval for metrics updates
  useEffect(() => {
    if (isVisible) {
      updateMetrics();
      updateIntervalRef.current = setInterval(updateMetrics, UPDATE_INTERVAL);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isVisible]);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+M)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle tab refresh recommendation
  const handleRefresh = () => {
    if (confirm('Refresh the page to free up memory? All unsaved changes will be lost.')) {
      window.location.reload();
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-forest-green/80 hover:bg-forest-green text-brushed-gold rounded-full shadow-lg transition-all touch-manipulation"
        title="System Monitor (Ctrl+Shift+M)"
      >
        <Shield size={20} />
      </button>
    );
  }

  return (
    <>
      <PerformanceHUD />
      <div className="fixed inset-4 bg-white border-2 border-brushed-gold rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-forest-green text-brushed-gold p-4 flex items-center justify-between border-b border-brushed-gold/20">
        <div className="flex items-center gap-3">
          <Activity className="text-brushed-gold" size={24} />
          <h2 className="text-xl font-bold">System Monitor (Admin Only)</h2>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-forest-green/50 rounded-lg transition-colors"
        >
          ×
        </button>
      </div>

      {/* Warnings */}
      {(metrics.memoryWarning || metrics.cpuWarning) && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-4">
            {metrics.memoryWarning && (
              <div className="flex items-center gap-2 flex-1">
                <AlertTriangle className="text-red-600" size={20} />
                <div>
                  <p className="font-semibold text-red-800">
                    High Memory Usage Detected ({formatNumber(metrics.memoryUsage.used, 0)} MB)
                  </p>
                  <p className="text-sm text-red-700">
                    Consider refreshing the tab to free up memory
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh Tab
                </button>
              </div>
            )}
            {metrics.cpuWarning && (
              <div className="flex items-center gap-2">
                <Cpu className="text-orange-600" size={20} />
                <div>
                  <p className="font-semibold text-orange-800">High CPU Usage</p>
                  <p className="text-sm text-orange-700">
                    Some components taking longer than {CPU_WARNING_DURATION}ms to render
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Memory Usage */}
        <div className="bg-gray-50 rounded-xl border border-brushed-gold/20 p-6">
          <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
            <MemoryStick className="text-brushed-gold" size={20} />
            Memory Usage
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-forest-green/70">Used / Total</span>
                <span className="font-semibold text-forest-green">
                  {formatNumber(metrics.memoryUsage.used, 0)} MB /{' '}
                  {formatNumber(metrics.memoryUsage.total, 0)} MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    metrics.memoryWarning ? 'bg-red-500' : 'bg-brushed-gold'
                  }`}
                  style={{ width: `${Math.min(metrics.memoryUsage.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-forest-green/60 mt-2">
                <span>{formatNumber(metrics.memoryUsage.percentage, 1)}% used</span>
                {metrics.memoryUsage.usedJSHeapSize && (
                  <span>JS Heap: {formatNumber(metrics.memoryUsage.usedJSHeapSize, 0)} MB</span>
                )}
              </div>
            </div>
            {metrics.memoryUsage.jsHeapSizeLimit && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-forest-green/60">JS Heap Limit</p>
                  <p className="font-semibold text-forest-green">
                    {formatNumber(metrics.memoryUsage.jsHeapSizeLimit, 0)} MB
                  </p>
                </div>
                <div>
                  <p className="text-forest-green/60">Total JS Heap</p>
                  <p className="font-semibold text-forest-green">
                    {metrics.memoryUsage.totalJSHeapSize
                      ? formatNumber(metrics.memoryUsage.totalJSHeapSize, 0)
                      : 'N/A'}{' '}
                    MB
                  </p>
                </div>
                <div>
                  <p className="text-forest-green/60">Used JS Heap</p>
                  <p className="font-semibold text-forest-green">
                    {metrics.memoryUsage.usedJSHeapSize
                      ? formatNumber(metrics.memoryUsage.usedJSHeapSize, 0)
                      : 'N/A'}{' '}
                    MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Battery Status */}
        {metrics.batteryLevel !== undefined && (
          <div className="bg-gray-50 rounded-xl border border-brushed-gold/20 p-6">
            <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
              <Battery
                className={
                  metrics.batteryLevel < 20 ? 'text-red-600' : 'text-brushed-gold'
                }
                size={20}
              />
              Battery Status
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-forest-green/70">Battery Level</span>
                  <span
                    className={`font-semibold ${
                      metrics.batteryLevel < 20 ? 'text-red-600' : 'text-forest-green'
                    }`}
                  >
                    {formatNumber(metrics.batteryLevel, 0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      metrics.batteryLevel < 20
                        ? 'bg-red-500'
                        : metrics.batteryLevel < 50
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.batteryLevel}%` }}
                  />
                </div>
              </div>
              {metrics.batteryCharging && (
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">Charging</span>
                </div>
              )}
              {metrics.batteryLevel < 20 && !metrics.batteryCharging && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-medium">Low Battery</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Component Render Metrics */}
        <div className="bg-gray-50 rounded-xl border border-brushed-gold/20 p-6">
          <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
            <Cpu className="text-brushed-gold" size={20} />
            Component Render Performance
          </h3>
          {metrics.renderMetrics.length === 0 ? (
            <p className="text-forest-green/50 text-center py-8">
              No render metrics collected yet. Navigate to Inventory or Analytics pages to start
              tracking.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brushed-gold/20">
                    <th className="text-left py-2 text-forest-green font-semibold">Component</th>
                    <th className="text-right py-2 text-forest-green font-semibold">Render Count</th>
                    <th className="text-right py-2 text-forest-green font-semibold">
                      Avg Duration (ms)
                    </th>
                    <th className="text-right py-2 text-forest-green font-semibold">
                      Max Duration (ms)
                    </th>
                    <th className="text-right py-2 text-forest-green font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.renderMetrics
                    .filter((m) => m.componentName === 'Inventory' || m.componentName === 'ProfitAnalytics')
                    .sort((a, b) => b.maxDuration - a.maxDuration)
                    .map((metric, index) => {
                      const isSlow = metric.avgDuration > CPU_WARNING_DURATION;
                      return (
                        <tr
                          key={index}
                          className={`border-b border-brushed-gold/10 ${
                            isSlow ? 'bg-red-50/50' : ''
                          }`}
                        >
                          <td className="py-2 text-forest-green font-medium">
                            {metric.componentName}
                          </td>
                          <td className="py-2 text-right text-forest-green">
                            {metric.renderCount}
                          </td>
                          <td className="py-2 text-right text-forest-green">
                            {formatNumber(metric.avgDuration, 2)}
                          </td>
                          <td className="py-2 text-right">
                            <span
                              className={
                                metric.maxDuration > CPU_WARNING_DURATION
                                  ? 'text-red-600 font-semibold'
                                  : 'text-forest-green'
                              }
                            >
                              {formatNumber(metric.maxDuration, 2)}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            {isSlow ? (
                              <span className="text-red-600 flex items-center justify-end gap-1">
                                <AlertTriangle size={14} />
                                Slow
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center justify-end gap-1">
                                <CheckCircle size={14} />
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Last Update */}
        <div className="text-center text-xs text-forest-green/60">
          Last updated: {metrics.lastUpdate.toLocaleTimeString('en-IN')}
        </div>
      </div>
      </div>
    </>
  );
}

// Helper function for number formatting
function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

// ✅ Export useSystemMonitor hook for other components to use
// This hook provides access to the global render callback for React Profiler
let globalRenderCallback: ProfilerOnRenderCallback | null = null;

export function setGlobalRenderCallback(callback: ProfilerOnRenderCallback) {
  globalRenderCallback = callback;
}

export function useSystemMonitor() {
  return {
    onRenderCallback: globalRenderCallback || (() => {}),
  };
}

