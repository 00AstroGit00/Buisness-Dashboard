/**
 * useHapticFeedback Hook
 * Provides tactile pulses for mobile (S23 Ultra) and Toasts for desktop (HP Laptop).
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

export const useHapticFeedback = () => {
  const triggerSuccess = useCallback((message: string) => {
    // 1. Mobile Haptics
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }

    // 2. Desktop/Global Toast
    toast.success(message, {
      style: {
        background: 'rgba(10, 61, 49, 0.9)', // Forest Green
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(197, 160, 89, 0.3)', // Gold border
        color: '#f8fafc',
      },
      icon: '✅',
    });
  }, []);

  const triggerError = useCallback((message: string) => {
    // 1. Mobile Haptics (Pattern for Error)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }

    // 2. Desktop/Global Toast
    toast.error(message, {
      style: {
        background: 'rgba(239, 68, 68, 0.9)', // Red
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#f8fafc',
      },
      icon: '⚠️',
    });
  }, []);

  return { triggerSuccess, triggerError };
};
