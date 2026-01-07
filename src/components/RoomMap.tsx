/**
 * Room Map Component - 2026 Overhauled UI
 * Features: Visual Room Map with Right-Side Sheet and Status-First Logic.
 */

import { useState, useRef, useMemo, useEffect } from 'react';

import { 

  Bed, Camera, X, CheckCircle2, UserPlus, User, FileText,

  Clock, LogOut, ShieldCheck, RefreshCw, Image as ImageIcon,

  Building2, AlertCircle, ChevronRight, Info, Brush, Hammer, Share2,

  Calendar, DollarSign

} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import { useBusinessStore } from '../store/useBusinessStore';

import type { RoomDetail, RoomStatus } from '../store/useBusinessStore';

import { formatCurrency } from '../utils/formatCurrency';

import { Card } from './Card';

import { Button } from './Button';

import { Badge } from './Badge';

import { Input } from './Input';

import { BottomSheet } from './BottomSheet';

import { useDisplayDensity } from '../hooks/useDisplayDensity';



export default function RoomMap() {

  const { rooms, updateRoomStatus } = useBusinessStore();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  const { density, columns, showGuest, showStatus, showDates, showBilling, orientation } = useDisplayDensity();



  useEffect(() => {

    const checkMobile = () => setIsMobile(window.innerWidth < 1024);

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);

  }, []);

  

  const roomStats = useMemo(() => {

    const all = Object.values(rooms);

    return {

      total: all.length,

      available: all.filter(r => r.status === 'vacant').length,

      occupied: all.filter(r => r.status === 'occupied').length,

      cleaning: all.filter(r => r.status === 'cleaning').length,

      maintenance: all.filter(r => (r as any).status === 'maintenance').length,

    };

  }, [rooms]);



  const gridCols = {

    2: 'grid-cols-2',

    4: 'grid-cols-2 md:grid-cols-4',

    6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',

    8: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'

  }[columns as 2|4|6|8] || 'grid-cols-2';



  return (

    <div className="space-y-12 animate-fade-in text-white gpu-accelerated">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

        <div className="space-y-4">

          <div className="flex items-center gap-3">

            <span className="w-12 h-1.5 bg-gradient-to-r from-emerald-500 to-transparent rounded-full"></span>

            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/60">Live Inventory</span>

          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">

            Room <span className="gold-gradient-text">Atlas</span>

          </h2>

        </div>



        <div className="flex flex-wrap gap-3">

           {[

             { label: 'Available', count: roomStats.available, color: 'bg-emerald-500' },

             { label: 'Occupied', count: roomStats.occupied, color: 'bg-[#c5a059]' },

             { label: 'Cleaning', count: roomStats.cleaning, color: 'bg-gray-500' },

             { label: 'Alerts', count: roomStats.maintenance, color: 'bg-red-500' }

           ].map(stat => (

             <div key={stat.label} className="glass px-4 py-2 rounded-2xl border-white/5 flex items-center gap-3">

                <div className={`w-2 h-2 rounded-full ${stat.color} shadow-[0_0_10px_currentColor]`}></div>

                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</span>

                <span className="text-sm font-black text-white">{stat.count}</span>

             </div>

           ))}

        </div>

      </div>



      {/* Room Grid - With Soft Fade Transition on density/orientation change */}

      <motion.div 

        key={`${density}-${orientation}`}

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ duration: 0.5, ease: "easeInOut" }}

        className={`grid ${gridCols} gap-4`}

      >

        {Object.values(rooms).map((room) => (

          <RoomTile 

            key={room.id} 

            room={room} 

            onClick={() => setSelectedRoomId(room.id)} 

            density={density}

            showGuest={showGuest}

            showDates={showDates}

            showBilling={showBilling}

          />

        ))}

      </motion.div>



      {/* Interactions: BottomSheet for Mobile, Side Sheet for Desktop */}

      {isMobile ? (

        <BottomSheet

          isOpen={!!selectedRoomId}

          onClose={() => setSelectedRoomId(null)}

          title={selectedRoomId ? `Room ${rooms[selectedRoomId].number}` : ''}

        >

          {selectedRoomId && (

            <RoomSideSheet 

              room={rooms[selectedRoomId]} 

              onClose={() => setSelectedRoomId(null)} 

              onUpdateStatus={updateRoomStatus}

            />

          )}

        </BottomSheet>

      ) : (

        <AnimatePresence>

          {selectedRoomId && (

            <>

              <motion.div

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                exit={{ opacity: 0 }}

                onClick={() => setSelectedRoomId(null)}

                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"

              />

              <motion.div

                initial={{ x: '100%' }}

                animate={{ x: 0 }}

                exit={{ x: '100%' }}

                transition={{ type: 'spring', damping: 25, stiffness: 200 }}

                className="fixed top-0 right-0 h-full w-full max-w-md glass border-l border-white/10 z-[110] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"

              >

                <RoomSideSheet 

                  room={rooms[selectedRoomId]} 

                  onClose={() => setSelectedRoomId(null)} 

                  onUpdateStatus={updateRoomStatus}

                />

              </motion.div>

            </>

          )}

        </AnimatePresence>

      )}

    </div>

  );

}



function RoomTile({ 

  room, 

  onClick, 

  density, 

  showGuest, 

  showDates, 

  showBilling 

}: { 

  room: RoomDetail, 

  onClick: () => void, 

  density: string,

  showGuest: boolean,

  showDates: boolean,

  showBilling: boolean

}) {

  const statusColors = {

    vacant: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]',

    occupied: 'bg-[#c5a059]/10 border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]',

    cleaning: 'bg-white/5 border-white/10 text-white/40',

    maintenance: 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.05)]'

  };



  const status = (room as any).status as keyof typeof statusColors;

  const colorClass = statusColors[status] || statusColors.cleaning;



  return (

    <motion.button

      whileHover={{ scale: 1.05, y: -5 }}

      whileTap={{ scale: 0.95 }}

      onClick={onClick}

      className={`relative rounded-3xl border-2 p-4 flex flex-col transition-all duration-300 ${colorClass} group ${density === 'compact' ? 'aspect-square items-center justify-center gap-2' : 'items-start justify-between min-h-[140px]'}`}

    >

      <div className={`${density === 'compact' ? 'text-center' : 'w-full flex justify-between items-start'}`}>

        <span className={`${density === 'compact' ? 'text-3xl' : 'text-2xl'} font-black tracking-tighter uppercase`}>

          {room.number}

        </span>

        {density !== 'compact' && (

          <div className={`w-2.5 h-2.5 rounded-full bg-current shadow-[0_0_8px_currentColor] ${status === 'occupied' ? 'animate-pulse' : ''}`} />

        )}

      </div>



      <div className={`${density === 'compact' ? 'flex flex-col items-center gap-1' : 'w-full space-y-2'}`}>

        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">

          {status === 'vacant' ? 'Available' : status}

        </span>



        {showGuest && room.currentGuest && (

          <div className="flex items-center gap-2 text-white/80">

            <User size={12} className="shrink-0" />

            <span className="text-[10px] font-bold uppercase truncate max-w-[100px]">{room.currentGuest}</span>

          </div>

        )}



        {showDates && (

          <div className="flex items-center gap-2 text-white/40">

            <Calendar size={10} className="shrink-0" />

            <span className="text-[8px] font-black uppercase tracking-wider">In: 07 Jan</span>

          </div>

        )}



        {showBilling && status === 'occupied' && (

          <div className="flex items-center gap-2 text-[#c5a059]">

            <DollarSign size={10} className="shrink-0" />

            <span className="text-[9px] font-black tracking-tighter">₹2,450 Due</span>

          </div>

        )}

      </div>



      {density === 'compact' && status === 'occupied' && (

        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />

      )}

    </motion.button>

  );

}



function RoomSideSheet({ room, onClose, onUpdateStatus }: { room: RoomDetail, onClose: () => void, onUpdateStatus: any }) {
  const handleWhatsAppShare = () => {
    const message = `Deepa Tourist Home - Digital Receipt\nRoom: ${room.number}\nGuest: ${room.currentGuest}\nDate: ${new Date().toLocaleDateString()}\n\nThank you for choosing Deepa!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleQuickCheckout = () => {
    handleWhatsAppShare();
    onUpdateStatus(room.id, 'cleaning');
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
         <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Room {room.number}</h3>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">{room.type} Suite</p>
         </div>
         <button onClick={onClose} className="p-3 glass rounded-full hover:bg-white/10 transition-all text-white/40 hover:text-white touch-target">
            <X size={24}/>
         </button>
      </div>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
         {/* Status Control */}
         <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Current Lifecycle</p>
            <div className="grid grid-cols-2 gap-3">
               {[ 
                 { id: 'vacant', label: 'Available', icon: <CheckCircle2 size={18}/>, color: 'text-emerald-500' },
                 { id: 'occupied', label: 'Occupied', icon: <User size={18}/>, color: 'text-[#c5a059]' },
                 { id: 'cleaning', label: 'Cleaning', icon: <Brush size={18}/>, color: 'text-gray-400' },
                 { id: 'maintenance', label: 'Service', icon: <Hammer size={18}/>, color: 'text-red-500' }
               ].map(btn => (
                 <button
                   key={btn.id}
                   onClick={() => onUpdateStatus(room.id, btn.id as RoomStatus)}
                   className={`flex items-center gap-3 p-4 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all ${room.status === btn.id ? 'bg-white/10 border-white/20 ring-2 ring-white/5' : ''}`}
                 >
                    <div className={btn.color}>{btn.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{btn.label}</span>
                 </button>
               ))}
            </div>
         </div>

         {room.status === 'occupied' && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6"
           >
              <div className="p-6 glass rounded-3xl border-white/5 space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
                       <User size={24}/>
                    </div>
                    <div>
                       <p className="text-lg font-black text-white uppercase tracking-tight">{room.currentGuest}</p>
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Guest Identity Verified</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl">
                       <p className="text-[8px] font-black text-white/20 uppercase mb-1">Check-in</p>
                       <p className="text-xs font-bold text-white">Today, 10:30 AM</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                       <p className="text-[8px] font-black text-white/20 uppercase mb-1">Stay Period</p>
                       <p className="text-xs font-bold text-white">2 Nights</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <Button 
                   variant="gold"
                   className="w-full h-16 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-2xl shadow-[#c5a059]/20"
                   onClick={handleQuickCheckout}
                   leftIcon={<Share2 size={20}/>}
                 >
                   Quick Check-out
                 </Button>
                 <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                    Checkout triggers WhatsApp invoice sharing logic
                 </p>
              </div>
           </motion.div>
         )}

         {room.status === 'vacant' && (
           <div className="p-10 glass rounded-3xl border-dashed border-white/10 flex flex-col items-center text-center space-y-4">
              <div className="p-5 glass rounded-full text-emerald-500">
                 <UserPlus size={32}/>
              </div>
              <div>
                 <p className="text-lg font-black text-white">Ready for Check-in</p>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Assign primary guest token</p>
              </div>
              <Button onClick={() => {}} variant="secondary" className="px-8 rounded-xl h-12 text-[10px] uppercase font-black">Open Terminal</Button>
           </div>
         )}
      </div>

      <div className="p-8 border-t border-white/5 bg-black/20">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ShieldCheck size={14} className="text-[#c5a059]"/>
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Secured Room Node</span>
            </div>
            <span className="text-[8px] font-black text-white/20 uppercase">v2.4 Atlas</span>
         </div>
      </div>
    </div>
  );
}
