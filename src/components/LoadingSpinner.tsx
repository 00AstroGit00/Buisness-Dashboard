import React from 'react';

/**
 * LoadingSpinner Component
 * Displayed while AuthContext initializes (loading session from sessionStorage)
 * Prevents blank-screen flash and ensures auth state is known before rendering Login/Dashboard
 */
export default function LoadingSpinner(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-forest flex flex-col items-center justify-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 50 50"
        className="animate-spin mb-4"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="#c5a059"
          strokeWidth="5"
          fill="none"
          strokeOpacity="0.3"
        />
        <path
          d="M45 25a20 20 0 0 0-3.7-11"
          stroke="#c5a059"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <p className="text-brushed-gold text-sm font-medium">Initializing…</p>
    </div>
  );
}
