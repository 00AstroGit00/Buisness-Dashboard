import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { 
  Search, Package, Building2, CreditCard, 
  ChevronRight, ArrowRight, CornerDownLeft, LogOut
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from './Badge';

interface GlobalSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPageChange: (page: any) => void;
}

export default function GlobalSearch({ isOpen, onOpenChange, onPageChange }: GlobalSearchProps) {
  const { inventory, rooms } = useBusinessStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange, isOpen]);

  const handleSelect = (type: string, id?: string) => {
    onPageChange(type);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl overflow-hidden"
          >
            <Command
              label="Global Command Palette"
              className="glass rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col bg-[#050a09]/90"
            >
              <div className="flex items-center gap-4 p-6 border-b border-white/5">
                <Search size={24} className="text-brushed-gold" />
                <Command.Input
                  autoFocus
                  placeholder="Search inventory, rooms, or actions (e.g. 'Check out 105')..."
                  className="bg-transparent border-0 focus:ring-0 text-xl font-bold w-full placeholder:text-white/10 text-white uppercase tracking-tighter outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-white/40">
                  ESC
                </kbd>
              </div>

              <Command.List className="flex-1 overflow-y-auto max-h-[50vh] p-4 custom-scrollbar space-y-4">
                <Command.Empty className="p-12 text-center flex flex-col items-center gap-4">
                  <div className="p-4 glass rounded-full border-white/5 text-white/10">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-black text-white/20 uppercase tracking-[0.3em]">No matching protocol found</p>
                </Command.Empty>

                <Command.Group heading={<span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-4 mb-2 block">Quick Actions</span>}>
                  <Command.Item
                    onSelect={() => handleSelect('billing')}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer aria-selected:bg-brushed-gold/10 aria-selected:border-brushed-gold/20 border border-transparent"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 glass rounded-xl border-white/10 text-brushed-gold">
                        <CreditCard size={18} />
                      </div>
                      <span className="font-bold text-white/60 group-aria-selected:text-white uppercase text-xs tracking-widest">Go to Billing System</span>
                    </div>
                    <CornerDownLeft size={14} className="text-white/10 opacity-0 group-aria-selected:opacity-100" />
                  </Command.Item>
                </Command.Group>

                <Command.Group heading={<span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-4 mb-2 block mt-4">Inventory Matrix</span>}>
                  {inventory.map((item) => (
                    <Command.Item
                      key={item.productName}
                      onSelect={() => handleSelect('inventory')}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer aria-selected:bg-brushed-gold/10 aria-selected:border-brushed-gold/20 border border-transparent"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 glass rounded-xl border-white/10 text-white/20 group-aria-selected:text-brushed-gold transition-colors">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white group-aria-selected:text-brushed-gold transition-colors uppercase tracking-tight">{item.productName}</p>
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{item.config.category} • {item.currentStock.totalBottles} Btl remaining</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-white/5 text-white/40 border-0 text-[8px] font-black uppercase">{item.config.size}ML</Badge>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading={<span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-4 mb-2 block mt-4">Room Atlas</span>}>
                  {Object.values(rooms).map((room) => (
                    <Command.Item
                      key={room.id}
                      onSelect={() => handleSelect('rooms')}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer aria-selected:bg-brushed-gold/10 aria-selected:border-brushed-gold/20 border border-transparent"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 glass rounded-xl border-white/10 text-white/20 group-aria-selected:text-emerald-500 transition-colors">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight italic">Room {room.number}</p>
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                            {room.status === 'occupied' ? `Guest: ${room.currentGuest}` : 'Status: Ready'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`border-0 text-[8px] font-black uppercase tracking-widest ${room.status === 'occupied' ? 'bg-[#c5a059]/10 text-[#c5a059]' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {room.status}
                      </Badge>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading={<span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-4 mb-2 block mt-4">Dynamic Actions</span>}>
                  {Object.values(rooms).filter(r => r.status === 'occupied').map((room) => (
                    <Command.Item
                      key={`checkout-${room.id}`}
                      onSelect={() => handleSelect('billing')}
                      value={`Check out ${room.number} ${room.currentGuest}`}
                      className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer aria-selected:bg-red-500/10 aria-selected:border-red-500/20 border border-transparent"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 glass rounded-xl border-white/10 text-red-500">
                          <LogOut size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">Checkout Room {room.number}</p>
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Prepare final invoice for {room.currentGuest}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-white/10 group-aria-selected:text-red-500 transition-all group-aria-selected:translate-x-1" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[8px] font-black text-white/20 uppercase">
                    <span className="px-1.5 py-0.5 glass rounded border-white/10">↑↓</span> to navigate
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-black text-white/20 uppercase">
                    <span className="px-1.5 py-0.5 glass rounded border-white/10">ENTER</span> to select
                  </div>
                </div>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-widest font-mono">Protocol v2.4 CMD</span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
