/**
 * Liquor Calculation Utilities
 * Handles precise peg factors and stock valuation for bar accounting.
 */

/**
 * Returns the number of standard 60ml pegs contained in a bottle of a given volume.
 * 
 * @param volume - The bottle volume string (e.g., '1000ml', '750ml')
 * @returns The peg conversion factor (units of 60ml)
 */
export function getPegFactor(volume: string): number {
  const cleanVolume = volume.toLowerCase().replace(/\s/g, '');
  
  switch (cleanVolume) {
    case '1000ml':
    case '1000':
      return 16.66;
    case '750ml':
    case '750':
      return 12.5;
    case '500ml':
    case '500':
      return 8.33;
    case '375ml':
    case '375':
      return 6.25;
    default:
      // Fallback: dynamic calculation if size is unknown
      const ml = parseInt(cleanVolume);
      return !isNaN(ml) ? Number((ml / 60).toFixed(2)) : 0;
  }
}

/**
 * Calculates the total value of remaining stock.
 * 
 * Documentation of Formula (LaTeX):
 * $$Closing\ Stock\ Value = (Full\ Bottles \times Unit\ Price) + (Remaining\ ML \times ML\ Price)$$
 * 
 * @param closingStock - Total stock remaining (in bottle units, e.g., 5.5 for 5 bottles and a half)
 * @param purchasePrice - The purchase cost of a full case (from PRODUCT PRICE sheet)
 * @param caseConfig - The number of bottles per case (e.g., 12 for 750ml)
 * @param bottleSizeMl - The volume of a single bottle in ML (defaults to 750)
 * @returns Total calculated value in currency units
 */
export function calculateStockValue(
  closingStock: number, 
  purchasePrice: number, 
  caseConfig: number,
  bottleSizeMl: number = 750
): number {
  if (caseConfig <= 0) return 0;

  // Unit Price = Purchase Price / Bottles per case
  const unitPrice = purchasePrice / caseConfig;
  
  // ML Price = Unit Price / ML per bottle
  const mlPrice = unitPrice / bottleSizeMl;

  const fullBottles = Math.floor(closingStock);
  const partialBottleStock = closingStock - fullBottles;
  const remainingMl = partialBottleStock * bottleSizeMl;

  const value = (fullBottles * unitPrice) + (remainingMl * mlPrice);
  
  return Number(value.toFixed(2));
}
