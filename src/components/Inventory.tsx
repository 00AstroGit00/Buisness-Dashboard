/**
 * High-Performance Inventory Component
 * Features: Virtualized Card Grid, Search, and Tactile Feedback.
 * Optimized for S23 Ultra (Touch) and HP Laptop (Performance).
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeGrid as Grid } from 'react-window';
import { 
  Search, 
  Package, 
  Zap, 
  Plus, 
  AlertTriangle, 
  Database,
  Loader2
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { type ProductInventory } from '../utils/liquorLogic';
import PrivateNumber from './PrivateNumber';

// --- Card Component ---

const InventoryCard = ({ 
  item, 
  onSale 
}: { 
  item: ProductInventory; 
  onSale: (type: 'peg' | 'bottle') => void 
}) => {
  const isLowStock = item.currentStock.totalBottles < 3;

  return (
    <motion.div 
      whileTap={{ scale: 0.95 }}
      layout
      className={`
        bg-white rounded-2xl border-2 transition-all p-4 h-[220px] flex flex-col justify-between
        ${isLowStock ? 'border-orange-400 bg-orange-50/5' : 'border-forest-green/10 shadow-sm hover:border-forest-green/30'}
      `}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-forest-green text-sm uppercase leading-tight truncate pr-2 flex-1" title={item.productName}>
            {item.productName.split(' ').slice(0, -1).join(' ')}
          </h3>
          <span className="bg-forest-green text-brushed-gold text-[10px] font-black px-2 py-0.5 rounded uppercase">
            {item.config.size}ml
          </span>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div>
            <p className="text-[9px] font-black text-forest-green/40 uppercase">Closing Stock</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-forest-green">{item.currentStock.totalBottles}</span>
              <span className="text-xs font-bold text-forest-green/60 uppercase">btl</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-forest-green/40 uppercase">Loose Pegs</p>
            <p className="text-lg font-black text-brushed-gold">{item.currentStock.loosePegs.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {/* Secondary: Full Bottle (Room Service) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onSale('bottle')}
          disabled={item.currentStock.totalBottles < 1}
          className="py-2 bg-gray-100 text-forest-green rounded-xl text-[10px] font-black uppercase hover:bg-gray-200 transition-colors disabled:opacity-30"
        >
          +1 Btl
        </motion.button>

        {/* Primary: 60ml Peg (Bar) */}
        <motion.button
          whileTap={{ scale: 0.9, rotate: [0, -2, 2, 0] }}
          onClick={() => onSale('peg')}
          disabled={item.currentStock.totalPegs < 1}
          className="py-3 bg-brushed-gold text-forest-green rounded-xl text-xs font-black uppercase shadow-md flex items-center justify-center gap-1 hover:bg-brushed-gold-light active:shadow-inner transition-all disabled:opacity-30"
        >
          <Plus size={14} strokeWidth={4} />
          60ml
        </motion.button>
      </div>
    </motion.div>
  );
};

// --- Main Inventory Component ---

export default function Inventory() {
  const { inventory, recordSale, isLoading, error } = useBusinessStore();
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(i => i.productName.toLowerCase().includes(q));
  }, [inventory, search]);

  const handleSale = useCallback((productName: string, type: 'peg' | 'bottle') => {
    if (type === 'peg') {
      recordSale(productName, 60, 1);
    } else {
      // Logic for full bottle sale (room service)
      // Assuming 1 bottle = capacity in ml
      const config = inventory.find(i => i.productName === productName)?.config;
      if (config) {
        recordSale(productName, config.mlPerBottle, 1);
      }
    }
  }, [recordSale, inventory]);

  // Virtualization logic
  const columnCount = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }, []);

  const rowCount = Math.ceil(filteredItems.length / columnCount);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-forest-green">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-widest text-xs">Hydrating Bar Stock...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-screen flex flex-col pb-24">
      {/* Header & Search */}
      <div className="flex-shrink-0 flex flex-col gap-4 sticky top-0 bg-gray-50 z-20 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-forest-green flex items-center gap-2">
            <Package className="text-brushed-gold" size={28} />
            Digital Bar Counter
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-green/50" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Search Drinks (e.g. ceasar)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg font-bold border-2 border-forest-green/20 rounded-2xl focus:border-forest-green outline-none shadow-sm transition-all bg-white"
          />
        </div>
      </div>

      {/* Grid Display */}
      <div className="flex-1 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="h-64 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <Database size={48} className="mb-2 opacity-20" />
            <p className="font-bold">No drinks matched your search</p>
          </div>
        ) : filteredItems.length > 50 ? (
          /* Virtualized View for large lists (8GB RAM optimization) */
          <Grid
            columnCount={columnCount}
            columnWidth={window.innerWidth / columnCount - 24} // Adjusted for padding
            height={window.innerHeight - 300}
            rowCount={rowCount}
            rowHeight={240}
            width={window.innerWidth - 40}
          >
            {({ columnIndex, rowIndex, style }) => {
              const index = rowIndex * columnCount + columnIndex;
              const item = filteredItems[index];
              if (!item) return null;
              return (
                <div style={{ ...style, padding: '8px' }}>
                  <InventoryCard item={item} onSale={(type) => handleSale(item.productName, type)} />
                </div>
              );
            }}
          </Grid>
        ) : (
          /* Normal View for small lists */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
            <AnimatePresence>
              {filteredItems.map(item => (
                <InventoryCard 
                  key={`${item.productName}_${item.config.size}`} 
                  item={item} 
                  onSale={(type) => handleSale(item.productName, type)} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}