import React, { memo } from 'react';
import { Zap, Plus, Minus, AlertTriangle } from 'lucide-react';
import type { ProductInventory } from '../utils/liquorLogic';
import { formatNumber } from '../utils/formatCurrency';

interface InventoryCardProps {
  item: ProductInventory;
  onSellPeg: (productId: string) => void;
  // Note: Add logic for full bottle return in store if needed, 
  // for now, we'll keep it focused on the requested UI buttons.
}

const InventoryCard = memo(({ item, onSellPeg }: InventoryCardProps) => {
  const isLowStock = item.currentStock.totalPegs < 5;
  const openingStockStr = `${item.openingStock.totalBottles} btl`;
  const liveStockStr = `${item.currentStock.totalBottles} btl + ${item.currentStock.loosePegs.toFixed(1)} peg`;

  return (
    <div 
      className={`
        relative bg-white rounded-2xl overflow-hidden transition-all duration-300
        border-2 ${isLowStock ? 'border-brushed-gold bg-gold-pulse' : 'border-forest-green/10 shadow-md'}
        hover:shadow-lg hover:border-forest-green/30 flex flex-col
      `}
    >
      <div className="p-5 flex-1">
        {/* Header: Brand & Volume */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-black text-forest-green leading-tight truncate pr-2" title={item.productName}>
              {item.productName.split(' ').slice(0, -1).join(' ')}
            </h3>
            {isLowStock && (
              <span className="flex-shrink-0 animate-pulse text-orange-600">
                <AlertTriangle size={18} />
              </span>
            )}
          </div>
          <span className="inline-block px-2 py-0.5 bg-forest-green text-brushed-gold text-[10px] font-black rounded uppercase tracking-tighter">
            {item.config.size}ml
          </span>
        </div>

        {/* Real-time Math Display */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
            <p className="text-[9px] text-forest-green/50 uppercase font-black tracking-widest">Opening</p>
            <p className="text-sm font-bold text-forest-green">{openingStockStr}</p>
          </div>
          <div className={`p-2 rounded-lg border ${isLowStock ? 'bg-orange-50 border-orange-100' : 'bg-forest-green/5 border-forest-green/10'}`}>
            <p className={`text-[9px] uppercase font-black tracking-widest ${isLowStock ? 'text-orange-700' : 'text-forest-green/50'}`}>Live Closing</p>
            <p className={`text-sm font-black ${isLowStock ? 'text-orange-700' : 'text-forest-green'}`}>{liveStockStr}</p>
          </div>
        </div>

        {/* Action Grid: Professional Bar Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {/* Logic for empty bottle return could go here */}}
            className="flex flex-col items-center justify-center py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors active:scale-95"
            title="Return Empty Bottle"
          >
            <Minus size={20} />
            <span className="text-[9px] font-black uppercase mt-1">Empty</span>
          </button>
          
          <button
            onClick={() => onSellPeg(item.productName)}
            disabled={item.currentStock.totalPegs < 1}
            className={`
              flex flex-col items-center justify-center py-3 rounded-xl shadow-lg transition-all active:scale-95
              ${item.currentStock.totalPegs < 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-forest-green text-brushed-gold hover:bg-forest-green-light'
              }
            `}
          >
            <Plus size={20} />
            <span className="text-[9px] font-black uppercase mt-1">Sell 1 Peg</span>
          </button>
        </div>
      </div>

      <style>{`
        .bg-gold-pulse {
          animation: pulse-gold 2s infinite;
        }
        @keyframes pulse-gold {
          0% { background-color: white; }
          50% { background-color: rgba(197, 160, 89, 0.05); }
          100% { background-color: white; }
        }
      `}</style>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.currentStock.totalPegs === nextProps.item.currentStock.totalPegs &&
    prevProps.item.currentStock.totalBottles === nextProps.item.currentStock.totalBottles &&
    prevProps.item.productName === nextProps.item.productName
  );
});

export default InventoryCard;