/**
 * Hook to load inventory data from Excel file on component mount
 */

import { useEffect } from 'react';
import { useStore } from '../store/Store';

export function useInventoryLoader(filePath?: string) {
  const { loadInventoryFromExcel, isLoadingInventory, inventoryError } = useStore();

  useEffect(() => {
    // Only load if filePath is provided and inventory is empty
    if (filePath) {
      const hasInventory = useStore.getState().inventory.length > 0;
      if (!hasInventory) {
        loadInventoryFromExcel(filePath);
      }
    }
  }, [filePath, loadInventoryFromExcel]);

  return { isLoadingInventory, inventoryError };
}

