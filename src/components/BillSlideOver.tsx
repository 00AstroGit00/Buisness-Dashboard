/**
 * BillSlideOver Component - 2026 Interactive Checkout Experience
 * Features: Adaptive Drawer (Right for Desktop, Bottom for S23 Ultra),
 * Live Bouncing Number calculations, and Swipe-to-Dismiss.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calculator, ShoppingCart, CreditCard, 
  ChevronRight, Trash2, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { Button } from './Button';
import { Card } from './Card';
import PrivateNumber from './PrivateNumber';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface BillSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string | null;
  items: any[];
  total: number;
  onFinalize: () => void;
  onRemoveItem: (id: string) => void;
}

export default function BillSlideOver({
  isOpen,
  onClose,
  entityId,
  items,
  total,
  onFinalize,
  onRemoveItem
}: BillSlideOverProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { triggerSuccess, triggerError } = useHapticFeedback();

  const handleFinalizeWithFeedback = () => {
    if (items.length === 0) {
      triggerError('Bill cannot be empty');
      return;
    }
    
    onFinalize();
    triggerSuccess(`Settlement processed for ${entityId}`);
    onClose();
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const variants = isMobile 
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center lg:justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            {...variants}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag={isMobile ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (isMobile && (info.offset.y > 150 || info.velocity.y > 500)) onClose();
            }}
            className={`
              relative glass border-white/10 shadow-2xl flex flex-col overflow-hidden
              ${isMobile 
                ? 'w-full h-[90vh] rounded-t-[3rem] bg-[#050a09]' 
                : 'w-[450px] h-screen border-l bg-[#050a09]/80 backdrop-blur-3xl'
              }
            `}
          >
            {/* Header */}
            <div className="bg-forest-green p-8 flex items-center justify-between relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><Calculator size={120} /></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Checkout Protocol</h3>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mt-1">{entityId}</p>
               </div>
               <button onClick={onClose} className="p-3 glass rounded-full text-white/20 hover:text-white transition-colors touch-target relative z-10">
                  <X size={24}/>
               </button>
            </div>

            {/* List Area */}
            <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
               {items.length > 0 ? (
                 <div className="space-y-3">
                    {items.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 group hover:border-white/10 transition-all"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center font-black text-xs text-brushed-gold">{item.qty}x</div>
                            <div>
                               <p className="text-xs font-black text-white uppercase truncate max-w-[150px]">{item.description}</p>
                               <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{formatCurrency(item.amount)} / unit</p>
                            </div>
                         </div>
                         <button onClick={() => onRemoveItem(item.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16}/>
                         </button>
                      </motion.div>
                    ))}
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
                    <ShoppingCart size={48} className="opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Buffer Empty</p>
                 </div>
               )}
            </div>

            {/* Footer Summary */}
            <div className="p-8 bg-black/40 border-t border-white/5 space-y-8">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Settlement Total</p>
                     <div className="flex items-baseline gap-2">
                        <motion.div
                          key={total}
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-5xl font-black text-white tracking-tighter italic"
                        >
                           <PrivateNumber value={total} format={formatCurrency} />
                        </motion.div>
                     </div>
                  </div>
                  <div className="p-4 glass rounded-2xl border-white/10 text-emerald-500">
                     <CheckCircle2 size={24}/>
                  </div>
               </div>

               <div className="space-y-4">
                  <Button 
                    variant="gold" 
                    onClick={handleFinalizeWithFeedback}
                    disabled={items.length === 0}
                    className="w-full h-20 rounded-[2rem] font-black text-xl tracking-widest uppercase italic gap-4 shadow-2xl shadow-brushed-gold/20"
                    leftIcon={<CreditCard size={24} />}
                  >
                    Finalize Payment
                  </Button>
                  
                  {isMobile && (
                    <p className="text-center text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">
                       Swipe down to dismiss portal
                    </p>
                  )}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
