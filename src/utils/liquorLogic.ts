/**
 * Liquor Inventory Logic Utilities
 * Handles stock conversions, peg calculations, and price integration
 */

export type BottleSize = 1000 | 750 | 500 | 375 | 650;
export type ProductCategory = 'spirits' | 'beer' | 'wine';

export interface LiquorConfig {
  size: BottleSize;
  bottlesPerCase: number;
  pegsPerBottle: number;
  mlPerBottle: number;
  category: ProductCategory;
}

export interface StockState {
  totalMl: number;
  fullCases: number;
  looseBottles: number;
  loosePegs: number; // Remaining pegs from partial bottles
  totalBottles: number;
  totalPegs: number;
}

export interface PriceData {
  productName: string;
  size: BottleSize;
  category: ProductCategory;
  purchaseCostPerCase: number;
  sellingPricePerPeg?: number;
}

export interface ProductInventory {
  productName: string;
  config: LiquorConfig;
  openingStock: StockState;
  purchases: StockState;
  sales: number; // in pegs
  priceData: PriceData;
  currentStock: StockState;
  wastage: number; // in ml - for breakage/leakage adjustments
  remainingVolumeInCurrentBottle: number; // ml remaining in the currently open bottle (0 to mlPerBottle)
}

// Liquor configuration mapping
export const LIQUOR_CONFIGS: Record<BottleSize, LiquorConfig> = {
  1000: {
    size: 1000,
    bottlesPerCase: 9,
    pegsPerBottle: 16.6,
    mlPerBottle: 1000,
    category: 'spirits',
  },
  750: {
    size: 750,
    bottlesPerCase: 12,
    pegsPerBottle: 12.5,
    mlPerBottle: 750,
    category: 'spirits',
  },
  500: {
    size: 500,
    bottlesPerCase: 18,
    pegsPerBottle: 8.3,
    mlPerBottle: 500,
    category: 'spirits',
  },
  375: {
    size: 375,
    bottlesPerCase: 24,
    pegsPerBottle: 6.25,
    mlPerBottle: 375,
    category: 'spirits',
  },
  650: {
    size: 650,
    bottlesPerCase: 12,
    pegsPerBottle: 10.83, // 650ml / 60ml = 10.83 pegs
    mlPerBottle: 650,
    category: 'beer',
  },
};

// Beer can configuration (500ml cans, not bottles)
export const BEER_CAN_CONFIG: LiquorConfig = {
  size: 500,
  bottlesPerCase: 24,
  pegsPerBottle: 8.3,
  mlPerBottle: 500,
  category: 'beer',
};

/**
 * Standard peg size in milliliters
 * 1 peg = 60ml (industry standard in India)
 * Used in all peg calculations and sales tracking
 */
export const PEG_SIZE_ML = 60;

/**
 * Peg Master Function - Conversion constants by bottle size
 * 
 * Mathematical conversion: 
 * $$\text{Pegs per Bottle} = \frac{\text{Bottle Size (ml)}}{60\text{ml}}$$
 * 
 * Standard conversions:
 * - 1000ml = 16.6 pegs (1000 ÷ 60 = 16.666...)
 * - 750ml = 12.5 pegs (750 ÷ 60 = 12.5)
 * - 500ml = 8.3 pegs (500 ÷ 60 = 8.333...)
 * - 375ml = 6.25 pegs (375 ÷ 60 = 6.25)
 * - 650ml = 10.83 pegs (650 ÷ 60 = 10.833...)
 */
export const PEG_CONVERSION_FACTORS: Record<BottleSize, number> = {
  1000: 16.6,
  750: 12.5,
  500: 8.3,
  375: 6.25,
  650: 10.83,
};

/**
 * Get configuration for a given bottle size
 */
export function getLiquorConfig(size: BottleSize, isBeerCan: boolean = false): LiquorConfig {
  if (isBeerCan && size === 500) {
    return BEER_CAN_CONFIG;
  }
  return LIQUOR_CONFIGS[size];
}

/**
 * Convert cases to total milliliters
 */
export function casesToMl(cases: number, config: LiquorConfig): number {
  return cases * config.bottlesPerCase * config.mlPerBottle;
}

/**
 * Convert bottles to milliliters
 */
export function bottlesToMl(bottles: number, config: LiquorConfig): number {
  return bottles * config.mlPerBottle;
}

/**
 * Convert pegs to milliliters
 */
export function pegsToMl(pegs: number): number {
  return pegs * PEG_SIZE_ML;
}

/**
 * Convert milliliters to cases, bottles, and pegs
 */
export function mlToStockState(totalMl: number, config: LiquorConfig): StockState {
  const mlPerCase = config.bottlesPerCase * config.mlPerBottle;
  const mlPerBottle = config.mlPerBottle;

  // Calculate full cases
  const fullCases = Math.floor(totalMl / mlPerCase);
  let remainingMl = totalMl % mlPerCase;

  // Calculate loose bottles
  const looseBottles = Math.floor(remainingMl / mlPerBottle);
  remainingMl = remainingMl % mlPerBottle;

  // Calculate loose pegs (remaining ml converted to pegs)
  // Calculate remaining pegs using Peg Master formula
  // $$\text{Remaining Pegs} = \left\lfloor \frac{\text{Remaining Volume (ml)}}{60} \right\rfloor$$
  const loosePegs = Math.round((remainingMl / PEG_SIZE_ML) * 10) / 10; // Round to 1 decimal

  // Calculate totals
  const totalBottles = fullCases * config.bottlesPerCase + looseBottles;
  const totalPegs = totalBottles * config.pegsPerBottle + loosePegs;

  return {
    totalMl,
    fullCases,
    looseBottles,
    loosePegs,
    totalBottles,
    totalPegs: Math.round(totalPegs * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Convert cases and bottles to stock state
 */
export function casesAndBottlesToStockState(
  cases: number,
  bottles: number,
  config: LiquorConfig
): StockState {
  const casesMl = casesToMl(cases, config);
  const bottlesMl = bottlesToMl(bottles, config);
  const totalMl = casesMl + bottlesMl;
  return mlToStockState(totalMl, config);
}

/**
 * Add two stock states together
 */
export function addStockStates(state1: StockState, state2: StockState): StockState {
  const totalMl = state1.totalMl + state2.totalMl;
  // Note: We need config to properly recalculate, so we'll use totalMl
  // The caller should provide config if needed
  return {
    totalMl,
    fullCases: 0, // Will be recalculated with config
    looseBottles: 0,
    loosePegs: 0,
    totalBottles: 0,
    totalPegs: state1.totalPegs + state2.totalPegs,
  };
}

/**
 * Subtract sales (in pegs) from stock state
 */
export function subtractSalesFromStock(
  stockState: StockState,
  salesPegs: number,
  config: LiquorConfig
): StockState {
  const salesMl = pegsToMl(salesPegs);
  const remainingMl = Math.max(0, stockState.totalMl - salesMl);
  return mlToStockState(remainingMl, config);
}

/**
 * Calculate unit cost per bottle from case cost
 */
export function calculateBottleCost(caseCost: number, config: LiquorConfig): number {
  return Math.round((caseCost / config.bottlesPerCase) * 100) / 100;
}

/**
 * Calculate unit cost per peg from case cost
 */
export function calculatePegCost(caseCost: number, config: LiquorConfig): number {
  const bottleCost = calculateBottleCost(caseCost, config);
  return Math.round((bottleCost / config.pegsPerBottle) * 100) / 100;
}

/**
 * Calculate total inventory value
 */
export function calculateInventoryValue(
  stockState: StockState,
  priceData: PriceData,
  config: LiquorConfig
): number {
  const bottleCost = calculateBottleCost(priceData.purchaseCostPerCase, config);
  const pegCost = calculatePegCost(priceData.purchaseCostPerCase, config);
  
  // Value of full bottles
  const bottleValue = stockState.totalBottles * bottleCost;
  
  // Value of loose pegs
  const pegValue = stockState.loosePegs * pegCost;
  
  return Math.round((bottleValue + pegValue) * 100) / 100;
}

/**
 * Calculate remaining stock after sales
 */
export function calculateRemainingStock(
  openingStockMl: number,
  purchasesMl: number,
  salesPegs: number,
  config: LiquorConfig
): StockState {
  const totalStockMl = openingStockMl + purchasesMl;
  const salesMl = pegsToMl(salesPegs);
  const remainingMl = Math.max(0, totalStockMl - salesMl);
  return mlToStockState(remainingMl, config);
}

/**
 * Calculate profit margin for a sale
 */
export function calculateProfitMargin(
  sellingPricePerPeg: number,
  costPerPeg: number
): number {
  if (costPerPeg === 0) return 0;
  const profit = sellingPricePerPeg - costPerPeg;
  return Math.round((profit / costPerPeg) * 100 * 10) / 10; // Percentage rounded to 1 decimal
}

/**
 * Create a product inventory from initial data
 */
export function createProductInventory(
  productName: string,
  size: BottleSize,
  openingCases: number,
  openingBottles: number,
  purchaseCostPerCase: number,
  isBeerCan: boolean = false
): ProductInventory {
  const config = getLiquorConfig(size, isBeerCan);
  const openingStock = casesAndBottlesToStockState(openingCases, openingBottles, config);

  const priceData: PriceData = {
    productName,
    size,
    category: config.category,
    purchaseCostPerCase,
  };

  return {
    productName,
    config,
    openingStock,
    purchases: {
      totalMl: 0,
      fullCases: 0,
      looseBottles: 0,
      loosePegs: 0,
      totalBottles: 0,
      totalPegs: 0,
    },
    sales: 0,
    priceData,
    currentStock: { ...openingStock },
    wastage: 0, // Initialize wastage to 0
    remainingVolumeInCurrentBottle: 0, // Start with no partial bottle (will be set on first sale)
  };
}

/**
 * Add purchase to inventory
 */
export function addPurchase(
  inventory: ProductInventory,
  cases: number,
  bottles: number = 0
): ProductInventory {
  const purchaseStock = casesAndBottlesToStockState(cases, bottles, inventory.config);
  const updatedPurchasesMl = inventory.purchases.totalMl + purchaseStock.totalMl;
  
  // Recalculate current stock including new purchases
  const totalAvailableMl = inventory.openingStock.totalMl + updatedPurchasesMl - inventory.wastage;
  const salesMl = inventory.sales * 60; // 60ml per peg
  const remainingMl = Math.max(0, totalAvailableMl - salesMl);
  
  const currentStock = mlToStockState(remainingMl, inventory.config);

  return {
    ...inventory,
    purchases: mlToStockState(updatedPurchasesMl, inventory.config),
    currentStock,
    // Note: remainingVolumeInCurrentBottle is maintained across purchases
  };
}

/**
 * Adjust wastage/breakage
 * Deducts ml from current stock to account for broken/leaked bottles
 */
export function adjustWastage(
  inventory: ProductInventory,
  wastageMl: number
): ProductInventory {
  const totalWastage = inventory.wastage + wastageMl;
  
  // Recalculate current stock with new wastage
  const totalAvailableMl = inventory.openingStock.totalMl + inventory.purchases.totalMl - totalWastage;
  const salesMl = inventory.sales * 60; // 60ml per peg
  const remainingMl = Math.max(0, totalAvailableMl - salesMl);
  
  const currentStock = mlToStockState(remainingMl, inventory.config);
  
  // Adjust remaining volume in current bottle if wastage affects it
  let remainingVolumeInBottle = inventory.remainingVolumeInCurrentBottle;
  if (wastageMl > 0 && remainingVolumeInBottle > 0) {
    remainingVolumeInBottle = Math.max(0, remainingVolumeInBottle - Math.min(wastageMl, remainingVolumeInBottle));
    // If bottle was fully wasted, deduct a bottle
    if (remainingVolumeInBottle === 0 && currentStock.totalBottles > 0) {
      const updatedBottles = Math.max(0, currentStock.totalBottles - 1);
      currentStock.totalBottles = updatedBottles;
      currentStock.totalMl = Math.max(0, currentStock.totalMl - inventory.config.mlPerBottle);
    }
  }

  return {
    ...inventory,
    wastage: totalWastage,
    currentStock,
    remainingVolumeInCurrentBottle: remainingVolumeInBottle,
  };
}

/**
 * Peg Master Function - Calculate remaining pegs from current volume
 * 
 * Mathematical formula:
 * $$\text{Remaining Pegs} = \left\lfloor \frac{\text{Current Volume (ml)}}{60} \right\rfloor$$
 * 
 * Where:
 * - Current Volume (ml) = remainingVolumeInBottle
 * - 60 = PEG_SIZE_ML (standard peg size)
 * - Floor function ensures we get whole pegs only
 */
export function calculateRemainingPegs(currentVolumeMl: number): number {
  return Math.floor(currentVolumeMl / PEG_SIZE_ML);
}

/**
 * Sale Trigger - Process a 60ml peg sale with automated bottle roll-over
 * 
 * Algorithm:
 * 1. Sale Trigger: Deduct 60ml (1 peg) from current bottle volume
 *    - $$\text{New Volume} = \text{Current Volume} - 60\text{ml}$$
 * 
 * 2. Bottle Roll-over: When volume ≤ 0ml
 *    - $$\text{Full Bottle Count} = \text{Full Bottle Count} - 1$$
 *    - $$\text{Volume} = \text{Bottle Capacity (ml)}$$ (refill to original)
 * 
 * 3. Remaining Pegs Calculation:
 *    $$\text{Remaining Pegs} = \left\lfloor \frac{\text{Current Volume (ml)}}{60} \right\rfloor$$
 */
export function triggerPegSale(
  inventory: ProductInventory
): { inventory: ProductInventory; saleProcessed: boolean } {
  const currentVolume = inventory.remainingVolumeInCurrentBottle;
  const bottleCapacity = inventory.config.mlPerBottle;
  const currentBottles = inventory.currentStock.totalBottles;

  // Check if we have stock
  if (currentBottles === 0 && currentVolume === 0) {
    return { inventory, saleProcessed: false };
  }

  // Initialize current bottle volume if needed
  let newVolume = currentVolume;
  let newBottles = currentBottles;

  // If no partial bottle exists (volume = 0), open a new bottle from full bottle count
  if (newVolume === 0 && newBottles > 0) {
    newBottles -= 1; // Deduct 1 from Full Bottle Count to open a new bottle
    newVolume = bottleCapacity; // Set volume to original capacity
  }

  // Sale Trigger: Deduct 60ml (1 peg) from current bottle volume
  // $$\text{New Volume} = \text{Current Volume} - 60\text{ml}$$
  newVolume -= PEG_SIZE_ML;

  // Automated Bottle Roll-over: When volume ≤ 0ml
  // $$\text{If } \text{Volume}_{\text{new}} \leq 0 \text{ and } \text{Bottles} > 0:$$
  //   - $$\text{Bottles}_{\text{new}} = \text{Bottles}_{\text{current}} - 1$$
  //   - $$\text{Volume}_{\text{new}} = \text{Bottle Capacity (ml)}$$ (refill to original)
  if (newVolume <= 0 && newBottles > 0) {
    newBottles -= 1; // Deduct 1 from Full Bottle Count
    newVolume = bottleCapacity; // Refill volume variable to original capacity
  }

  // Ensure volume doesn't go negative (should not happen, but safety check)
  newVolume = Math.max(0, newVolume);
  
  // If no bottles remain, volume must be 0
  if (newBottles === 0) {
    newVolume = 0;
  }

  // Recalculate total ML and stock state
  const totalMlFromBottles = newBottles * bottleCapacity;
  const totalRemainingMl = totalMlFromBottles + newVolume;

  const mlPerCase = inventory.config.bottlesPerCase * bottleCapacity;
  const fullCases = Math.floor(totalRemainingMl / mlPerCase);
  const remainingAfterCases = totalRemainingMl % mlPerCase;
  const looseBottles = Math.floor(remainingAfterCases / bottleCapacity);
  
  // Calculate remaining pegs using Peg Master formula
  // $$\text{Remaining Pegs} = \left\lfloor \frac{\text{Current Volume (ml)}}{60} \right\rfloor$$
  const remainingPegs = calculateRemainingPegs(newVolume);
  const totalPegs = calculateRemainingPegs(totalRemainingMl);

  const updatedStock: StockState = {
    totalMl: totalRemainingMl,
    fullCases,
    looseBottles,
    loosePegs: remainingPegs,
    totalBottles: newBottles,
    totalPegs,
  };

  const updatedInventory: ProductInventory = {
    ...inventory,
    sales: inventory.sales + 1, // Increment by 1 peg
    currentStock: updatedStock,
    remainingVolumeInCurrentBottle: newVolume,
  };

  return { inventory: updatedInventory, saleProcessed: true };
}

/**
 * Record sales with 60ml Peg Rule and automated bottle roll-over
 * 
 * This function processes multiple peg sales, calling the Sale Trigger for each peg.
 * 
 * Mathematical Process:
 * For each peg sale (60ml):
 * 1. $$\text{Volume}_{\text{new}} = \text{Volume}_{\text{current}} - 60\text{ml}$$
 * 2. If $$\text{Volume}_{\text{new}} \leq 0$$:
 *    - $$\text{Bottles}_{\text{new}} = \text{Bottles}_{\text{current}} - 1$$
 *    - $$\text{Volume}_{\text{new}} = \text{Bottle Capacity}$$
 * 3. $$\text{Remaining Pegs} = \left\lfloor \frac{\text{Volume}_{\text{current}}}{60} \right\rfloor$$
 */
export function recordSales(
  inventory: ProductInventory,
  salesPegs: number
): ProductInventory {
  // Process each peg sale individually to ensure proper bottle roll-over
  let currentInventory = inventory;
  
  for (let i = 0; i < salesPegs; i++) {
    const result = triggerPegSale(currentInventory);
    if (!result.saleProcessed) {
      // Stop if we can't process more sales (out of stock)
      break;
    }
    currentInventory = result.inventory;
  }

  return currentInventory;
}

/**
 * Get stock summary as formatted string
 * @param stockState - Current stock state
 * @param config - Liquor configuration (currently unused, kept for API consistency)
 */
export function getStockSummary(stockState: StockState, config: LiquorConfig): string {
  // config parameter is kept for API consistency and potential future use
  void config; // Suppress unused parameter warning
  const parts: string[] = [];
  
  if (stockState.fullCases > 0) {
    parts.push(`${stockState.fullCases} case${stockState.fullCases > 1 ? 's' : ''}`);
  }
  
  if (stockState.looseBottles > 0) {
    parts.push(`${stockState.looseBottles} bottle${stockState.looseBottles > 1 ? 's' : ''}`);
  }
  
  if (stockState.loosePegs > 0) {
    parts.push(`${stockState.loosePegs.toFixed(1)} pegs`);
  }
  
  if (parts.length === 0) {
    return 'Out of stock';
  }
  
  return parts.join(' + ');
}

/**
 * Validate stock state has sufficient stock for sale
 */
export function hasSufficientStock(
  stockState: StockState,
  requiredPegs: number
): boolean {
  return stockState.totalPegs >= requiredPegs;
}

/**
 * Calculate low stock threshold (e.g., 10% of average case)
 */
export function isLowStock(stockState: StockState, config: LiquorConfig): boolean {
  const thresholdPegs = config.bottlesPerCase * config.pegsPerBottle * 0.1; // 10% of a case
  return stockState.totalPegs < thresholdPegs && stockState.totalPegs > 0;
}

