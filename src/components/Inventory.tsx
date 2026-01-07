import { useState, useMemo, useCallback, Profiler } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Database,
  Loader2,
  Filter,
  MoreVertical,
  ChevronRight,
  Wine,
  Beaker,
  Beer,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { useSystemMonitor } from './SystemMonitor';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useSearch } from '../hooks/useSearch';
import InventoryGrid from './InventoryGrid';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

export default function Inventory() {
  const { inventory, recordSale, isLoading, loadOpeningStock } = useBusinessStore();
  const { onRenderCallback } = useSystemMonitor();
  const { recordRealtimeSale } = useRealtimeSync();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { query, results: filteredResults, handleSearch, isSearching } = useSearch(
    inventory,
    ['productName', 'category']
  );

  const finalItems = useMemo(() => {
    let filtered = filteredResults;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.config.category?.toLowerCase() === selectedCategory);
    }
    return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [filteredResults, selectedCategory]);

  const handleSaleAction = (productId: string, type: 'peg' | 'bottle') => {
    const item = inventory.find(i => i.productName === productId);
    if (!item) return;

    const vol = type === 'peg' ? 60 : item.config.mlPerBottle;
    recordSale(productId, vol, 1);

    recordRealtimeSale({
      type: 'STOCK_UPDATE',
      productId: productId,
      saleType: type,
      timestamp: Date.now()
    });
  };

  const handleRefresh = async () => {
    // Simulate server sync
    if (loadOpeningStock) {
      await loadOpeningStock();
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-forest-green">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-3xl border-4 border-forest-green/5 border-t-brushed-gold animate-spin"></div>
          <Package className="absolute inset-0 m-auto text-forest-green/20" size={24} />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-forest-green/40">Syncing Inventory...</p>
      </div>
    );
  }

  return (
    <Profiler id="Inventory" onRender={onRenderCallback}>
      <div className="space-y-12 animate-fade-in text-white gpu-accelerated">
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-1.5 bg-gradient-to-r from-brushed-gold to-transparent rounded-full"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">Portfolio Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
              Liquor <span className="gold-gradient-text">Inventory</span>
            </h2>
            <div className="flex items-center gap-4">
              <Badge className="bg-brushed-gold text-forest-green border-0 font-black px-4 py-1.5 rounded-full">{finalItems.length} Skus</Badge>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                 <Zap size={14} className="text-brushed-gold" />
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Real-time Sync Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brushed-gold transition-colors" size={18} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-12 pr-10 py-4 glass border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-4 focus:ring-brushed-gold/10 focus:border-brushed-gold transition-all appearance-none min-w-[220px]"
                >
                  <option value="all">All Spirits</option>
                  <option value="spirits">Premium Spirits</option>
                  <option value="IMFL">IMFL Brands</option>
                  <option value="beer">Chilled Beer</option>
                  <option value="wine">Vintage Wine</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 rotate-90" size={16} />
             </div>

            <Button 
              variant="gold"
              leftIcon={<Plus size={20} />}
              className="rounded-2xl shadow-2xl shadow-brushed-gold/20"
            >
              Register Sku
            </Button>
          </div>
        </div>

        {/* Search Bar - Modern Style */}
        <div className="relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-brushed-gold/20 to-transparent blur-3xl group-focus-within:opacity-100 opacity-0 transition-opacity duration-700"></div>
           <Input 
             autoFocus
             placeholder="Search by brand name, category or size... (Ctrl + F)"
             value={query}
             onChange={(e) => handleSearch(e.target.value)}
             leftIcon={isSearching ? <Loader2 size={24} className="text-brushed-gold animate-spin" /> : <Search className="text-brushed-gold" size={24} />}
             className="py-6 px-8 rounded-3xl border-white/5 shadow-2xl glass relative z-10 font-bold placeholder:text-white/10 text-xl"
           />
        </div>

        {/* Inventory Grid Container with Pull-to-Refresh */}
        <div className="relative">
          <InventoryGrid 
            items={finalItems} 
            onSale={handleSaleAction}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Profiler>
  );
}
