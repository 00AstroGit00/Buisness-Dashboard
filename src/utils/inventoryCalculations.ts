/**
 * Inventory Calculation Utilities
 * Implements case-to-bottle conversion and peg-level tracking
 */

export interface BottleSize {
  ml: number;
  bottlesPerCase: number;
}

export interface ProductInfo {
  size: number; // in ml
  bottlesPerCase: number;
  pegsPerBottle: number;
}

// Standard bottle sizes and their case configurations
export const BOTTLE_SIZES: Record<number, BottleSize> = {
  1000: { ml: 1000, bottlesPerCase: 9 },
  750: { ml: 750, bottlesPerCase: 12 },
  500: { ml: 500, bottlesPerCase: 18 },
  375: { ml: 375, bottlesPerCase: 24 },
  650: { ml: 650, bottlesPerCase: 12 }, // Beer
};

// Beer can sizes
export const BEER_SIZES: Record<number, BottleSize> = {
  500: { ml: 500, bottlesPerCase: 24 }, // Cans
};

// Standard peg size (60ml)
export const PEG_SIZE_ML = 60;

/**
 * Calculate bottles per case based on bottle size
 */
export function getBottlesPerCase(bottleSizeMl: number, isBeerCan: boolean = false): number {
  if (isBeerCan && bottleSizeMl === 500) {
    return BEER_SIZES[500].bottlesPerCase;
  }
  return BOTTLE_SIZES[bottleSizeMl]?.bottlesPerCase || 12; // Default to 12
}

/**
 * Convert cases to bottles
 */
export function casesToBottles(cases: number, bottleSizeMl: number, isBeerCan: boolean = false): number {
  const bottlesPerCase = getBottlesPerCase(bottleSizeMl, isBeerCan);
  return cases * bottlesPerCase;
}

/**
 * Convert bottles to cases
 */
export function bottlesToCases(bottles: number, bottleSizeMl: number, isBeerCan: boolean = false): number {
  const bottlesPerCase = getBottlesPerCase(bottleSizeMl, isBeerCan);
  return Math.floor((bottles / bottlesPerCase) * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate pegs per bottle
 */
export function calculatePegsPerBottle(bottleSizeMl: number): number {
  return Math.round((bottleSizeMl / PEG_SIZE_ML) * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total pegs from bottles
 */
export function calculateTotalPegs(bottles: number, bottleSizeMl: number): number {
  const pegsPerBottle = calculatePegsPerBottle(bottleSizeMl);
  return Math.round(bottles * pegsPerBottle * 10) / 10;
}

/**
 * Calculate total pegs from cases
 */
export function calculatePegsFromCases(cases: number, bottleSizeMl: number, isBeerCan: boolean = false): number {
  const bottles = casesToBottles(cases, bottleSizeMl, isBeerCan);
  return calculateTotalPegs(bottles, bottleSizeMl);
}

/**
 * Calculate remaining stock after sales
 */
export function calculateRemainingStock(
  openingStock: number, // in bottles
  purchases: number, // in bottles
  sales: number, // in pegs or ml
  bottleSizeMl: number,
  salesInPegs: boolean = true
): number {
  const purchasesInBottles = purchases;
  const totalAvailable = openingStock + purchasesInBottles;

  if (salesInPegs) {
    const pegsPerBottle = calculatePegsPerBottle(bottleSizeMl);
    const bottlesSold = Math.round((sales / pegsPerBottle) * 10) / 10;
    return Math.max(0, totalAvailable - bottlesSold);
  } else {
    // Sales in ml
    const bottlesSold = sales / bottleSizeMl;
    return Math.max(0, totalAvailable - bottlesSold);
  }
}

/**
 * Calculate unit cost per bottle from case cost
 */
export function calculateUnitCost(caseCost: number, bottleSizeMl: number, isBeerCan: boolean = false): number {
  const bottlesPerCase = getBottlesPerCase(bottleSizeMl, isBeerCan);
  return Math.round((caseCost / bottlesPerCase) * 100) / 100;
}

/**
 * Get product info for a given bottle size
 */
export function getProductInfo(bottleSizeMl: number, isBeerCan: boolean = false): ProductInfo {
  return {
    size: bottleSizeMl,
    bottlesPerCase: getBottlesPerCase(bottleSizeMl, isBeerCan),
    pegsPerBottle: calculatePegsPerBottle(bottleSizeMl),
  };
}

