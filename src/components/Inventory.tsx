/**
 * Optimized Inventory Component
 * Features: Virtualized Grid, Memoized Calculations, and Performance Profiling.
 * Specifically optimized for 8GB RAM environments.
 */

import { useState, useMemo, useCallback, Profiler } from 'react';
import { FixedSizeGrid } from '../libs/reactWindowShim';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Database,
  Loader2,
  PlusCircle,
  MinusCircle,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { useSystemMonitor } from './SystemMonitor';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';

// --- Types ---
interface InventoryItem {
  id: string;
  productName: string;
  config: { size: number; mlPerBottle: number };
  currentStock: { totalBottles: number; totalPegs: number; loosePegs: number };
}

export default function Inventory() {
  const { inventory, recordSale, isLoading, loadOpeningStock } = useBusinessStore();
  const { onRenderCallback } = useSystemMonitor();
  const { recordRealtimeSale } = useRealtimeSync();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // --- 1. Memoized Search & Filter (Prevent CPU spikes) ---
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    let filtered = inventory.filter(item =>
      item.productName.toLowerCase().includes(q)
    );

    // Apply category filter if needed
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category?.toLowerCase() === selectedCategory);
    }

    return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [inventory, search, selectedCategory]);

  // --- 2. Grid Configuration (Responsive Logic) ---
  const getGridConfig = () => {
    if (typeof window === 'undefined') return { columns: 1, width: 800 };
    const width = window.innerWidth - 48; // Sidebar/Padding
    if (width > 1200) return { columns: 4, width };
    if (width > 900) return { columns: 3, width };
    if (width > 600) return { columns: 2, width };
    return { columns: 1, width };
  };

  const { columns, width } = useMemo(getGridConfig, [typeof window !== 'undefined' ? window.innerWidth : 0]);
  const columnWidth = Math.floor(width / columns);
  const rowCount = Math.ceil(filteredItems.length / columns);

  // --- 3. Optimized Cell Renderer ---
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columns + columnIndex;
    const item = filteredItems[index];

    if (!item) return null;

    const handleSaleAction = (type: 'peg' | 'bottle') => {
      const vol = type === 'peg' ? 60 : item.config.mlPerBottle;
      recordSale(item.productName, vol, 1);

      // Real-time broadcast for S23 Ultra -> HP Laptop sync
      recordRealtimeSale({
        type: 'STOCK_UPDATE',
        productId: item.productName,
        saleType: type,
        timestamp: Date.now()
      });
    };

    return (
      <div style={{ ...style, padding: '8px' }}>
        <InventoryCard
          item={item}
          onSale={handleSaleAction}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-forest-green">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold uppercase tracking-widest">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <Profiler id="Inventory" onRender={onRenderCallback}>
      <div className="space-y-6 pb-24 h-screen flex flex-col overflow-hidden">
        {/* Header with Filters */}
        <div className="flex-shrink-0 space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-forest-green flex items-center gap-2">
                <Package className="text-brushed-gold" size={24} />
                Inventory Management
              </h2>
              <span className="bg-brushed-gold text-forest-green text-xs font-bold px-2 py-1 rounded-full">
                {filteredItems.length} items
              </span>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-forest-green bg-white focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="IMFL">IMFL</option>
                <option value="beer">Beer</option>
                <option value="wine">Wine</option>
                <option value="spirits">Spirits</option>
              </select>

              <button className="px-3 py-2 bg-forest-green text-brushed-gold rounded-lg text-sm font-medium hover:bg-forest-green-dark transition-colors flex items-center gap-1">
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative px-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-green/50">
              <Search size={20} />
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Search products, brands, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent shadow-sm transition-all bg-white"
            />
          </div>
        </div>

        {/* Virtualized Grid */}
        <div className="flex-1 overflow-hidden px-2">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-forest-green/20 p-12 text-center">
              <Database className="mx-auto text-forest-green/10 mb-4" size={64} />
              <h3 className="text-xl font-bold text-forest-green/40 mb-2">No Inventory Found</h3>
              <p className="text-forest-green/60 mb-4">Try adjusting your search or category filter</p>
              <button className="px-4 py-2 bg-forest-green text-brushed-gold rounded-lg hover:bg-forest-green-dark transition-colors text-sm font-medium">
                Add New Item
              </button>
            </div>
          ) : (
            (() => {
              const Grid = FixedSizeGrid;
              if (Grid) {
                return (
                  <Grid
                    columnCount={columns}
                    columnWidth={columnWidth}
                    height={window.innerHeight - 300}
                    rowCount={rowCount}
                    rowHeight={280}
                    width={width}
                    className="scrollbar-hide"
                  >
                    {Cell}
                  </Grid>
                );
              }

              // Fallback: simple CSS grid when FixedSizeGrid isn't available
              return (
                <div
                  className={`grid gap-4`}
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, maxHeight: window.innerHeight - 300, overflow: 'auto' }}
                >
                  {filteredItems.map((item, idx) => (
                    <div key={`${item.productName}-${item.config.size}-${idx}`} style={{ padding: 8 }}>
                      <InventoryCard item={item} onSale={(t) => {
                        // reuse recordSale behavior
                        const vol = t === 'peg' ? 60 : item.config.mlPerBottle;
                        recordSale(item.productName, vol, 1);
                        recordRealtimeSale({ type: 'STOCK_UPDATE', productId: item.productName, saleType: t, timestamp: Date.now() });
                      }} />
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </Profiler>
  );
}

// --- Memoized Card Component (Prevent re-renders) ---

function InventoryCard({ item, onSale }: { item: any; onSale: (type: 'peg' | 'bottle') => void }) {
  const isLowStock = item.currentStock.totalBottles < 3;
  const remainingPercent = useMemo(() =>
    (item.remainingVolumeInCurrentBottle / item.config.mlPerBottle) * 100,
    [item.remainingVolumeInCurrentBottle, item.config.mlPerBottle]
  );

  return (
    <div className={`
      relative bg-white h-full rounded-2xl overflow-hidden shadow-lg border transition-all hover:shadow-xl
      ${isLowStock ? 'border-red-400 bg-red-50/30' : 'border-gray-200'}
    `}>
      {/* Card Header */}
      <div className="bg-gradient-to-r from-forest-green to-forest-green-light p-4 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base truncate">{item.productName.split(' ').slice(0, -1).join(' ')}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-brushed-gold uppercase bg-white/20 px-2 py-1 rounded-full">
              {item.config.size}ml
            </span>
            <span className="text-[10px] font-medium text-white/80 bg-black/10 px-2 py-1 rounded-full">
              {item.category || 'N/A'}
            </span>
          </div>
        </div>
        <button className="p-1 text-white/70 hover:text-white">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col justify-between h-[calc(100%-60px)]">
        {/* Stock Info */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-forest-green/60 uppercase tracking-wider">Bottles</p>
              <p className="text-xl font-bold text-forest-green mt-1">{item.currentStock.totalBottles}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-forest-green/60 uppercase tracking-wider">Pegs</p>
              <p className="text-xl font-bold text-brushed-gold mt-1">{item.currentStock.loosePegs.toFixed(1)}</p>
            </div>
          </div>

          {/* Stock Level Indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-forest-green/60">Stock Level</span>
              <span className="text-forest-green font-medium">{Math.round(remainingPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  remainingPercent > 50 ? 'bg-green-500' :
                  remainingPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={() => onSale('bottle')}
            className="py-3 bg-gray-100 hover:bg-gray-200 text-forest-green rounded-xl font-medium text-sm transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-1"
          >
            <MinusCircle size={16} />
            <span>1 Bottle</span>
          </button>
          <button
            onClick={() => onSale('peg')}
            className="py-3 bg-gradient-to-r from-brushed-gold to-brushed-gold-light hover:from-brushed-gold-light hover:to-brushed-gold text-forest-green rounded-xl font-medium text-sm transition-all active:scale-95 touch-manipulation flex items-center justify-center gap-1 shadow-md"
          >
            <ShoppingCart size={16} />
            <span>1 Peg</span>
          </button>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="mt-3 flex items-center gap-2 p-2 bg-red-100 border border-red-200 rounded-lg">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
            <span className="text-xs text-red-700 font-medium">Low Stock - Reorder Recommended</span>
          </div>
        )}
      </div>
    </div>
  );
}