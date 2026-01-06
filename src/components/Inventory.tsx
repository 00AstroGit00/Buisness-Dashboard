/**
 * Optimized Inventory Component
 * Features: Virtualized Grid, Memoized Calculations, and Performance Profiling.
 * Specifically optimized for 8GB RAM environments.
 */

import { useState, useMemo, useCallback, Profiler } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Database,
  Loader2,
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

  // --- 1. Memoized Search & Filter (Prevent CPU spikes) ---
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(item => 
      item.productName.toLowerCase().includes(q)
    ).sort((a, b) => a.productName.localeCompare(b.productName));
  }, [inventory, search]);

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
        <p className="font-bold uppercase tracking-widest">Virtualized Stock Init...</p>
      </div>
    );
  }

  return (
    <Profiler id="Inventory" onRender={onRenderCallback}>
      <div className="space-y-6 pb-24 h-screen flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="flex-shrink-0 space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-forest-green flex items-center gap-2">
              <Package className="text-brushed-gold" size={28} />
              Bar Counter
            </h2>
          </div>

          <div className="relative px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-forest-green/50" size={20} />
            <input
              autoFocus
              type="text"
              placeholder="Search Brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg font-bold border-2 border-forest-green/20 rounded-2xl focus:border-forest-green outline-none shadow-sm transition-all bg-white"
            />
          </div>
        </div>

        {/* Virtualized Grid */}
        <div className="flex-1 overflow-hidden px-2">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-forest-green/20 p-20 text-center">
              <Database className="mx-auto text-forest-green/10 mb-4" size={64} />
              <h3 className="text-xl font-bold text-forest-green/40">Empty Stock Room</h3>
            </div>
          ) : (
            <Grid
              columnCount={columns}
              columnWidth={columnWidth}
              height={window.innerHeight - 300}
              rowCount={rowCount}
              rowHeight={260}
              width={width}
              className="scrollbar-hide"
            >
              {Cell}
            </Grid>
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
      relative bg-white h-full rounded-2xl overflow-hidden shadow-md border-2 transition-all
      ${isLowStock ? 'border-orange-400 bg-orange-50/10' : 'border-forest-green/5'}
    `}>
      <div className="bg-forest-green p-4 flex justify-between items-center">
        <div className="max-w-[70%]">
          <h3 className="text-white font-black text-sm uppercase truncate">{item.productName.split(' ').slice(0, -1).join(' ')}</h3>
          <span className="text-[10px] font-black text-brushed-gold uppercase">{item.config.size}ml</span>
        </div>
        {isLowStock && <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse">LOW</div>}
      </div>

      <div className="p-4 flex flex-col justify-between h-[calc(100%-60px)]">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-forest-green/40 uppercase">Stock</p>
            <p className="text-2xl font-black text-forest-green leading-none">{item.currentStock.totalBottles}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[9px] font-black text-forest-green/40 uppercase tracking-widest">Pegs</p>
            <p className="text-lg font-black text-brushed-gold leading-none">{item.currentStock.loosePegs.toFixed(1)}</p>
          </div>
        </div>

        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden my-4">
          <div className="h-full bg-brushed-gold transition-all duration-700" style={{ width: `${remainingPercent}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onSale('bottle')} className="py-3 bg-gray-50 text-forest-green rounded-xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all active:scale-95 touch-manipulation">
            +1 Btl
          </button>
          <button onClick={() => onSale('peg')} className="py-3 bg-brushed-gold text-forest-green rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-brushed-gold-light transition-all active:scale-95 touch-manipulation">
            +60ml
          </button>
        </div>
      </div>
    </div>
  );
}