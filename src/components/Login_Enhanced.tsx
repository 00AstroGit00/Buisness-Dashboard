/**
 * Enhanced Login Component with Fingerprint Support
 * Replace your existing Login.tsx with this version
 * Supports both PIN and WebAuthn (fingerprint) authentication
 */

import { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle, Fingerprint, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithFingerprint, hasFingerprint, isWebAuthnAvailable } = useAuth();
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showFingerprintPrompt, setShowFingerprintPrompt] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if fingerprint is available on mount
  useEffect(() => {
    if (isWebAuthnAvailable && hasFingerprint()) {
      setShowFingerprintPrompt(true);
    }
  }, [isWebAuthnAvailable, hasFingerprint]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError('Please enter a 4-digit PIN');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const success = login(pinString);

      if (!success) {
        setError('Invalid PIN. Please try again.');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }

      setIsSubmitting(false);
    }, 300);
  };

  const handleFingerprintLogin = async () => {
    setError('');
    setIsAuthenticating(true);

    try {
      const result = await loginWithFingerprint();
      if (!result.success) {
        setError(result.error || 'Fingerprint authentication failed');
      }
    } catch (err) {
      setError('An error occurred during authentication');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-green via-forest-green/90 to-forest-green/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-brushed-gold" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-brushed-gold mb-2">
            Deepa Restaurant & Tourist Home
          </h1>
          <p className="text-brushed-gold/80 text-sm">Cherpulassery, Palakkad</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-forest-green to-forest-green-light rounded-full">
              <Lock className="text-brushed-gold" size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-forest-green text-center mb-2">
            Secure Login
          </h2>
          <p className="text-forest-green/70 text-center mb-8">
            Enter your 4-digit PIN to continue
          </p>

          <form onSubmit={handleSubmit}>
            {/* PIN Input */}
            <div className="flex justify-center gap-4 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isSubmitting || isAuthenticating}
                  className="w-16 h-16 md:w-20 md:h-20 text-center text-3xl md:text-4xl font-bold border-2 rounded-xl transition-all touch-manipulation focus:outline-none focus:ring-4 focus:ring-brushed-gold/30 focus:border-brushed-gold disabled:opacity-50 disabled:cursor-not-allowed border-forest-green/30 text-forest-green bg-white shadow-sm"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* PIN Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || isAuthenticating}
              className="w-full bg-gradient-to-r from-brushed-gold to-brushed-gold-light hover:from-brushed-gold-light hover:to-brushed-gold text-forest-green font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-forest-green border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Login with PIN
                </>
              )}
            </button>

            {/* Fingerprint Login Option */}
            {showFingerprintPrompt && isWebAuthnAvailable && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-forest-green/60 text-sm">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFingerprintLogin}
                  disabled={isAuthenticating || isSubmitting}
                  className="w-full bg-gradient-to-r from-forest-green to-forest-green-light hover:from-forest-green-light hover:to-forest-green text-brushed-gold font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 touch-manipulation min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-brushed-gold border-t-transparent" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Fingerprint size={24} />
                      Fingerprint Login
                    </>
                  )}
                </button>

                <p className="text-xs text-forest-green/60 text-center mt-3">
                  📱 Use your Samsung S23 Ultra fingerprint sensor for quick access
                </p>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-brushed-gold/60 text-xs mb-2">
            <ShieldCheck size={14} />
            <span>Secured with enterprise-grade encryption</span>
          </div>
          <p className="text-brushed-gold/50 text-xs">
            Secure access for authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}

