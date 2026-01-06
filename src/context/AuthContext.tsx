/**
 * Enhanced Authentication Context with WebAuthn Support
 * Adds fingerprint authentication and security logging
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authenticateWithWebAuthn, registerWebAuthnCredential, hasWebAuthnCredentials, getDeviceName, isWebAuthnSupported } from '../utils/webauthn';
import { logLoginSuccess, logLoginFailure, logLogout } from '../utils/securityLog';

export type UserRole = 'admin' | 'accountant';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

// User database with IDs for WebAuthn
const USERS: Array<User & { pin: string }> = [
  { id: 'admin-001', username: 'Administrator', role: 'admin', pin: '1234' },
  { id: 'account-001', username: 'Accountant', role: 'accountant', pin: '5678' },
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (pin: string) => boolean;
  loginWithFingerprint: () => Promise<{ success: boolean; error?: string }>;
  registerFingerprint: (userId: string, userName: string) => Promise<{ success: boolean; error?: string }>;
  hasFingerprint: (userId?: string) => boolean;
  isWebAuthnAvailable: boolean;
  logout: () => void;
  hasAccess: (page: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load session from sessionStorage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const stored = sessionStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading session:', error);
        sessionStorage.removeItem('user');
      } finally {
        setIsInitialized(true);
      }
    };
    loadSession();
  }, []);

  const login = (pin: string): boolean => {
    const foundUser = USERS.find(u => u.pin === pin);
    if (foundUser) {
      const { pin: _, ...userWithoutPin } = foundUser;
      setUser(userWithoutPin);
      sessionStorage.setItem('user', JSON.stringify(userWithoutPin));
      
      // Log successful login
      logLoginSuccess(userWithoutPin.id, userWithoutPin.username, getDeviceName(), 'pin');
      
      return true;
    }
    
    // Log failed login
    logLoginFailure(getDeviceName(), 'pin', 'Invalid PIN');
    return false;
  };

  const loginWithFingerprint = async (): Promise<{ success: boolean; error?: string }> => {
    const result = await authenticateWithWebAuthn();
    
    if (result.success && result.userId) {
      // Find user by ID
      const foundUser = USERS.find(u => u.id === result.userId);
      if (foundUser) {
        const { pin: _, ...userWithoutPin } = foundUser;
        setUser(userWithoutPin);
        sessionStorage.setItem('user', JSON.stringify(userWithoutPin));
        
        // Log successful login
        logLoginSuccess(userWithoutPin.id, userWithoutPin.username, result.deviceName || getDeviceName(), 'webauthn');
        
        return { success: true };
      }
    }
    
    // Log failed login
    logLoginFailure(getDeviceName(), 'webauthn', result.error || 'Authentication failed');
    
    return { success: false, error: result.error };
  };

  const registerFingerprint = async (userId: string, userName: string): Promise<{ success: boolean; error?: string }> => {
    return await registerWebAuthnCredential(userId, userName, getDeviceName());
  };

  const hasFingerprint = (userId?: string): boolean => {
    return hasWebAuthnCredentials(userId);
  };

  const isWebAuthnAvailable = isWebAuthnSupported();

  const logout = () => {
    if (user) {
      logLogout(user.id, user.username, getDeviceName());
    }
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const hasAccess = (page: string): boolean => {
    if (!user) return false;

    // Admin has full access
    if (user.role === 'admin') return true;

    // Accountant access rules
    if (user.role === 'accountant') {
      const accountantPages = [
        'dashboard', 
        'inventory', 
        'purchases', 
        'accounting', 
        'endofday', 
        'excise',
        'system'
      ];
      return accountantPages.includes(page);
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isInitialized,
      login, 
      loginWithFingerprint,
      registerFingerprint,
      hasFingerprint,
      isWebAuthnAvailable,
      logout, 
      hasAccess 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}