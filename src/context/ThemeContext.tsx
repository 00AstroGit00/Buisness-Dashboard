/**
 * Theme Context for Deepa Restaurant
 * Manages Day Mode and Dark Hospitality (Bar) Mode.
 * Includes automatic time-based switching for Cherpulassery (IST).
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ThemeMode = 'day' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isAutoMode: boolean;
  setIsAutoMode: (auto: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark'); // Default to dark for 2026 feel
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Time-based automatic switching logic
  useEffect(() => {
    if (!isAutoMode) return;

    const checkTime = () => {
      // Get IST time (Cherpulassery)
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const hours = istTime.getHours();

      // If after 7:00 PM (19:00), switch to Dark Mode
      if (hours >= 19 || hours < 6) {
        setMode('dark');
      } else {
        setMode('day');
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAutoMode]);

  // Apply theme to document body
  useEffect(() => {
    const body = document.body;
    if (mode === 'dark') {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }, [mode]);

  const toggleTheme = () => {
    setIsAutoMode(false); // Disable auto-mode if user manually toggles
    setMode(prev => (prev === 'day' ? 'dark' : 'day'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isAutoMode, setIsAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
