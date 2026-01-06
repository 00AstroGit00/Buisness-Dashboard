/**
 * Web Worker for Liquor Inventory Calculations
 * Offloads heavy 60ml peg-to-bottle reconciliation math from main UI thread
 */

import type { StockState, LiquorConfig } from '../utils/liquorLogic';

// Liquor configuration mapping (must be redefined here as workers can't import from utils)
const LIQUOR_CONFIGS: Record<number, { bottlesPerCase: number; mlPerBottle: number; pegsPerBottle: number }> = {
  1000: { bottlesPerCase: 9, mlPerBottle: 1000, pegsPerBottle: 16.67 },
  750: { bottlesPerCase: 12, mlPerBottle: 750, pegsPerBottle: 12.5 },
  500: { bottlesPerCase: 18, mlPerBottle: 500, pegsPerBottle: 8.33 },
  375: { bottlesPerCase: 24, mlPerBottle: 375, pegsPerBottle: 6.25 },
  650: { bottlesPerCase: 12, mlPerBottle: 650, pegsPerBottle: 10.83 },
};

const ML_PER_PEG = 60;

export interface PegSaleRequest {
  id: string;
  currentStock: StockState;
  mlPerBottle: number;
  remainingVolumeInCurrentBottle: number;
  pegsToSell: number;
}

export interface PegSaleResponse {
  id: string;
  updatedStock: StockState;
  remainingVolumeInCurrentBottle: number;
  bottlesDeducted: number;
}

/**
 * Calculate remaining pegs from volume
 */
function calculateRemainingPegs(currentVolumeMl: number): number {
  return Math.floor(currentVolumeMl / ML_PER_PEG);
}

/**
 * Process peg sale - deducts 60ml per peg with automatic bottle roll-over
 */
function processPegSale(request: PegSaleRequest): PegSaleResponse {
  let { remainingVolumeInCurrentBottle, currentStock, pegsToSell, mlPerBottle } = request;

  let bottlesDeducted = 0;
  let totalMlToDeduct = pegsToSell * ML_PER_PEG;

  // Deduct from current bottle first
  while (totalMlToDeduct > 0 && remainingVolumeInCurrentBottle > 0) {
    const deductFromCurrent = Math.min(totalMlToDeduct, remainingVolumeInCurrentBottle);
    remainingVolumeInCurrentBottle -= deductFromCurrent;
    totalMlToDeduct -= deductFromCurrent;

    // If current bottle is empty, open a new one
    if (remainingVolumeInCurrentBottle <= 0) {
      bottlesDeducted++;
      
      // Deduct bottle from stock
      if (currentStock.looseBottles > 0) {
        currentStock.looseBottles--;
      } else if (currentStock.fullCases > 0) {
        // Break a case
        currentStock.fullCases--;
        // Add remaining bottles from case (minus 1 that we just opened)
        // For now, assume all bottles from case are added as loose
        // This would need config lookup in real implementation
        currentStock.looseBottles += 11; // 12 - 1 = 11 for 750ml case
      }

      // Open new bottle
      remainingVolumeInCurrentBottle = mlPerBottle;
    }
  }

  // If we still have volume to deduct, take from stock
  if (totalMlToDeduct > 0) {
    // Calculate how many bottles we need
    const bottlesNeeded = Math.ceil(totalMlToDeduct / mlPerBottle);
    
    for (let i = 0; i < bottlesNeeded; i++) {
      if (currentStock.looseBottles > 0) {
        currentStock.looseBottles--;
        bottlesDeducted++;
      } else if (currentStock.fullCases > 0) {
        currentStock.fullCases--;
        currentStock.looseBottles += 11; // Break case (would need config lookup)
        currentStock.looseBottles--;
        bottlesDeducted++;
      }
    }

    // Deduct remaining volume from last bottle
    const volumeFromLastBottle = totalMlToDeduct % mlPerBottle;
    if (volumeFromLastBottle > 0) {
      remainingVolumeInCurrentBottle = mlPerBottle - volumeFromLastBottle;
    }
  }

  // Recalculate total values
  const totalBottles = currentStock.fullCases * 12 + currentStock.looseBottles; // Simplified - should use config
  const totalMl = (currentStock.fullCases * 12 * mlPerBottle) + (currentStock.looseBottles * mlPerBottle) + remainingVolumeInCurrentBottle;
  const totalPegs = calculateRemainingPegs(totalMl);
  const loosePegs = calculateRemainingPegs(remainingVolumeInCurrentBottle);

  const updatedStock: StockState = {
    ...currentStock,
    totalMl,
    totalBottles,
    totalPegs,
    loosePegs,
  };

  return {
    id: request.id,
    updatedStock,
    remainingVolumeInCurrentBottle,
    bottlesDeducted,
  };
}

/**
 * Batch process multiple peg sales
 */
function processBatchPegSales(requests: PegSaleRequest[]): PegSaleResponse[] {
  return requests.map(processPegSale);
}

// Worker message handler
self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'PEG_SALE':
        const response = processPegSale(payload as PegSaleRequest);
        self.postMessage({ type: 'PEG_SALE_RESULT', payload: response });
        break;

      case 'BATCH_PEG_SALES':
        const batchResponse = processBatchPegSales(payload as PegSaleRequest[]);
        self.postMessage({ type: 'BATCH_PEG_SALES_RESULT', payload: batchResponse });
        break;

      case 'CALCULATE_PEGS':
        const { volumeMl } = payload as { volumeMl: number };
        const pegs = calculateRemainingPegs(volumeMl);
        self.postMessage({ type: 'CALCULATE_PEGS_RESULT', payload: { pegs } });
        break;

      default:
        self.postMessage({ type: 'ERROR', payload: { error: 'Unknown message type' } });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
};

// Export for TypeScript
export {};

