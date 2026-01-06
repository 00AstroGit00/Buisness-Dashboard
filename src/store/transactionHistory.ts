/**
 * Transaction History Tracker
 * Tracks individual 60ml peg sales with timestamps for audit purposes
 */

export interface Transaction {
  id: string;
  productId: string; // Generated from productName + size
  timestamp: string; // ISO date string
  type: 'sale' | 'purchase' | 'wastage';
  quantity: number; // in pegs or ml
  notes?: string;
}

const TRANSACTION_STORAGE_KEY = 'deepa-transaction-history';

class TransactionHistoryManager {
  private transactions: Transaction[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(TRANSACTION_STORAGE_KEY);
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
      this.transactions = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error saving transaction history:', error);
    }
  }

  /**
   * Record a peg sale transaction
   */
  recordSale(productId: string, quantityPegs: number = 1, notes?: string): void {
    for (let i = 0; i < quantityPegs; i++) {
      const transaction: Transaction = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId,
        timestamp: new Date().toISOString(),
        type: 'sale',
        quantity: 1, // Each transaction is 1 peg (60ml)
        notes,
      };
      this.transactions.push(transaction);
    }
    this.saveToStorage();
  }

  /**
   * Record a purchase transaction
   */
  recordPurchase(productId: string, cases: number, bottles: number = 0, notes?: string): void {
    const transaction: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      timestamp: new Date().toISOString(),
      type: 'purchase',
      quantity: cases * 100 + bottles, // Encode cases and bottles
      notes: notes || `${cases} cases, ${bottles} bottles`,
    };
    this.transactions.push(transaction);
    this.saveToStorage();
  }

  /**
   * Record wastage
   */
  recordWastage(productId: string, wastageMl: number, notes?: string): void {
    const transaction: Transaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      timestamp: new Date().toISOString(),
      type: 'wastage',
      quantity: wastageMl,
      notes,
    };
    this.transactions.push(transaction);
    this.saveToStorage();
  }

  /**
   * Get all transactions for a product
   */
  getProductTransactions(productId: string): Transaction[] {
    return this.transactions
      .filter((t) => t.productId === productId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): Transaction[] {
    return [...this.transactions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Clear transaction history
   */
  clearHistory(): void {
    this.transactions = [];
    this.saveToStorage();
  }

  /**
   * Get transaction count for a product
   */
  getTransactionCount(productId: string): number {
    return this.transactions.filter((t) => t.productId === productId).length;
  }
}

// Singleton instance
export const transactionHistory = new TransactionHistoryManager();

/**
 * Generate product ID for transaction tracking
 */
export function generateProductId(productName: string, size: number): string {
  return `${productName.replace(/\s+/g, '_')}_${size}`;
}

