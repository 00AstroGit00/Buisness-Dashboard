/**
 * Hook to auto-hydrate business store from Excel on component mount
 */

import { useEffect } from 'react';
import { useBusinessStore } from '../store/useBusinessStore';

export function useAutoHydrate(filePath?: string) {
  const { autoHydrateFromExcel, isLoading, lastHydrated, inventoryItems } = useBusinessStore();

  useEffect(() => {
    // Only hydrate if:
    // 1. No items loaded yet
    // 2. Not currently loading
    // 3. No recent hydration (optional: can skip if hydrated in last 5 minutes)
    if (inventoryItems.length === 0 && !isLoading) {
      autoHydrateFromExcel(filePath);
    }
  }, []); // Run once on mount

  return { isLoading, lastHydrated, itemCount: inventoryItems.length };
}

