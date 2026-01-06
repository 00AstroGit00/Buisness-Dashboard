/**
 * Liquor Calculation Utilities
 * Handles precise peg factors, case-to-bottle conversions, and stock tracking.
 */

export type BottleVolume = '1000ml' | '750ml' | '500ml' | '375ml';

/**
 * Returns the number of standard 60ml pegs contained in a single bottle.
 * 
 * Rules:
 * - 1000ml = 16.66 pegs
 * - 750ml = 12.5 pegs
 * - 500ml = 8.33 pegs
 * - 375ml = 6.25 pegs
 */
export function getPegFactor(volume: string): number {
  const cleanVol = volume.toLowerCase().replace(/\s/g, '');
  
  switch (cleanVol) {
    case '1000ml': return 16.66;
    case '750ml':  return 12.5;
    case '500ml':  return 8.33;
    case '375ml':  return 6.25;
    default: return 0;
  }
}

/**
 * Returns the number of bottles per case for a given volume.
 * 
 * Rules:
 * - 1000ml = 9/case
 * - 750ml = 12/case
 * - 500ml = 18/case
 * - 375ml = 24/case
 */
export function getBottlesPerCase(volume: string): number {
  const cleanVol = volume.toLowerCase().replace(/\s/g, '');
  
  switch (cleanVol) {
    case '1000ml': return 9;
    case '750ml':  return 12;
    case '500ml':  return 18;
    case '375ml':  return 24;
    default: return 12; // Standard fallback
  }
}

interface ClosingStockResult {
  fullBottles: number;
  loosePegs: number;
  totalPegs: number;
}

/**
 * Calculates remaining inventory based on opening stock and sales.
 * 
 * @param openingBottles - Total full bottles at start of shift
 * @param purchasesBottles - Any new bottles added during shift
 * @param salesPegs - Total 60ml pegs recorded as sold
 * @param volume - Bottle size string
 */
export function calculateClosingStock(
  openingBottles: number,
  purchasesBottles: number,
  salesPegs: number,
  volume: string
): ClosingStockResult {
  const pegFactor = getPegFactor(volume);
  if (pegFactor === 0) return { fullBottles: 0, loosePegs: 0, totalPegs: 0 };

  // 1. Calculate total pegs available
  const totalAvailablePegs = (openingBottles + purchasesBottles) * pegFactor;
  
  // 2. Subtract sales
  const remainingTotalPegs = Math.max(0, totalAvailablePegs - salesPegs);
  
  // 3. Convert back to Bottles and Loose Pegs
  const fullBottles = Math.floor(remainingTotalPegs / pegFactor);
  const loosePegs = Number((remainingTotalPegs % pegFactor).toFixed(2));

  return {
    fullBottles,
    loosePegs,
    totalPegs: Number(remainingTotalPegs.toFixed(2))
  };
}