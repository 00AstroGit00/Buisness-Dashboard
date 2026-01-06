/**
 * WebAuthn Utilities
 * Handles biometric authentication and device identification
 */

/**
 * Get a user-friendly name for the current device
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  
  // Detect Samsung S23 Ultra (approximate)
  if (/Samsung/i.test(ua) || /SM-S918/i.test(ua)) {
    return 'Samsung S23 Ultra';
  }
  
  // Detect MI Pad 7 (approximate)
  if (/Xiaomi/i.test(ua) || /Pad 7/i.test(ua)) {
    return 'MI Pad 7';
  }
  
  // Common mobile devices
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android Device';
  
  // PC/Laptop
  if (/Windows/i.test(ua)) {
    if (/HP/i.test(ua)) return 'HP Laptop (Windows)';
    return 'Windows PC';
  }
  if (/Macintosh/i.test(ua)) return 'MacBook/iMac';
  
  return 'Unknown Device';
}

/**
 * Check if WebAuthn is supported by the browser
 */
export function isWebAuthnSupported(): boolean {
  return !!(
    window.PublicKeyCredential &&
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
  );
}

/**
 * Placeholder for WebAuthn registration
 * In production, this would use navigator.credentials.create
 */
export async function registerWebAuthnCredential(
  userId: string,
  userName: string,
  deviceName: string
): Promise<{ success: boolean; error?: string }> {
  console.log('Registering WebAuthn for:', userName, 'on', deviceName);
  // Simulated success
  return { success: true };
}

/**
 * Placeholder for WebAuthn authentication
 * In production, this would use navigator.credentials.get
 */
export async function authenticateWithWebAuthn(): Promise<{ 
  success: boolean; 
  deviceName?: string;
  error?: string;
  userId?: string;
}> {
  // Simulated success - auto-login as admin for prototype
  return { 
    success: true, 
    deviceName: getDeviceName(),
    userId: 'admin-001' 
  };
}

/**
 * Check if the user has already registered WebAuthn credentials
 */
export function hasWebAuthnCredentials(userId?: string): boolean {
  // In a real app, we'd check if specific credentials exist for this user
  return !!localStorage.getItem('deepa_webauthn_credentials');
}
