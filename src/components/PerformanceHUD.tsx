/**
 * Performance HUD Component
 * Displays real-time FPS and memory usage
 * Optimized for MI Pad 7 high-refresh-rate display
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Monitor, Zap, TrendingUp } from 'lucide-react';

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
        className="fixed bottom-20 right-4 z-50 p-2 bg-forest-green/80 hover:bg-forest-green text-brushed-gold rounded-full shadow-lg transition-all touch-manipulation"
        title="Performance HUD (Ctrl+Shift+P)"
      >
        <Activity size={18} />
      </button>
    );
  }

  const fpsColor = metrics.fps >= TARGET_FPS ? 'text-green-500' : metrics.fps >= 30 ? 'text-yellow-500' : 'text-red-500';
  const memoryColor = metrics.memoryUsed < MEMORY_WARNING_THRESHOLD ? 'text-green-500' : 'text-yellow-500';
  const memoryWarning = metrics.memoryUsed > MEMORY_WARNING_THRESHOLD;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-forest-green/95 backdrop-blur-sm border-2 border-brushed-gold rounded-xl shadow-2xl p-4 min-w-[280px] font-mono text-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Monitor className="text-brushed-gold" size={18} />
          <h3 className="text-brushed-gold font-bold">Performance HUD</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-brushed-gold/70 hover:text-brushed-gold transition-colors"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* FPS Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-brushed-gold/80" size={14} />
            <span className="text-brushed-gold/80">FPS:</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-bold text-lg ${fpsColor}`}>
              {metrics.fps}
            </span>
            <span className="text-brushed-gold/60 text-xs">
              ({metrics.frameTime}ms)
            </span>
          </div>
        </div>

        {/* Memory Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brushed-gold/80" size={14} />
            <span className="text-brushed-gold/80">Memory:</span>
          </div>
          <div className="flex flex-col items-end">
            <span className={`font-bold ${memoryColor}`}>
              {metrics.memoryUsed} / {metrics.memoryTotal} MB
            </span>
            <span className="text-brushed-gold/60 text-xs">
              {metrics.memoryPercentage}%
            </span>
          </div>
        </div>

        {/* FPS Bar */}
        <div className="h-2 bg-forest-green/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              metrics.fps >= TARGET_FPS
                ? 'bg-green-500'
                : metrics.fps >= 30
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((metrics.fps / TARGET_FPS) * 100, 100)}%` }}
          />
        </div>

        {/* Memory Bar */}
        <div className="h-2 bg-forest-green/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              memoryWarning ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(metrics.memoryPercentage, 100)}%` }}
          />
        </div>

        {/* Warning */}
        {memoryWarning && (
          <div className="text-xs text-yellow-400 text-center pt-1 border-t border-brushed-gold/20">
            ⚠ High memory usage
          </div>
        )}

        {metrics.fps < 30 && (
          <div className="text-xs text-red-400 text-center pt-1 border-t border-brushed-gold/20">
            ⚠ Low FPS - UI may lag
          </div>
        )}
      </div>
    </div>
  );
}

