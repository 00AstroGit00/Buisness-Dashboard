/**
 * Room Management Component (Enhanced)
 * Features: Visual Room Map and Integrated Document Scanner for Guest IDs.
 * Optimized for S23 Ultra and MI Pad 7 camera systems.
 */

import { useState, useRef, useCallback } from 'react';
import { 
  Bed, 
  Camera, 
  X, 
  CheckCircle, 
  UserPlus, 
  User, 
  FileText,
  Clock,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import type { RoomDetail, RoomStatus } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';

// --- Types ---
interface ScannedDoc {
  roomId: string;
  guestName: string;
  base64: string;
}

export default function RoomManagement() {
  const { rooms, updateRoomStatus } = useBusinessStore();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestDocs, setGuestDocs] = useState<Record<string, string>>({}); // roomId -> Base64

  // --- 1. Camera & Canvas Scanner Logic ---
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
      alert('Camera access denied or unavailable on this device.');
      setIsScannerOpen(false);
    }
  };

  const captureID = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // ID Cropping Logic (Center crop)
        const v = videoRef.current;
        const size = Math.min(v.videoWidth, v.videoHeight);
        const x = (v.videoWidth - size) / 2;
        const y = (v.videoHeight - size) / 2;
        
        canvasRef.current.width = 400; // Standard ID thumbnail size
        canvasRef.current.height = 250;
        
        context.drawImage(v, x, y, size, size * 0.625, 0, 0, 400, 250);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
        
        // Stop stream
        const stream = v.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        
        // Save to local state (GuestDocuments buffer)
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

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <h2 className="text-2xl font-black text-forest-green flex items-center gap-3">
        <Bed className="text-brushed-gold" size={32} />
        Room Map & Guest Scanner
      </h2>

      {/* 2. Visual Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Object.values(rooms).map((room) => (
          <div 
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className={`
              relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300
              ${room.status === 'occupied' ? 'bg-forest-green text-white border-forest-green shadow-xl' : ''}
              ${room.status === 'cleaning' ? 'bg-white border-brushed-gold animate-pulse-gold text-forest-green' : ''}
              ${room.status === 'vacant' ? 'bg-white border-gray-100 text-forest-green hover:border-brushed-gold shadow-sm' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xl font-black">{room.number}</span>
              {guestDocs[room.id] && (
                <div className="w-8 h-6 rounded border border-white/20 overflow-hidden shadow-md">
                  <img src={guestDocs[room.id]} className="w-full h-full object-cover" alt="ID" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{room.type}</p>
            <p className="text-xs font-bold truncate mt-1">
              {room.status === 'occupied' ? room.currentGuest : room.status.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Check-In & Scanner Modal */}
      {selectedRoomId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-forest-green p-6 flex justify-between items-center text-white">
              <h3 className="text-xl font-black">Room {rooms[selectedRoomId].number} Details</h3>
              <button onClick={() => setSelectedRoomId(null)}><X size={24}/></button>
            </div>

            <div className="p-8 space-y-6">
              {rooms[selectedRoomId].status === 'vacant' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Guest Full Name</label>
                    <input 
                      autoFocus
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-bold text-lg"
                      placeholder="Enter guest name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Identification (Aadhaar/Passport)</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={startScanner}
                        className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-brushed-gold hover:bg-gray-50 transition-all text-gray-400 hover:text-forest-green"
                      >
                        {guestDocs[selectedRoomId] ? (
                          <div className="relative">
                            <img src={guestDocs[selectedRoomId]} className="h-20 rounded shadow-md" alt="Scanned ID" />
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1"><CheckCircle size={12}/></div>
                          </div>
                        ) : (
                          <>
                            <Camera size={32} className="mb-2" />
                            <span className="text-xs font-black uppercase">Launch Scanner</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckIn}
                    disabled={!guestName || !guestDocs[selectedRoomId]}
                    className="w-full py-4 bg-forest-green text-brushed-gold rounded-xl font-black shadow-lg hover:bg-forest-green-light disabled:opacity-20 transition-all"
                  >
                    CONFIRM CHECK-IN
                  </button>
                </>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle size={64} className="mx-auto text-green-500 mb-4 opacity-20" />
                  <p className="font-bold text-gray-500">Room is occupied by {rooms[selectedRoomId].currentGuest}</p>
                  <button 
                    onClick={() => updateRoomStatus(selectedRoomId, 'cleaning')}
                    className="mt-6 w-full py-4 bg-gray-100 text-red-600 rounded-xl font-black uppercase"
                  >
                    Initiate Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Full-Screen Camera Interface */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          <div className="p-6 flex justify-between items-center text-white">
            <span className="font-black uppercase tracking-widest text-xs">Position ID in Frame</span>
            <button onClick={() => setIsScannerOpen(false)}><X size={24}/></button>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {/* Guide Frame */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full aspect-[1.6/1] border-2 border-brushed-gold rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
            </div>
          </div>

          <div className="p-10 flex justify-center">
            <button 
              onClick={captureID}
              className="w-20 h-20 bg-white rounded-full border-8 border-gray-300 active:scale-90 transition-all shadow-2xl"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <style>{`
        .animate-pulse-gold { animation: pulse-gold 2s infinite; }
        @keyframes pulse-gold {
          0% { border-color: rgba(197, 160, 89, 0.3); }
          50% { border-color: rgba(197, 160, 89, 1); }
          100% { border-color: rgba(197, 160, 89, 0.3); }
        }
      `}</style>
    </div>
  );
}
