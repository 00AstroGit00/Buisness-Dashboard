/**
 * GST Calculator Utilities
 * Calculates taxes based on item categories as per GST certificate
 */

export type ItemCategory = 'food' | 'beverages' | 'liquor' | 'room' | 'other';

export interface TaxBreakdown {
  cgstRate: number; // Central GST rate
  sgstRate: number; // State GST rate
  igstRate: number; // Integrated GST (for inter-state)
  exciseRate?: number; // Excise duty for liquor
  totalTaxRate: number; // Combined tax rate
}

export interface TaxCalculation {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  excise?: number;
  totalTax: number;
  total: number;
  breakdown: TaxBreakdown;
}

/**
 * Get GST rates based on item category
 * Based on Indian GST rules:
 * - Food & Beverages: 5% (2.5% CGST + 2.5% SGST)
 * - Liquor: Excise + GST (varies by state)
 * - Room Rent: 5% (2.5% CGST + 2.5% SGST)
 */
export function getTaxRates(category: ItemCategory, isInterState: boolean = false): TaxBreakdown {
  switch (category) {
    case 'food':
    case 'beverages':
    case 'room':
      if (isInterState) {
        return {
          cgstRate: 0,
          sgstRate: 0,
          igstRate: 5,
          totalTaxRate: 5,
        };
      }
      return {
        cgstRate: 2.5,
        sgstRate: 2.5,
        igstRate: 0,
        totalTaxRate: 5,
      };

    case 'liquor':
      // Liquor: Excise duty + GST (varies by state)
      // Kerala: Typically 25% excise + 18% GST
      if (isInterState) {
        return {
          cgstRate: 0,
          sgstRate: 0,
          igstRate: 18,
          exciseRate: 25,
          totalTaxRate: 43, // 25% excise + 18% GST
        };
      }
      return {
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        exciseRate: 25,
        totalTaxRate: 43, // 25% excise + 9% CGST + 9% SGST
      };

    case 'other':
    default:
      if (isInterState) {
        return {
          cgstRate: 0,
          sgstRate: 0,
          igstRate: 18,
          totalTaxRate: 18,
        };
      }
      return {
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        totalTaxRate: 18,
      };
  }
}

/**
 * Calculate tax for a single item
 */
export function calculateTax(
  amount: number,
  category: ItemCategory,
  isInterState: boolean = false
): TaxCalculation {
  const breakdown = getTaxRates(category, isInterState);

  let subtotal = amount;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let excise = 0;

  // For liquor, excise is calculated on base price
  if (category === 'liquor' && breakdown.exciseRate) {
    excise = (subtotal * breakdown.exciseRate) / 100;
    // GST is calculated on (subtotal + excise)
    const amountAfterExcise = subtotal + excise;
    
    if (breakdown.igstRate > 0) {
      igst = (amountAfterExcise * breakdown.igstRate) / 100;
    } else {
      cgst = (amountAfterExcise * breakdown.cgstRate) / 100;
      sgst = (amountAfterExcise * breakdown.sgstRate) / 100;
    }
  } else {
    // For other items, GST is calculated on subtotal
    if (breakdown.igstRate > 0) {
      igst = (subtotal * breakdown.igstRate) / 100;
    } else {
      cgst = (subtotal * breakdown.cgstRate) / 100;
      sgst = (subtotal * breakdown.sgstRate) / 100;
    }
  }

  const totalTax = cgst + sgst + igst + excise;
  const total = subtotal + totalTax;

  return {
    subtotal,
    cgst,
    sgst,
    igst,
    excise: category === 'liquor' ? excise : undefined,
    totalTax,
    total,
    breakdown,
  };
}

/**
 * Calculate tax for multiple items grouped by category
 */
export function calculateBillTax(
  items: Array<{ amount: number; category: ItemCategory }>,
  isInterState: boolean = false
): TaxCalculation {
  // Group by category for accurate tax calculation
  const categoryGroups: Record<ItemCategory, number> = {
    food: 0,
    beverages: 0,
    liquor: 0,
    room: 0,
    other: 0,
  };

  items.forEach((item) => {
    categoryGroups[item.category] += item.amount;
  });

  let totalSubtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  let totalExcise = 0;

  // Calculate tax for each category
  Object.entries(categoryGroups).forEach(([category, amount]) => {
    if (amount > 0) {
      const taxCalc = calculateTax(amount, category as ItemCategory, isInterState);
      totalSubtotal += taxCalc.subtotal;
      totalCgst += taxCalc.cgst;
      totalSgst += taxCalc.sgst;
      totalIgst += taxCalc.igst;
      if (taxCalc.excise) {
        totalExcise += taxCalc.excise;
      }
    }
  });

  const totalTax = totalCgst + totalSgst + totalIgst + totalExcise;
  const total = totalSubtotal + totalTax;

  return {
    subtotal: totalSubtotal,
    cgst: totalCgst,
    sgst: totalSgst,
    igst: totalIgst,
    excise: totalExcise > 0 ? totalExcise : undefined,
    totalTax,
    total,
    breakdown: {
      cgstRate: totalSubtotal > 0 ? (totalCgst / totalSubtotal) * 100 : 0,
      sgstRate: totalSubtotal > 0 ? (totalSgst / totalSubtotal) * 100 : 0,
      igstRate: totalSubtotal > 0 ? (totalIgst / totalSubtotal) * 100 : 0,
      exciseRate: totalSubtotal > 0 ? (totalExcise / totalSubtotal) * 100 : undefined,
      totalTaxRate: totalSubtotal > 0 ? (totalTax / totalSubtotal) * 100 : 0,
    },
  };
}

