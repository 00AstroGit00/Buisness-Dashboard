import React, { memo } from 'react';
import { Plus, Minus, AlertTriangle, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProductInventory } from '../utils/liquorLogic';
import { formatCurrency } from '../utils/formatCurrency';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

interface InventoryCardProps {
  item: ProductInventory;
  onSellPeg: (productId: string) => void;
}

const InventoryCard = memo(({ item, onSellPeg }: InventoryCardProps) => {
  const isLowStock = item.currentStock.totalBottles < 3;
  const remainingPercent = (item.remainingVolumeInCurrentBottle / (item.config.mlPerBottle || 750)) * 100;
  const isCritical = remainingPercent < 20;

  return (
    <Card 
      glass 
      padded={false}
      className={`group h-full border-white/5 hover:border-brushed-gold/30 transition-all duration-500 overflow-hidden relative ${isLowStock ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}`}
    >
      <div className="p-6 flex gap-6">
        {/* Visual Liquid Gauge (Bottle SVG) */}
        <div className="shrink-0 w-16 h-40 relative group/bottle">
           <svg viewBox="0 0 100 240" className="w-full h-full drop-shadow-2xl">
              {/* Bottle Outline */}
              <path 
                d="M30 20 L70 20 L70 60 L85 80 L85 220 Q85 235 70 235 L30 235 Q15 235 15 220 L15 80 L30 60 Z" 
                fill="none" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="4"
              />
              {/* Mask for Liquid */}
              <clipPath id={`bottle-mask-${item.productName.replace(/\s+/g, '-')}`}>
                <path d="M30 20 L70 20 L70 60 L85 80 L85 220 Q85 235 70 235 L30 235 Q15 235 15 220 L15 80 L30 60 Z" />
              </clipPath>
              
              <g clipPath={`url(#bottle-mask-${item.productName.replace(/\s+/g, '-')})`}>
                 {/* Background of bottle */}
                 <rect x="0" y="0" width="100" height="240" fill="rgba(255,255,255,0.02)" />
                 
                 {/* Liquid Level with Animation */}
                 <motion.rect
                   initial={{ height: 0 }}
                   animate={{ 
                     height: `${remainingPercent}%`,
                     fill: isCritical ? ['#ef4444', '#7f1d1d', '#ef4444'] : '#c5a059'
                   }}
                   transition={{ 
                     height: { duration: 1.5, ease: "easeOut" },
                     fill: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                   }}
                   x="0"
                   y={240 - (240 * remainingPercent / 100)}
                   width="100"
                   className={isCritical ? 'liquid-pulse' : ''}
                   style={{ transformOrigin: 'bottom' }}
                 />
                 
                 {/* Shine/Reflections */}
                 <rect x="25" y="30" width="10" height="180" fill="rgba(255,255,255,0.05)" rx="5" />
              </g>
           </svg>
           
           {/* Percentage Label */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`text-[10px] font-black tracking-tighter ${isCritical ? 'text-white' : 'text-brushed-gold'} opacity-40 group-hover/bottle:opacity-100 transition-opacity`}>
                {Math.round(remainingPercent)}%
              </span>
           </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between py-2">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:gold-gradient-text transition-all duration-500">
                  {item.productName}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                  {item.config.category} • {item.config.size}ML Base
                </p>
              </div>
              <div className="p-2 glass rounded-xl border-white/10 text-brushed-gold">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="glass rounded-2xl p-3 border border-white/5 group-hover:border-white/20 transition-all">
                  <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Full Units</p>
                  <p className="text-2xl font-black text-white italic">{item.currentStock.totalBottles}</p>
               </div>
               <div className="glass rounded-2xl p-3 border border-white/5 group-hover:border-brushed-gold/20 transition-all">
                  <p className="text-[8px] font-black uppercase text-brushed-gold/40 tracking-widest">Loose Pegs</p>
                  <p className="text-2xl font-black text-brushed-gold italic">{item.currentStock.loosePegs.toFixed(1)}</p>
               </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary"
              size="sm"
              className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-12"
              onClick={() => {}}
            >
              Details
            </Button>
            <Button 
              variant="gold"
              size="sm"
              className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-12"
              onClick={() => onSellPeg(item.productName)}
              leftIcon={<ShoppingCart size={14} />}
            >
              Sell Peg
            </Button>
          </div>
        </div>
      </div>

      {isLowStock && (
        <div className="bg-red-500/10 border-t border-red-500/20 py-2 px-6 flex items-center gap-2">
          <AlertTriangle size={12} className="text-red-500 animate-pulse" />
          <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.3em]">Restock Protocol Initialized</span>
        </div>
      )}
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.currentStock.totalPegs === nextProps.item.currentStock.totalPegs &&
    prevProps.item.currentStock.totalBottles === nextProps.item.currentStock.totalBottles &&
    prevProps.item.remainingVolumeInCurrentBottle === nextProps.item.remainingVolumeInCurrentBottle &&
    prevProps.item.productName === nextProps.item.productName
  );
});

export default InventoryCard;
