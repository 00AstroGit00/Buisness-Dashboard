/**
 * Private Number Component
 * Renders a number with optional blur when privacy mode is active
 * Reveals on hover
 */

import { useState } from 'react';
import { usePrivacyMode } from '../context/PrivacyModeContext';

interface PrivateNumberProps {
  value: number | string;
  format?: (value: number | string) => string;
  className?: string;
  alwaysBlur?: boolean; // Always blur regardless of privacy mode
}

export default function PrivateNumber({
  value,
  format = (v) => String(v),
  className = '',
  alwaysBlur = false,
}: PrivateNumberProps) {
  const { isPrivacyMode } = usePrivacyMode();
  const [isHovered, setIsHovered] = useState(false);

  const shouldBlur = (isPrivacyMode || alwaysBlur) && !isHovered;

  return (
    <span
      className={`inline-block transition-all duration-200 ${className} ${
        shouldBlur ? 'blur-md select-none' : 'blur-none'
      } cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)} // Keep visible for 2s on touch
      title={shouldBlur ? 'Hover to reveal' : ''}
    >
      {format(value)}
    </span>
  );
}

