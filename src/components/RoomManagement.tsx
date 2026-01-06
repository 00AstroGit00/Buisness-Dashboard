/**
 * Room Management Component
 * Features: Visual Room Map, Check-In/Check-Out logic, and Billing integration.
 */

import { useState, useMemo } from 'react';
import { 
  Bed, 
  UserPlus, 
  LogOut, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  X,
  FileText,
  Calculator,
  Search
} from 'lucide-react';
import { useBusinessStore, RoomDetail, RoomStatus } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';

// Mock Room Configuration for Deepa Tourist Home
const ROOM_LIST = [
  { id: '101', number: '101', type: 'AC Double' },
  { id: '102', number: '102', type: 'AC Double' },
  { id: '103', number: '103', type: 'Non-AC Double' },
  { id: '104', number: '104', type: 'Non-AC Double' },
  { id: '201', number: '201', type: 'AC Deluxe' },
  { id: '202', number: '202', type: 'AC Deluxe' },
  { id: '203', number: '203', type: 'AC Single' },
  { id: '204', number: '204', type: 'Non-AC Single' },
];

export default function RoomManagement() {
  const { rooms, updateRoomStatus } = useBusinessStore();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [guestName, setGuestName] = useState('');

  // --- 1. Logic: Auto-Initialize Rooms if empty ---
  useMemo(() => {
    ROOM_LIST.forEach(r => {
      if (!rooms[r.id]) {
        updateRoomStatus(r.id, 'vacant');
      }
    });
  }, []);

  const handleCheckIn = () => {
    if (selectedRoom && guestName) {
      updateRoomStatus(selectedRoom, 'occupied', guestName);
      setIsCheckInOpen(false);
      setGuestName('');
      setSelectedRoom(null);
    }
  };

  const handleCheckOut = (id: string) => {
    const room = rooms[id];
    const confirmMsg = `Generate final bill for ${room?.currentGuest} in Room ${id}? \n\n(Includes Room Rent + Bar Charges)`;
    if (window.confirm(confirmMsg)) {
      updateRoomStatus(id, 'cleaning');
      alert(`Final Bill Generated. Guest checked out. Room ${id} marked for Cleaning.`);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-forest-green flex items-center gap-3">
          <Bed className="text-brushed-gold" size={32} />
          Room Map & Occupancy
        </h2>
        <div className="flex gap-4">
          <Legend label="Occupied" color="bg-forest-green" />
          <Legend label="Cleaning" color="bg-brushed-gold" />
          <Legend label="Vacant" color="bg-white border-2 border-gray-100" />
        </div>
      </div>

      {/* 2. Visual Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ROOM_LIST.map((roomInfo) => {
          const status = rooms[roomInfo.id]?.status || 'vacant';
          const guest = rooms[roomInfo.id]?.currentGuest;

          return (
            <div 
              key={roomInfo.id}
              onClick={() => setSelectedRoom(roomInfo.id)}
              className={`
                relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 transform hover:scale-[1.03]
                ${status === 'occupied' ? 'bg-forest-green border-forest-green text-white shadow-xl' : ''}
                ${status === 'cleaning' ? 'bg-brushed-gold border-brushed-gold text-forest-green shadow-lg animate-pulse' : ''}
                ${status === 'vacant' ? 'bg-white border-gray-100 text-forest-green hover:border-brushed-gold' : ''}
                ${selectedRoom === roomInfo.id ? 'ring-4 ring-brushed-gold/50' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xl font-black ${status === 'occupied' ? 'text-white' : 'text-forest-green'}`}>
                  {roomInfo.number}
                </span>
                <Bed size={20} className={status === 'occupied' ? 'text-brushed-gold' : 'text-gray-200'} />
              </div>
              
              <div className="space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${status === 'occupied' ? 'text-white/60' : 'text-gray-400'}`}>
                  {roomInfo.type}
                </p>
                <p className="text-sm font-black truncate">
                  {status === 'occupied' ? guest : status.toUpperCase()}
                </p>
              </div>

              {/* Action Overlay */}
              {selectedRoom === roomInfo.id && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-2xl">
                  {status === 'vacant' && (
                    <button 
                      onClick={() => setIsCheckInOpen(true)}
                      className="bg-forest-green text-white p-2 rounded-full shadow-lg hover:bg-forest-green-light"
                    >
                      <UserPlus size={20} />
                    </button>
                  )}
                  {status === 'occupied' && (
                    <button 
                      onClick={() => handleCheckOut(roomInfo.id)}
                      className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <LogOut size={20} />
                    </button>
                  )}
                  {status === 'cleaning' && (
                    <button 
                      onClick={() => updateRoomStatus(roomInfo.id, 'vacant')}
                      className="bg-white text-green-600 p-2 rounded-full shadow-lg hover:bg-gray-50"
                    >
                      <ShieldCheck size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Check-In Modal */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="bg-forest-green p-6 flex justify-between items-center text-white">
              <h3 className="text-xl font-black">Guest Check-In: Room {selectedRoom}</h3>
              <button onClick={() => setIsCheckInOpen(false)}><X size={24}/></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-bold"
                  placeholder="Enter guest name..."
                />
              </div>

              <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-xl flex items-center gap-4">
                <FileText className="text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-blue-900">ID Verification</p>
                  <p className="text-xs text-blue-700">Link scan from ./Business-documents</p>
                </div>
              </div>

              <button 
                onClick={handleCheckIn}
                className="w-full py-4 bg-forest-green text-brushed-gold rounded-xl font-black shadow-lg hover:bg-forest-green-light active:scale-95 transition-all"
              >
                Confirm Stay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
        <Clock className="text-brushed-gold" />
        <p className="text-sm font-bold text-forest-green">
          Standard Check-out is 12:00 PM. Final bills automatically include any pending bar/restaurant charges.
        </p>
      </div>
    </div>
  );
}

function Legend({ label, color }: { label: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}
