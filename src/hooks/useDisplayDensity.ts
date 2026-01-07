import { useState, useEffect } from 'react';

export type DisplayDensity = 'compact' | 'balanced' | 'detailed';

interface DensityConfig {
  density: DisplayDensity;
  columns: number;
  showGuest: boolean;
  showStatus: boolean;
  showDates: boolean;
  showBilling: boolean;
}

export const useDisplayDensity = () => {
  const [config, setConfig] = useState<DensityConfig>({
    density: 'detailed',
    columns: 6,
    showGuest: true,
    showStatus: true,
    showDates: true,
    showBilling: true,
  });

  const [orientation, setOrientation] = useState<string>(
    typeof window !== 'undefined' ? window.screen?.orientation?.type || 'portrait-primary' : 'portrait-primary'
  );

  useEffect(() => {
    const updateDensity = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        // S23 Ultra / Mobile Compact
        setConfig({
          density: 'compact',
          columns: 2,
          showGuest: false,
          showStatus: true,
          showDates: false,
          showBilling: false,
        });
      } else if (width >= 768 && width < 1280) {
        // MI Pad 7 / Tablet Balanced
        setConfig({
          density: 'balanced',
          columns: 4,
          showGuest: true,
          showStatus: true,
          showDates: false,
          showBilling: false,
        });
      } else {
        // HP Laptop / Desktop Detailed
        setConfig({
          density: 'detailed',
          columns: 6,
          showGuest: true,
          showStatus: true,
          showDates: true,
          showBilling: true,
        });
      }
    };

    const handleOrientationChange = () => {
      setOrientation(window.screen?.orientation?.type || 'unknown');
      updateDensity();
    };

    updateDensity();
    window.addEventListener('resize', updateDensity);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', updateDensity);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return { ...config, orientation };
};
