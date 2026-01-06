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
      className={`p-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all touch-manipulation bg-gradient-to-r ${
        isPrivacyMode
          ? 'from-brushed-gold to-brushed-gold-light text-forest-green shadow-lg'
          : 'from-gray-200 to-gray-300 text-forest-green/80 hover:from-gray-300 hover:to-gray-400'
      }`}
      title={isPrivacyMode ? 'Privacy Mode Active' : 'Privacy Mode Inactive'}
    >
      {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
      <span className="hidden sm:inline text-xs font-bold">
        {isPrivacyMode ? 'PRIVACY ON' : 'PRIVACY OFF'}
      </span>
    </button>
  );
}

