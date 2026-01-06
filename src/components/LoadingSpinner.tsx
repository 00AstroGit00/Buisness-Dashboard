import React from 'react';

/**
 * LoadingSpinner Component
 * Displayed while AuthContext initializes (loading session from sessionStorage)
 * Prevents blank-screen flash and ensures auth state is known before rendering Login/Dashboard
 */
export default function LoadingSpinner(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Outer ring */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="var(--color-forest-green)"
              strokeWidth="4"
              fill="none"
              strokeOpacity="0.2"
            />
            <path
              d="M60 32a28 28 0 0 0-5.2-15.8"
              stroke="var(--color-brushed-gold)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Inner circle with logo/icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-forest-green to-forest-green-light rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-brushed-gold rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold text-forest-green mb-2">Deepa Restaurant & Tourist Home</h2>
          <p className="text-forest-green/70 text-sm font-medium">Initializing dashboard…</p>
          <div className="mt-4 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="animate-progress h-full bg-gradient-to-r from-brushed-gold to-brushed-gold-light rounded-full w-1/3"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
