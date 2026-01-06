/**
 * React Hook for Liquor Calculator Web Worker
 * Provides easy interface for offloading calculations
 */

import { useRef, useCallback, useEffect } from 'react';

interface PegSaleRequest {
  id: string;
  currentStock: {
    totalMl: number;
    fullCases: number;
    looseBottles: number;
    loosePegs: number;
    totalBottles: number;
    totalPegs: number;
  };
  mlPerBottle: number;
  remainingVolumeInCurrentBottle: number;
  pegsToSell: number;
}

interface PegSaleResponse {
  id: string;
  updatedStock: {
    totalMl: number;
    fullCases: number;
    looseBottles: number;
    loosePegs: number;
    totalBottles: number;
    totalPegs: number;
  };
  remainingVolumeInCurrentBottle: number;
  bottlesDeducted: number;
}

export function useLiquorWorker() {
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/liquorCalculator.worker.ts', import.meta.url),
      { type: 'module' }
    );

    return () => {
      // Cleanup worker on unmount
      workerRef.current?.terminate();
    };
  }, []);

  /**
   * Process peg sale calculation in web worker
   */
  const processPegSale = useCallback(
    (request: PegSaleRequest): Promise<PegSaleResponse> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'PEG_SALE_RESULT') {
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(event.data.payload);
          } else if (event.data.type === 'ERROR') {
            workerRef.current?.removeEventListener('message', handleMessage);
            reject(new Error(event.data.payload.error));
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.postMessage({
          type: 'PEG_SALE',
          payload: request,
        });
      });
    },
    []
  );

  /**
   * Calculate remaining pegs from volume
   */
  const calculatePegs = useCallback((volumeMl: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'CALCULATE_PEGS_RESULT') {
          workerRef.current?.removeEventListener('message', handleMessage);
          resolve(event.data.payload.pegs);
        } else if (event.data.type === 'ERROR') {
          workerRef.current?.removeEventListener('message', handleMessage);
          reject(new Error(event.data.payload.error));
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({
        type: 'CALCULATE_PEGS',
        payload: { volumeMl },
      });
    });
  }, []);

  return {
    processPegSale,
    calculatePegs,
    isAvailable: workerRef.current !== null,
  };
}

