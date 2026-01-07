/**
 * Room Management Component - 2026 Overhauled UI
 * Features: Visual Room Map with Swipe-to-Clean and Integrated ID Scanner.
 * Optimized for S23 Ultra and MI Pad 7.
 */

import { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Bed, Camera, X, CheckCircle2, UserPlus, User, FileText,
  Clock, LogOut, ShieldCheck, RefreshCw, Image as ImageIcon,
  Building2, AlertCircle, ChevronRight, Info, Brush
} from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useBusinessStore } from '../store/useBusinessStore';
import type { RoomDetail, RoomStatus } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

export default function RoomManagement() {
  const { rooms, updateRoomStatus } = useBusinessStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestDocs, setGuestDocs] = useState<Record<string, string>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanner = async () => {
    setIsScannerOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Camera access denied or unavailable.');
      setIsScannerOpen(false);
    }
  };

  const captureID = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const v = videoRef.current;
        const size = Math.min(v.videoWidth, v.videoHeight);
        const x = (v.videoWidth - size) / 2;
        const y = (v.videoHeight - size) / 2;
        
        canvasRef.current.width = 400;
        canvasRef.current.height = 250;
        
        context.drawImage(v, x, y, size, size * 0.625, 0, 0, 400, 250);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
        
        const stream = v.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        
        setGuestDocs({ ...guestDocs, [selectedRoomId!]: base64 });
        setIsScannerOpen(false);
      }
    }
  };

  const handleCheckIn = () => {
    if (selectedRoomId && guestName) {
      updateRoomStatus(selectedRoomId, 'occupied', guestName);
      setGuestName('');
      setSelectedRoomId(null);
    }
  };

  const roomStats = useMemo(() => {
    const all = Object.values(rooms);
    return {
      total: all.length,
      vacant: all.filter(r => r.status === 'vacant').length,
      occupied: all.filter(r => r.status === 'occupied').length,
      cleaning: all.filter(r => r.status === 'cleaning').length,
    };
  }, [rooms]);

  return (
    <div className="space-y-12 animate-fade-in text-white gpu-accelerated">
      {/* 2026 Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-1.5 bg-gradient-to-r from-brushed-gold to-transparent rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">Floor Intelligence</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Hospitality <span className="gold-gradient-text">Architecture</span>
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                <ShieldCheck size={16} className="text-brushed-gold" />
                <span className="text-xs font-black uppercase tracking-widest text-white/60">ID Vault Secured</span>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <Card glass padded={false} className="p-5 flex items-center gap-6 min-w-[160px] border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                 <Bed size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Vacant</p>
                 <p className="text-2xl font-black text-white">{roomStats.vacant}</p>
              </div>
           </Card>
           <Card glass padded={false} className="p-5 flex items-center gap-6 min-w-[160px] border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-brushed-gold/10 text-brushed-gold flex items-center justify-center border border-brushed-gold/20 shadow-[0_0_15px_rgba(197,160,89,0.2)]">
                 <User size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Occupied</p>
                 <p className="text-2xl font-black text-white">{roomStats.occupied}</p>
              </div>
           </Card>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center gap-3 mb-8">
         <Info size={16} className="text-brushed-gold" />
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
           Mobile Tip: Swipe any room card left to mark as "Cleaning" or right for "Quick View"
         </p>
      </div>

      {/* Visual Room Grid with Swipe to Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {Object.values(rooms).map((room) => (
          <RoomCard 
            key={room.id} 
            room={room} 
            guestDoc={guestDocs[room.id]} 
            onAction={() => updateRoomStatus(room.id, 'cleaning')} 
            onClick={() => setSelectedRoomId(room.id)} 
          />
        ))}
      </div>

      {/* Modal & Camera (Integrated) */}
      <AnimatePresence>
        {selectedRoomId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoomId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="bg-gradient-to-br from-forest-green to-black p-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><Building2 size={150} /></div>
                 <div className="flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter uppercase">Room {rooms[selectedRoomId].number}</h3>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Check-in Protocol v4.2</p>
                    </div>
                    <button onClick={() => setSelectedRoomId(null)} className="p-3 glass rounded-full hover:bg-white/10 text-white transition-colors">
                       <X size={24}/>
                    </button>
                 </div>
              </div>

              <div className="p-10 space-y-10">
                {rooms[selectedRoomId].status === 'vacant' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         <Input 
                           label="Primary Guest Name"
                           autoFocus
                           placeholder="Enter full legal name..."
                           value={guestName}
                           onChange={e => setGuestName(e.target.value)}
                           className="py-5 font-black text-xl glass border-white/5 focus:border-brushed-gold text-white"
                         />
                         
                         <div className="bg-brushed-gold/5 p-5 rounded-[2rem] border border-brushed-gold/10 flex gap-4">
                            <Info size={20} className="text-brushed-gold shrink-0 mt-1" />
                            <p className="text-[10px] font-black text-brushed-gold/60 leading-relaxed uppercase tracking-widest">
                               Compliance requires high-resolution ID scan for digital vault storage.
                            </p>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2">Identity Token</label>
                        <button 
                          onClick={startScanner}
                          className={`
                            w-full flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[2.5rem] transition-all duration-500 group
                            ${guestDocs[selectedRoomId] 
                              ? 'border-brushed-gold bg-brushed-gold/10' 
                              : 'border-white/10 hover:border-brushed-gold hover:bg-white/5'
                            }
                          `}
                        >
                          {guestDocs[selectedRoomId] ? (
                            <div className="relative">
                              <img src={guestDocs[selectedRoomId]} className="h-32 rounded-2xl shadow-2xl border-2 border-white/20" alt="ID" />
                              <div className="absolute -top-4 -right-4 bg-brushed-gold text-forest-green rounded-full p-2 shadow-xl border-4 border-[#050a09]">
                                 <CheckCircle2 size={18}/>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="p-5 glass rounded-2xl mb-4 group-hover:bg-brushed-gold group-hover:text-forest-green transition-all">
                                 <Camera size={40} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-white">Initialize Scanner</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <Button 
                      variant="gold"
                      onClick={handleCheckIn}
                      disabled={!guestName || !guestDocs[selectedRoomId]}
                      className="w-full h-20 rounded-[2rem] font-black text-xl tracking-widest uppercase shadow-2xl shadow-brushed-gold/20"
                      leftIcon={<UserPlus size={24} />}
                    >
                      Authorize Occupancy
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12 space-y-8">
                    <div className="w-32 h-32 glass rounded-full flex items-center justify-center mx-auto border-white/5 shadow-2xl">
                       <User size={64} className="text-brushed-gold/20" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-white tracking-tighter uppercase">{rooms[selectedRoomId].currentGuest}</h4>
                      <p className="text-[10px] font-black text-brushed-gold uppercase tracking-[0.4em] mt-3">Primary Occupant Verified</p>
                    </div>
                    
                    <div className="flex gap-6">
                       <Button 
                         variant="secondary" 
                         className="flex-1 rounded-[1.5rem] h-16"
                         leftIcon={<RefreshCw size={20} />}
                         onClick={() => setSelectedRoomId(null)}
                       >
                         Stay Extension
                       </Button>
                       <Button 
                         variant="danger" 
                         className="flex-1 rounded-[1.5rem] h-16"
                         leftIcon={<LogOut size={20} />}
                         onClick={() => { updateRoomStatus(selectedRoomId!, 'cleaning'); setSelectedRoomId(null); }}
                       >
                         Checkout
                       </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Camera Interface */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black flex flex-col"
          >
            <div className="p-10 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                 <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
                 <span className="font-black uppercase tracking-[0.5em] text-xs">Aadhaar Stream Active</span>
              </div>
              <button onClick={() => setIsScannerOpen(false)} className="p-4 glass rounded-full text-white">
                 <X size={32}/>
              </button>
            </div>
            
            <div className="flex-1 relative overflow-hidden px-10">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-[4rem] border border-white/10" />
              <div className="absolute inset-0 flex items-center justify-center p-16">
                <div className="w-full max-w-xl aspect-[1.6/1] border-4 border-brushed-gold/40 rounded-[3rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] relative overflow-hidden">
                   <div className="absolute -top-12 left-0 right-0 text-center">
                      <p className="text-brushed-gold font-black uppercase tracking-[0.4em] text-[10px]">Align Document in Viewport</p>
                   </div>
                   <div className="absolute left-0 top-0 w-full h-1 bg-brushed-gold shadow-[0_0_30px_rgba(197,160,89,1)] animate-scan"></div>
                </div>
              </div>
            </div>

            <div className="p-16 flex flex-col items-center gap-8">
              <button 
                onClick={captureID}
                className="w-24 h-24 bg-white rounded-full border-[8px] border-white/10 p-1 active:scale-90 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] group"
              >
                 <div className="w-full h-full rounded-full border-2 border-black/5 group-hover:bg-brushed-gold/20 transition-all"></div>
              </button>
              <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Trigger Capture</p>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .animate-scan { animation: scan 3s linear infinite; }
      `}} />
    </div>
  );
}

function RoomCard({ room, guestDoc, onAction, onClick }: { room: RoomDetail, guestDoc?: string, onAction: () => void, onClick: () => void }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const background = useTransform(x, [-100, 0, 100], ['rgba(197, 160, 89, 0.1)', 'rgba(255, 255, 255, 0.02)', 'rgba(34, 197, 94, 0.1)']);
  
  const isOccupied = room.status === 'occupied';
  const isCleaning = room.status === 'cleaning';
  const isVacant = room.status === 'vacant';

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -80) onAction();
    else if (info.offset.x > 80) onClick();
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-between px-10 text-white/10 pointer-events-none">
         <div className="flex flex-col items-center gap-2">
            <CheckCircle2 size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest">Verify</span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <Brush size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sanitize</span>
         </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, opacity, background }}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        className={`
          relative z-10 cursor-pointer rounded-[2.5rem] p-10 border transition-all duration-500 group overflow-hidden h-64 flex flex-col justify-between backdrop-blur-3xl gpu-accelerated
          ${isOccupied ? 'border-brushed-gold/40 shadow-2xl' : 'border-white/5'}
          ${isCleaning ? 'border-yellow-500/20' : ''}
          ${isVacant ? 'hover:border-white/20 shadow-xl' : ''}
        `}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <span className="text-5xl font-black tracking-tighter text-white uppercase italic">
              {room.number}
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
              {room.type}
            </p>
          </div>
          
          {guestDoc ? (
            <div className="w-20 h-12 rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all group-hover:scale-110">
              <img src={guestDoc} className="w-full h-full object-cover" alt="ID" />
            </div>
          ) : (
            <div className="p-4 glass rounded-2xl border border-white/5 group-hover:border-brushed-gold/20 transition-all">
               <Bed size={24} className={isOccupied ? 'text-brushed-gold' : 'text-white/5'} />
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          {isOccupied ? (
            <div className="space-y-2">
               <p className="text-sm font-black text-white truncate max-w-[140px] uppercase tracking-tight">{room.currentGuest}</p>
               <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                  <Clock size={12} className="text-brushed-gold" />
                  Live Occupancy
               </div>
            </div>
          ) : (
            <Badge 
              variant={isCleaning ? 'gold' : 'secondary'} 
              className={`text-[10px] border-0 uppercase font-black px-5 py-2 rounded-full ${isCleaning ? 'animate-pulse bg-yellow-500/10 text-yellow-500' : ''}`}
            >
              {isCleaning ? 'Sanitizing' : 'Ready'}
            </Badge>
          )}
          
          <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:text-brushed-gold group-hover:border-brushed-gold/20 transition-all shadow-xl group-hover:translate-x-1">
             <ChevronRight size={20} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}