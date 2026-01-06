/**
 * Privacy Mode Context
 * Blurs revenue and profit figures unless hovered
 * Useful when customers are near the laptop
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';

interface PrivacyModeContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
}

const PrivacyModeContext = createContext<PrivacyModeContextType | undefined>(undefined);

const PRIVACY_MODE_KEY = 'deepa_privacy_mode';

export function PrivacyModeProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(PRIVACY_MODE_KEY);
    return stored === 'true';
  });

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => {
      const newValue = !prev;
      localStorage.setItem(PRIVACY_MODE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PRIVACY_MODE_KEY) {
        setIsPrivacyMode(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Memoize the context value to prevent re-renders
  const contextValue = useMemo(
    () => ({ isPrivacyMode, togglePrivacyMode }),
    [isPrivacyMode, togglePrivacyMode]
  );

  return (
    <PrivacyModeContext.Provider value={contextValue}>
      {children}
    </PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode() {
  const context = useContext(PrivacyModeContext);
  if (!context) {
    throw new Error('usePrivacyMode must be used within PrivacyModeProvider');
  }
  return context;
}

