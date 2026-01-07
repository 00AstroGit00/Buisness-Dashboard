import { motion, AnimatePresence, useMotionValue, useTransform, type Variants } from 'framer-motion';
import { ShoppingCart, RefreshCw, Package, ArrowUpRight, Info, Plus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

interface InventoryGridProps {
  items: any[];
  onSale: (productId: string, type: 'peg' | 'bottle') => void;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

// Stagger variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100
    }
  }
};

export default function InventoryGrid({ items, onSale, onRefresh, isLoading }: InventoryGridProps) {
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDrag = (_: any, info: any) => {
    if (info.offset.y > 0 && !isRefreshing) {
      setPullProgress(Math.min(info.offset.y / 2, 80));
    }
  };

  const handleDragEnd = async (_: any, info: any) => {
    if (info.offset.y > 100 && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullProgress(0);
  };

  return (
    <div className="relative min-h-[400px]">
      {/* Pull to Refresh Visual */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
        style={{ transform: `translateY(${pullProgress}px)` }}
      >
        <motion.div 
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          className="p-3 glass rounded-full border border-white/10 shadow-2xl text-brushed-gold"
        >
          <RefreshCw size={24} />
        </motion.div>
      </div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 sm:p-0"
      >
        {items.map((item) => (
          <motion.div key={item.productName} variants={itemVariants}>
            <InventoryGridCard item={item} onSale={onSale} />
          </motion.div>
        ))}
      </motion.div>

      {items.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-white/20 uppercase tracking-[0.4em] text-xs font-black">
          <Package size={64} className="mb-6 opacity-10" />
          No units detected in sector
        </div>
      )}
    </div>
  );
}

function InventoryGridCard({ item, onSale }: { item: any; onSale: (id: string, type: 'peg' | 'bottle') => void }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const background = useTransform(x, [-100, 0, 100], [
    'rgba(197, 160, 89, 0.1)', // Left swipe (Details color hint)
    'rgba(255, 255, 255, 0.02)', 
    'rgba(34, 197, 94, 0.1)'    // Right swipe (Sale color hint)
  ]);

  const isLowStock = item.currentStock.totalBottles < 3;
  const remainingPercent = (item.remainingVolumeInCurrentBottle / (item.config.mlPerBottle || 750)) * 100;

  const handleSaleWithHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    onSale(item.productName, 'peg');
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      handleSaleWithHaptic();
    } else if (info.offset.x < -100) {
      console.log('View Details for', item.productName);
    }
  };
  
  return (
    <div className="relative">
      {/* Swipe Action Indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-10 text-white/10 pointer-events-none">
         <div className="flex flex-col items-center gap-2">
            <Info size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest">Details</span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <Plus size={32} className="text-green-500/40" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500/40">Sale</span>
         </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        style={{ x, opacity, background }}
        onDragEnd={handleDragEnd}
        className={`
          relative z-10 cursor-pointer rounded-[2.5rem] p-8 border transition-all duration-500 group overflow-hidden h-full flex flex-col justify-between backdrop-blur-3xl gpu-accelerated
          ${isLowStock ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5 hover:border-white/10'}
        `}
      >
        <div className="space-y-6">
          {/* Header: Brand Name */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none group-hover:gold-gradient-text transition-all duration-500">
                {item.productName}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                {item.config.category} • {item.config.size}ML
              </p>
            </div>
            <div className="p-2 glass rounded-xl border-white/10 text-brushed-gold">
              <ArrowUpRight size={16} />
            </div>
          </div>

          {/* Visual Progress Bar - Stock Level */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Unit Density</span>
              <span className={`text-xs font-mono font-black ${remainingPercent < 20 ? 'text-red-500' : 'text-brushed-gold'}`}>
                {Math.round(remainingPercent)}%
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${remainingPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full shadow-[0_0_15px_currentColor] ${
                  remainingPercent > 50 ? 'bg-green-500 text-green-500' : 
                  remainingPercent > 20 ? 'bg-brushed-gold text-brushed-gold' : 'bg-red-500 text-red-500'
                }`}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Available Base</p>
              <div className="text-3xl font-black text-white font-mono tracking-tighter">
                {item.currentStock.totalBottles}<span className="text-sm text-white/30 ml-1 font-sans">BTL</span>
              </div>
            </div>
            
            <Button 
              variant="gold"
              size="md"
              onClick={handleSaleWithHaptic}
              leftIcon={<ShoppingCart size={18} />}
              className="rounded-[1.25rem] px-6 shadow-2xl shadow-brushed-gold/20 active:scale-90"
            >
              +60ML
            </Button>
          </div>
        </div>
        
        {/* Footer Alert */}
        {isLowStock && (
          <div className="mt-6 bg-red-500/10 -mx-8 -mb-8 py-3 px-8 flex items-center gap-2 border-t border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Restock Critical Alert</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}