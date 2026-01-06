/**
 * Guest Portal Component
 * Features: Branded Mobile Menu, QR Generator, and Real-time Service Requests.
 * Optimized for guest smartphones.
 */

import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Wine, 
  Utensils, 
  Bell, 
  Smartphone, 
  Search, 
  ChevronRight,
  ShieldCheck,
  XCircle,
  QrCode,
  Droplets,
  ConciergeBell
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { storeSyncManager } from '../utils/storeSync';
import { formatCurrency } from '../utils/formatCurrency';

export default function GuestPortal() {
  const { inventory, rooms } = useBusinessStore();
  const [selectedEntity, setSelectedEntity] = useState('Room 101');

  // --- 1. QR Generation Logic ---
  const guestUrl = `${window.location.origin}/guest-view?id=${selectedEntity.replace(' ', '')}`;

  // --- 2. Live Menu Sync Logic ---
  const guestMenu = useMemo(() => {
    // Filter out brands with 0 stock
    const availableBar = inventory.filter(item => item.currentStock.totalPegs >= 1).map(item => ({
      name: item.productName.split(' ').slice(0, -1).join(' '),
      price: 150, // Mock price
      size: `${item.config.size}ml`
    }));

    const foodMenu = [
      { name: 'Traditional Chicken Curry', price: 280 },
      { name: 'Deepa Special Biriyani', price: 320 },
      { name: 'Kerala Parotta (Set of 2)', price: 40 },
    ];

    return { availableBar, foodMenu };
  }, [inventory]);

  // --- 3. Service Request Logic ---
  const handleRequest = (type: string) => {
    storeSyncManager.broadcast('sale-recorded', {
      type: 'SERVICE_REQUEST',
      room: selectedEntity,
      request: type,
      timestamp: Date.now()
    });
    alert(`${type} request sent! The front desk has been notified. 🙏`);
  };

  return (
    <div className="space-y-10 pb-24 animate-fade-in font-sans">
      {/* Manager View: QR Generator */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="bg-gray-50 p-6 rounded-[2.5rem] border-4 border-white shadow-inner">
            <QRCodeSVG 
              value={guestUrl} 
              size={180} 
              fgColor="#0a3d31" 
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <QrCode className="text-brushed-gold" size={24}/>
              <h3 className="text-2xl font-black text-forest-green font-serif tracking-tight">Portal QR Generator</h3>
            </div>
            <p className="text-gray-500 font-medium">Select a room or table to generate a custom access code for your guests.</p>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {['Room 101', 'Room 102', 'Table 1', 'Table 2'].map(e => (
                <button 
                  key={e}
                  onClick={() => setSelectedEntity(e)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${selectedEntity === e ? 'bg-forest-green text-brushed-gold shadow-lg scale-105' : 'bg-gray-100 text-gray-400'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guest View: Mobile-Optimized Preview */}
      <div className="max-w-md mx-auto bg-[#fcfcf9] rounded-[3.5rem] border-[14px] border-forest-green shadow-2xl overflow-hidden relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-forest-green rounded-b-2xl z-50"></div>
        
        <div className="bg-forest-green p-10 text-center border-b-4 border-brushed-gold">
          <h1 className="text-3xl font-black text-white leading-none font-serif tracking-widest">DEEPA</h1>
          <p className="text-brushed-gold font-bold uppercase tracking-[0.4em] text-[9px] mt-3">Restaurant & Bar</p>
        </div>

        <div className="p-8 space-y-10 h-[600px] overflow-y-auto scrollbar-hide">
          {/* Welcome Message */}
          <div className="text-center">
            <p className="text-xs font-black text-forest-green/40 uppercase tracking-widest mb-1">Welcome to {selectedEntity}</p>
            <h4 className="text-lg font-black text-forest-green">Exclusive Guest Menu</h4>
          </div>

          {/* Bar Selections (Auto-Synced) */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-2">
              <Wine className="text-brushed-gold" size={20}/>
              <h5 className="font-black text-forest-green uppercase text-xs tracking-[0.2em]">The Bar</h5>
            </div>
            
            <div className="space-y-4">
              {guestMenu.availableBar.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between items-start group">
                  <div>
                    <p className="font-black text-forest-green text-sm uppercase">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{item.size}</p>
                  </div>
                  <p className="font-black text-forest-green text-sm">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Service Requests */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-2">
              <ConciergeBell className="text-brushed-gold" size={20}/>
              <h5 className="font-black text-forest-green uppercase text-xs tracking-[0.2em]">Guest Services</h5>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <ServiceBtn label="Water" icon={<Droplets size={18}/>} onClick={() => handleRequest('Water')} />
              <ServiceBtn label="Cleaning" icon={<Smartphone size={18}/>} onClick={() => handleRequest('Housekeeping')} />
            </div>
          </section>
        </div>

        {/* Floating Call Waiter Button */}
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <button 
            onClick={() => handleRequest('Assistance')}
            className="w-full py-5 bg-forest-green text-brushed-gold rounded-3xl font-black uppercase text-xs shadow-2xl hover:bg-forest-green-light active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Bell size={20} className="animate-bounce" />
            Request Assistance
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceBtn({ label, icon, onClick }: { label: string, icon: any, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-brushed-gold transition-all group"
    >
      <div className="text-forest-green group-hover:text-brushed-gold">{icon}</div>
      <span className="text-[10px] font-black text-forest-green uppercase">{label}</span>
    </button>
  );
}
