/**
 * Login Component
 * PIN-based authentication optimized for mobile touch (S23 Ultra)
 */

import { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - go to previous input if current is empty
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        if (digits.length === 4) {
          const newPin = digits.split('');
          setPin(newPin);
          inputRefs.current[3]?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const pinString = pin.join('');
    
    if (pinString.length !== 4) {
      setError('Please enter a 4-digit PIN');
      setIsSubmitting(false);
      return;
    }

    // Small delay for better UX
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

  const handleClear = () => {
    setPin(['', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-green via-forest-green-light to-forest-green-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <img
            src="/Buisiness-Branding-Elements/dashboard_assets/assets/images/logo-with-branding.png"
            alt="Deepa Restaurant & Tourist Home Logo"
            className="w-32 h-auto mx-auto mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold text-brushed-gold mb-2">
            Deepa Restaurant & Tourist Home
          </h1>
          <p className="text-brushed-gold/80 text-sm">Cherpulassery, Palakkad</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-brushed-gold/30">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-forest-green/10 rounded-full">
              <Lock className="text-forest-green" size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-forest-green text-center mb-2">
            Secure Login
          </h2>
          <p className="text-hotel-forest/60 text-center mb-8">
            Enter your 4-digit PIN to continue
          </p>

          <form onSubmit={handleSubmit}>
            {/* PIN Input */}
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                    w-16 h-16 md:w-20 md:h-20
                    text-center text-2xl md:text-3xl font-bold
                    border-2 rounded-xl
                    focus:outline-none focus:ring-4
                    transition-all touch-manipulation
                    ${
                      error
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : digit
                        ? 'border-brushed-gold bg-brushed-gold/10 text-forest-green focus:border-forest-green focus:ring-forest-green/20'
                        : 'border-hotel-gold/30 text-hotel-forest focus:border-hotel-gold focus:ring-hotel-gold/20'
                    }
                  `}
                  autoComplete="off"
                  aria-label={`PIN digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 shrink-0" size={20} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || pin.some((d) => !d)}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg
                  transition-all duration-200 touch-manipulation
                  ${
                    isSubmitting || pin.some((d) => !d)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-forest-green text-brushed-gold hover:bg-forest-green/90 shadow-lg hover:shadow-xl active:scale-95'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-brushed-gold border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="w-full py-3 px-6 rounded-xl font-medium text-forest-green hover:bg-forest-green/10 transition-colors touch-manipulation"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Role Info */}
          <div className="mt-8 pt-6 border-t border-hotel-gold/20">
            <div className="flex items-start gap-3 text-sm text-hotel-forest/60">
              <User size={16} className="mt-0.5" />
              <div>
                <p className="font-medium text-hotel-forest mb-1">Available Roles:</p>
                <ul className="space-y-1">
                  <li>• <strong>Admin:</strong> Full access to Revenue & Staff</li>
                  <li>• <strong>Accountant:</strong> Access to Expenses & Inventory</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-brushed-gold/60 text-xs mt-6">
          Session expires when browser tab is closed
        </p>
      </div>
    </div>
  );
}

