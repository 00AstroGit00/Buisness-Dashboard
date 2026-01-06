import React, { memo } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import type { ProductInventory } from '../utils/liquorLogic';
import { formatNumber } from '../utils/formatCurrency';

interface InventoryRowProps {
  item: ProductInventory;
  onSellPeg: (productId: string) => void;
}

const InventoryRow = memo(({ item, onSellPeg }: InventoryRowProps) => {
  // Low Stock Logic: Less than 3 full bottles
  const isLowStock = item.currentStock.totalBottles < 3;
  
  // Format helpers
  const formatStock = (stock: { totalBottles: number, loosePegs: number }) => {
    return (
      <div className="flex flex-col">
        <span className="font-bold text-forest-green">{stock.totalBottles} Btls</span>
        {stock.loosePegs > 0 && (
          <span className="text-xs text-forest-green/70">
            + {formatNumber(stock.loosePegs, 1)} Pegs
          </span>
        )}
      </div>
    );
  };

  // Helper to generate a consistent product ID (same as store)
  const productId = `${item.productName.replace(/\s+/g, '_')}_${item.config.size}`;

  return (
    <tr className={`border-b border-brushed-gold/20 hover:bg-forest-green/5 transition-colors ${isLowStock ? 'bg-orange-50/50' : ''}`}>
      {/* Brand */}
      <td className="p-4 align-middle">
        <div className="flex items-center gap-2">
          {isLowStock && (
            <div className="text-orange-500 animate-pulse" title="Low Stock (< 3 Bottles)">
              <AlertTriangle size={16} />
            </div>
          )}
          <div>
            <div className="font-bold text-forest-green text-base">
              {item.productName.split(' ').slice(0, -1).join(' ')}
            </div>
            {isLowStock && (
              <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full mt-1">
                LOW STOCK
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Volume */}
      <td className="p-4 align-middle">
        <span className="px-2 py-1 bg-forest-green/10 text-forest-green text-xs font-bold rounded">
          {item.config.size}ml
        </span>
      </td>

      {/* Opening Stock */}
      <td className="p-4 align-middle text-forest-green/80">
        {item.openingStock.totalBottles} Btls
      </td>

      {/* New Stock */}
      <td className="p-4 align-middle text-forest-green/80">
        {item.purchases.totalBottles > 0 ? `+${item.purchases.totalBottles}` : '-'}
      </td>

      {/* Sales (Pegs) */}
      <td className="p-4 align-middle">
        <span className="font-bold text-brushed-gold text-lg">
          {item.sales}
        </span>
      </td>

      {/* Closing Stock */}
      <td className="p-4 align-middle">
        {formatStock(item.currentStock)}
      </td>

      {/* Quick Sale */}
      <td className="p-4 align-middle text-right">
        <button
          onClick={() => onSellPeg(productId)}
          disabled={item.currentStock.totalPegs < 1}
          className={`
            px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ml-auto
            transition-all duration-200 active:scale-95 touch-manipulation shadow-md
            ${item.currentStock.totalPegs < 1 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-brushed-gold text-forest-green hover:bg-brushed-gold-light'
            }
          `}
        >
          <Zap size={18} fill={item.currentStock.totalPegs < 1 ? 'none' : 'currentColor'} />
          <span className="hidden lg:inline">Quick Sale</span>
          <span className="lg:hidden">Sale</span>
        </button>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Optimization: Only re-render if specific fields change
  return (
    prevProps.item.currentStock.totalPegs === nextProps.item.currentStock.totalPegs &&
    prevProps.item.sales === nextProps.item.sales &&
    prevProps.item.purchases.totalBottles === nextProps.item.purchases.totalBottles &&
    prevProps.item.productName === nextProps.item.productName
  );
});

export default InventoryRow;