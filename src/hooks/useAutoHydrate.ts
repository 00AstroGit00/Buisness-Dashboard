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
    // 3. autoHydrateFromExcel is available
    if (inventoryItems.length === 0 && !isLoading && typeof autoHydrateFromExcel === 'function' && filePath) {
      autoHydrateFromExcel(filePath);
    }
  }, [autoHydrateFromExcel, filePath, inventoryItems.length, isLoading]); // Run when dependencies change

  return { isLoading, lastHydrated, itemCount: inventoryItems.length };
}

