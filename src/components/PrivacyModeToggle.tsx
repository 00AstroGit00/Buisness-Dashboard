/**
 * Privacy Mode Toggle Component
 * Toggle button for privacy mode
 */

import { Eye, EyeOff } from 'lucide-react';
import { usePrivacyMode } from '../context/PrivacyModeContext';

export default function PrivacyModeToggle() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();

  return (
    <button
      onClick={togglePrivacyMode}
      className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all touch-manipulation ${
        isPrivacyMode
          ? 'bg-brushed-gold text-forest-green shadow-md'
          : 'bg-gray-200 text-forest-green/70 hover:bg-gray-300'
      }`}
      title={isPrivacyMode ? 'Privacy Mode Active' : 'Privacy Mode Inactive'}
    >
      {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
      <span className="hidden sm:inline">
        Privacy Mode {isPrivacyMode ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

