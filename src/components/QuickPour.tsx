/**
 * QuickPour Component - specialized for Bar Execution
 * Features: High-density tap targets, liquid animations, and instant haptic sync.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Beer, Beaker, ShoppingCart, Zap, Search, ChevronRight, Filter } from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { Card } from './Card';
import { Input } from './Input';
import { Badge } from './Badge';

export default function QuickPour() {
  const { inventory, recordSale } = useBusinessStore();
  const { recordRealtimeSale } = useRealtimeSync();
  const { triggerSuccess, triggerError } = useHapticFeedback();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filteredInventory = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(item => 
      (category === 'all' || item.config.category === category) &&
      item.productName.toLowerCase().includes(q)
    ).sort((a, b) => a.productName.localeCompare(b.productName));
  }, [inventory, search, category]);

  const handlePour = (productId: string, volume: number, type: string) => {
    const item = inventory.find(i => i.productName === productId);
    
    if (item && item.currentStock.totalMl < volume) {
      triggerError(`Out of Stock: ${item.productName}`);
      return;
    }

    recordSale(productId, volume, 1);
    recordRealtimeSale({
      type: 'QUICK_POUR',
      productId,
      volume,
      timestamp: Date.now()
    });

    triggerSuccess(`Recorded ${type} for ${productId}`);
  };

  return (
    <div className="space-y-12 animate-fade-in text-white pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 glass rounded-lg border-white/10 text-brushed-gold">
               <Zap size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">Rapid Service Protocol</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            Quick <span className="gold-gradient-text">Pour</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="glass px-6 py-3 rounded-2xl border-white/10 flex items-center gap-3">
              <Filter size={16} className="text-white/20" />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 text-[10px] font-black uppercase tracking-widest text-white/60 outline-none"
              >
                <option value="all">All Units</option>
                <option value="spirits">Spirits</option>
                <option value="beer">Beer</option>
                <option value="wine">Wine</option>
              </select>
           </div>
        </div>
      </div>

      {/* Search Matrix */}
      <div className="relative group max-w-4xl mx-auto">
         <div className="absolute inset-0 bg-gradient-to-r from-brushed-gold/10 to-transparent blur-3xl group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
         <Input 
           placeholder="Tap brand to initialize pour..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           leftIcon={<Search className="text-brushed-gold" size={24} />}
           className="py-6 px-8 rounded-[2rem] border-white/5 glass relative z-10 font-bold text-xl placeholder:text-white/10 uppercase tracking-tighter"
         />
      </div>

      {/* High-Density Pour Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredInventory.map((item) => (
          <PourCard 
            key={item.productName} 
            item={item} 
            onPour={(vol, type) => handlePour(item.productName, vol, type)} 
          />
        ))}
      </div>
    </div>
  );
}

function PourCard({ item, onPour }: { item: any, onPour: (vol: number, type: string) => void }) {
  const [pouring, setPouring] = useState<string | null>(null);

  const handleTap = (vol: number, type: string) => {
    setPouring(type);
    onPour(vol, type);
    setTimeout(() => setPouring(null), 1000);
  };

  return (
    <Card glass className="p-8 border-white/5 flex flex-col gap-8 relative overflow-hidden group">
      <div className="flex justify-between items-start relative z-10">
         <div className="space-y-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none group-hover:gold-gradient-text transition-all duration-500">{item.productName}</h3>
            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{item.config.size}ML Base • {item.currentStock.totalBottles} Btl Left</p>
         </div>
         <div className="p-3 glass rounded-2xl border-white/10 text-white/20">
            {item.config.category === 'beer' ? <Beer size={20} /> : <Wine size={20} />}
         </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
         <PourButton 
           label="30ML" 
           isPouring={pouring === '30ml'} 
           onClick={() => handleTap(30, '30ml')} 
           color="bg-white/5"
         />
         <PourButton 
           label="60ML" 
           isPouring={pouring === '60ml'} 
           onClick={() => handleTap(60, '60ml')} 
           color="bg-brushed-gold/10"
           textColor="text-brushed-gold"
         />
         <PourButton 
           label="FULL" 
           isPouring={pouring === 'full'} 
           onClick={() => handleTap(item.config.mlPerBottle, 'full')} 
           color="bg-white/10"
         />
      </div>
    </Card>
  );
}

function PourButton({ label, isPouring, onClick, color, textColor = "text-white" }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        relative h-24 rounded-2xl border border-white/5 overflow-hidden transition-all active:scale-90 group/btn
        ${color} ${isPouring ? 'ring-2 ring-brushed-gold/50' : 'hover:border-white/20'}
      `}
    >
      {/* Liquid Filling Animation */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={isPouring ? { y: '0%' } : { y: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute inset-0 bg-brushed-gold/30 z-0"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
         <span className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>{label}</span>
         {isPouring ? (
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
           >
             <Beaker size={16} className="text-brushed-gold" />
           </motion.div>
         ) : (
           <ShoppingCart size={16} className="text-white/10 group-hover/btn:text-white/40 transition-colors" />
         )}
      </div>
    </button>
  );
}
