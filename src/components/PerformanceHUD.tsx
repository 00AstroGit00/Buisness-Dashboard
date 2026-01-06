/**
 * Performance HUD Component
 * Displays real-time FPS and memory usage
 * Optimized for MI Pad 7 high-refresh-rate display
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Monitor, Zap, TrendingUp, X, Cpu, HardDrive, Thermometer } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memoryUsed: number; // MB
  memoryTotal: number; // MB
  memoryPercentage: number;
  frameTime: number; // ms
}

const TARGET_FPS = 60; // Target FPS for smooth animations
const MEMORY_WARNING_THRESHOLD = 400; // MB

export default function PerformanceHUD() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    memoryPercentage: 0,
    frameTime: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const memoryCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // FPS calculation using requestAnimationFrame
  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;

    frameCountRef.current++;

    // Update every second
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      const frameTime = delta / frameCountRef.current;

      setMetrics((prev) => ({
        ...prev,
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(calculateFPS);
  }, []);

  // Memory monitoring
  const updateMemory = useCallback(() => {
    if (window.performance && (window.performance as any).memory) {
      const memory = (window.performance as any).memory;
      const memoryUsed = memory.usedJSHeapSize / (1024 * 1024); // MB
      const memoryTotal = memory.jsHeapSizeLimit / (1024 * 1024); // MB
      const memoryPercentage = (memoryUsed / memoryTotal) * 100;

      setMetrics((prev) => ({
        ...prev,
        memoryUsed: Math.round(memoryUsed),
        memoryTotal: Math.round(memoryTotal),
        memoryPercentage: Math.round(memoryPercentage * 10) / 10,
      }));
    }
  }, []);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Start FPS monitoring
  useEffect(() => {
    if (isVisible) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(calculateFPS);
      memoryCheckIntervalRef.current = setInterval(updateMemory, 500); // Update every 500ms
      updateMemory(); // Initial update
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (memoryCheckIntervalRef.current) {
        clearInterval(memoryCheckIntervalRef.current);
      }
    };
  }, [isVisible, calculateFPS, updateMemory]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 p-3 bg-gradient-to-br from-forest-green to-forest-green-light hover:from-forest-green-light hover:to-forest-green text-brushed-gold rounded-full shadow-xl transition-all touch-manipulation hover:scale-110"
        title="Performance HUD (Ctrl+Shift+P)"
      >
        <Activity size={20} />
      </button>
    );
  }

  const fpsColor = metrics.fps >= TARGET_FPS ? 'text-green-500' : metrics.fps >= 30 ? 'text-yellow-500' : 'text-red-500';
  const memoryColor = metrics.memoryUsed < MEMORY_WARNING_THRESHOLD ? 'text-green-500' : 'text-yellow-500';
  const memoryWarning = metrics.memoryUsed > MEMORY_WARNING_THRESHOLD;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white/95 backdrop-blur-sm border-2 border-brushed-gold/30 rounded-2xl shadow-2xl p-5 min-w-[300px] font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-forest-green/10 rounded-lg">
            <Monitor className="text-forest-green" size={20} />
          </div>
          <h3 className="text-forest-green font-bold text-lg">Performance Monitor</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {/* FPS Display */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              metrics.fps >= TARGET_FPS ? 'bg-green-100' : metrics.fps >= 30 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Zap className={`${
                metrics.fps >= TARGET_FPS ? 'text-green-600' : metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600'
              }`} size={16} />
            </div>
            <span className="text-forest-green/80 font-medium">Frames Per Second</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-xl ${
              metrics.fps >= TARGET_FPS ? 'text-green-600' : metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.fps}
            </span>
            <span className="text-forest-green/60 text-sm">
              ({metrics.frameTime}ms)
            </span>
          </div>
        </div>

        {/* Memory Display */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              memoryWarning ? 'bg-yellow-100' : 'bg-forest-green/10'
            }`}>
              <HardDrive className={`${
                memoryWarning ? 'text-yellow-600' : 'text-forest-green'
              }`} size={16} />
            </div>
            <span className="text-forest-green/80 font-medium">Memory Usage</span>
          </div>
          <div className="flex flex-col items-end">
            <span className={`font-bold ${
              memoryWarning ? 'text-yellow-600' : 'text-forest-green'
            }`}>
              {metrics.memoryUsed} / {metrics.memoryTotal} MB
            </span>
            <span className="text-forest-green/60 text-sm">
              {metrics.memoryPercentage}%
            </span>
          </div>
        </div>

        {/* FPS Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-forest-green/70">
            <span>FPS</span>
            <span>{metrics.fps}/{TARGET_FPS}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.fps >= TARGET_FPS
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : metrics.fps >= 30
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${Math.min((metrics.fps / TARGET_FPS) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Memory Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-forest-green/70">
            <span>Memory</span>
            <span>{metrics.memoryPercentage}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                memoryWarning ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: `${Math.min(metrics.memoryPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className={`p-3 rounded-xl text-center ${
            metrics.fps >= TARGET_FPS ? 'bg-green-50 border border-green-200' :
            metrics.fps >= 30 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm font-bold ${
              metrics.fps >= TARGET_FPS ? 'text-green-700' :
              metrics.fps >= 30 ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {metrics.fps >= TARGET_FPS ? 'Excellent' :
               metrics.fps >= 30 ? 'Good' : 'Poor'}
            </div>
            <div className="text-xs text-forest-green/60">Performance</div>
          </div>

          <div className={`p-3 rounded-xl text-center ${
            memoryWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
          }`}>
            <div className={`text-sm font-bold ${
              memoryWarning ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {memoryWarning ? 'High' : 'Normal'}
            </div>
            <div className="text-xs text-forest-green/60">Memory</div>
          </div>
        </div>
      </div>
    </div>
  );
}

