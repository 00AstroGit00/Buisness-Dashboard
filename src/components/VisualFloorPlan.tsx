/**
 * Visual Floor Plan - 2026 Interactive Room Management
 * Features: Smart Tiles, Long-press actions, and Real-time Broadcast Sync.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, CheckCircle2, UserPlus, User, FileText,
  Clock, LogOut, ShieldCheck, RefreshCw, 
  Building2, ChevronRight, Info, Brush, Hammer, Share2,
  Calendar, DollarSign, Zap, Plus, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessStore } from '../store/useBusinessStore';
import type { RoomDetail, RoomStatus } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { BottomSheet } from './BottomSheet';
import { useDisplayDensity } from '../hooks/useDisplayDensity';

export default function VisualFloorPlan() {
  const { rooms, updateRoomStatus, isOnline } = useBusinessStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { density, columns, showGuest, showStatus, showDates, showBilling, orientation } = useDisplayDensity();

  // Sync Channel for MI Pad 7 / Laptop
  const syncChannel = useMemo(() => new BroadcastChannel('deepa_rooms'), []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    syncChannel.onmessage = (event) => {
      if (event.data.type === 'ROOM_STATUS_CHANGE') {
        // Zustand handles state, this is for real-time toast or sound alerts
        console.log('🔔 Room Update Received:', event.data);
      }
    };

    return () => {
      window.removeEventListener('resize', checkMobile);
      syncChannel.close();
    };
  }, [syncChannel]);

  const handleStatusUpdate = (id: string, status: RoomStatus, guest?: string) => {
    updateRoomStatus(id, status, guest);
    syncChannel.postMessage({ type: 'ROOM_STATUS_CHANGE', id, status, timestamp: Date.now() });
  };

  const gridCols = {
    2: 'grid-cols-2',
    4: 'grid-cols-2 md:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
    8: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
  }[columns as 2|4|6|8] || 'grid-cols-2';

  return (
    <div className="space-y-12 animate-fade-in text-white gpu-accelerated pb-32">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-1.5 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/60">Asset Intelligence</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Floor <span className="gold-gradient-text">Matrix</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
           <div className="glass px-6 py-3 rounded-2xl border-white/5 flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050a09] bg-white/10 flex items-center justify-center text-[8px] font-black">
                      {i}
                   </div>
                 ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Active Nodes: {Object.keys(rooms).length}</span>
           </div>
        </div>
      </div>

      {/* Grid of Smart Tiles */}
      <motion.div 
        key={`${density}-${orientation}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`grid ${gridCols} gap-6`}
      >
        {Object.values(rooms).map((room) => (
          <RoomSmartTile 
            key={room.id} 
            room={room} 
            onClick={() => setSelectedRoomId(room.id)} 
            onLongPress={() => setLongPressId(room.id)}
            density={density}
          />
        ))}
      </motion.div>

      {/* Quick Action Menu (Long Press) */}
      <AnimatePresence>
        {longPressId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLongPressId(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative glass rounded-[2.5rem] p-8 border border-white/10 w-full max-w-sm space-y-4 shadow-2xl"
             >
                <div className="text-center mb-6">
                   <p className="text-[10px] font-black text-brushed-gold uppercase tracking-[0.4em]">Rapid Protocol</p>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter mt-1">Room {rooms[longPressId].number}</h3>
                </div>
                <button onClick={() => { handleStatusUpdate(longPressId, 'cleaning'); setLongPressId(null); }} className="w-full flex items-center justify-between p-5 glass rounded-2xl hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-4">
                      <Brush className="text-white/40 group-hover:text-brushed-gold" size={20}/>
                      <span className="font-black uppercase tracking-widest text-xs">Mark Clean</span>
                   </div>
                   <ChevronRight size={16} className="text-white/10" />
                </button>
                <button onClick={() => setLongPressId(null)} className="w-full flex items-center justify-between p-5 glass rounded-2xl hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-4">
                      <Plus className="text-white/40 group-hover:text-brushed-gold" size={20}/>
                      <span className="font-black uppercase tracking-widest text-xs">Add Service</span>
                   </div>
                   <ChevronRight size={16} className="text-white/10" />
                </button>
                <Button variant="danger" onClick={() => setLongPressId(null)} className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Abort Action</Button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side/Bottom Sheet Detail View */}
      {isMobile ? (
        <BottomSheet
          isOpen={!!selectedRoomId}
          onClose={() => setSelectedRoomId(null)}
          title={selectedRoomId ? `Room ${rooms[selectedRoomId].number}` : ''}
        >
          {selectedRoomId && (
            <RoomDetailView 
              room={rooms[selectedRoomId]} 
              onUpdate={handleStatusUpdate}
              onClose={() => setSelectedRoomId(null)}
            />
          )}
        </BottomSheet>
      ) : (
        <AnimatePresence>
          {selectedRoomId && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRoomId(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed top-0 right-0 h-full w-full max-w-md glass border-l border-white/10 z-[110] shadow-2xl flex flex-col">
                <RoomDetailView 
                  room={rooms[selectedRoomId]} 
                  onUpdate={handleStatusUpdate}
                  onClose={() => setSelectedRoomId(null)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function RoomSmartTile({ room, onClick, onLongPress, density }: any) {
  const statusColors: any = {
    vacant: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    occupied: 'bg-[#c5a059]/10 border-[#c5a059]/30 text-[#c5a059]',
    cleaning: 'bg-white/5 border-white/10 text-white/40',
    maintenance: 'bg-red-500/10 border-red-500/20 text-red-500'
  };

  const timerRef = useRef<any>(null);

  const handleTouchStart = () => {
    timerRef.current = setTimeout(onLongPress, 600);
  };

  const handleTouchEnd = () => {
    clearTimeout(timerRef.current);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative rounded-[2rem] border-2 p-6 flex flex-col transition-all duration-500 ${statusColors[room.status] || statusColors.cleaning} group h-full min-h-[160px] justify-between text-left`}
    >
      <div className="flex justify-between items-start">
         <span className="text-4xl font-black tracking-tighter uppercase italic">{room.number}</span>
         <div className={`w-3 h-3 rounded-full bg-current shadow-[0_0_12px_currentColor] ${room.status === 'occupied' ? 'animate-pulse' : ''}`} />
      </div>

      <div className="space-y-3">
         <div className="flex items-center gap-2">
            <Badge className="bg-white/5 text-current border-0 text-[8px] font-black uppercase tracking-widest px-3 py-1">
               {room.status === 'vacant' ? 'Emerald Ready' : room.status}
            </Badge>
         </div>
         {room.currentGuest && (
           <p className="text-[10px] font-black uppercase text-white/60 truncate tracking-tight">{room.currentGuest}</p>
         )}
      </div>
    </motion.button>
  );
}

function RoomDetailView({ room, onUpdate, onClose }: any) {
  return (
    <div className="flex flex-col h-full">
       <div className="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
             <h3 className="text-3xl font-black uppercase tracking-tighter">Node {room.number}</h3>
             <Badge className="bg-white/5 text-white/40 border-0 mt-2">{room.type} Suite</Badge>
          </div>
          <button onClick={onClose} className="p-4 glass rounded-full text-white/20 hover:text-white transition-colors"><X size={24}/></button>
       </div>

       <div className="flex-1 p-10 space-y-10 overflow-y-auto">
          <div className="space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2">Lifecycle State</p>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'vacant', label: 'Available', icon: <CheckCircle2 size={20}/>, color: 'text-emerald-500' },
                  { id: 'occupied', label: 'Occupied', icon: <User size={20}/>, color: 'text-[#c5a059]' },
                  { id: 'cleaning', label: 'Cleaning', icon: <Brush size={20}/>, color: 'text-white/40' },
                  { id: 'maintenance', label: 'Alert', icon: <Hammer size={20}/>, color: 'text-red-500' }
                ].map(btn => (
                  <button 
                    key={btn.id}
                    onClick={() => onUpdate(room.id, btn.id)}
                    className={`flex items-center gap-4 p-6 glass rounded-3xl border border-white/5 hover:border-white/20 transition-all ${room.status === btn.id ? 'bg-white/10 border-white/20 ring-4 ring-white/5' : ''}`}
                  >
                     <div className={btn.color}>{btn.icon}</div>
                     <span className="font-black uppercase tracking-widest text-[10px] text-white/60">{btn.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {room.status === 'occupied' && (
            <div className="p-8 glass rounded-[2.5rem] border-white/5 space-y-8 animate-slide-in-bottom">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-brushed-gold shadow-2xl"><User size={32}/></div>
                  <div>
                     <p className="text-xl font-black text-white tracking-tight uppercase">{room.currentGuest}</p>
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">ID Verified Node</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <Button variant="gold" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-2xl" onClick={() => {}}>
                     Initialize Checkout
                  </Button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
