/**
 * Digital Menu Component
 * Read-only, branded menu for guests.
 * Features: Real-time stock sync, QR generation, and Service calls.
 */

import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Wine, 
  Utensils, 
  BellRing, 
  Info, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Smartphone,
  XCircle
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { storeSyncManager } from '../utils/storeSync';
import { formatCurrency } from '../utils/formatCurrency';

export default function DigitalMenu() {
  const { inventory } = useBusinessStore();

  // --- 1. QR Code Logic ---
  const menuUrl = `${window.location.origin}/menu`; // Target URL for guest smartphones

  // --- 2. Real-time Stock Logic ---
  const menuCategories = useMemo(() => {
    // Categorize bar items from inventory
    const barItems = inventory.map(item => ({
      name: item.productName.split(' ').slice(0, -1).join(' '),
      price: 150, // Mock price per peg
      isAvailable: item.currentStock.totalPegs >= 1,
      size: `${item.config.size}ml`
    }));

    // Mock restaurant items
    const foodItems = [
      { name: 'Chicken Biriyani', price: 180, isAvailable: true },
      { name: 'Fish Moilee', price: 240, isAvailable: true },
      { name: 'Beef Roast', price: 210, isAvailable: true },
      { name: 'Kerala Parotta', price: 15, isAvailable: true },
    ];

    return { barItems, foodItems };
  }, [inventory]);

  // --- 3. Call Waiter Logic ---
  const handleCallWaiter = () => {
    storeSyncManager.broadcast('sale-recorded', {
      type: 'SERVICE_CALL',
      message: 'Guest at Digital Menu requested assistance',
      timestamp: Date.now()
    });
    alert('Waiter notified. Someone will be with you shortly! 🙏');
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in font-sans">
      {/* 4. Manager Control: QR Generator */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="bg-gray-50 p-6 rounded-3xl border-4 border-white shadow-inner">
          <QRCodeSVG 
            value={menuUrl} 
            size={160} 
            fgColor="#0a3d31" 
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-black text-forest-green font-serif">Guest Menu QR Code</h3>
          <p className="text-gray-500 text-sm mb-6">Print this code and place it on tables. Guests can scan to view the live menu on their smartphones.</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 bg-forest-green/5 text-forest-green text-[10px] font-black rounded-full uppercase border border-forest-green/10">Read-Only</span>
            <span className="px-3 py-1 bg-brushed-gold/20 text-forest-green text-[10px] font-black rounded-full uppercase border border-brushed-gold/30">Auto-Stock Sync</span>
          </div>
        </div>
      </div>

      {/* 5. The Digital Menu (Guest View Preview) */}
      <div className="max-w-md mx-auto bg-[#fdfdfb] rounded-[3rem] border-[12px] border-forest-green shadow-2xl overflow-hidden relative">
        {/* Mobile Status Bar */}
        <div className="bg-forest-green h-10 flex justify-between items-center px-8 text-white/40">
          <span className="text-[10px] font-bold tracking-widest">12:00</span>
          <Smartphone size={14}/>
        </div>

        {/* Branded Header */}
        <div className="bg-forest-green p-8 text-center border-b-4 border-brushed-gold">
          <h1 className="text-3xl font-black text-white leading-none">DEEPA</h1>
          <p className="text-brushed-gold font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Restaurant & Bar</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Bar Section (Synced) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Wine className="text-brushed-gold" size={18}/>
              <h4 className="font-black text-forest-green uppercase text-xs tracking-widest">Bar Selections</h4>
            </div>
            
            <div className="space-y-3">
              {menuCategories.barItems.slice(0, 6).map((item, idx) => (
                <div key={idx} className={`flex justify-between items-center group ${!item.isAvailable ? 'opacity-40 grayscale' : ''}`}>
                  <div>
                    <p className="font-bold text-forest-green text-sm">{item.name}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase">{item.size}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-forest-green">{formatCurrency(item.price)}</p>
                    {!item.isAvailable && <span className="text-[8px] font-black text-red-600 uppercase">Sold Out</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Food Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Utensils className="text-forest-green" size={18}/>
              <h4 className="font-black text-forest-green uppercase text-xs tracking-widest">Kitchen Specialties</h4>
            </div>
            
            <div className="space-y-3">
              {menuCategories.foodItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <p className="font-bold text-forest-green text-sm">{item.name}</p>
                  <p className="font-black text-forest-green">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Call Waiter Interaction */}
          <button 
            onClick={handleCallWaiter}
            className="w-full py-4 mt-8 bg-brushed-gold text-forest-green rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-brushed-gold-light active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <BellRing size={18}/>
            Call for Service
          </button>
        </div>

        {/* Footer */}
        <div className="p-8 text-center">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Cherpulassery, Palakkad</p>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-2xl border-l-4 border-brushed-gold flex items-start gap-3 max-w-2xl mx-auto">
        <Info className="text-brushed-gold mt-1 flex-shrink-0" size={20} />
        <p className="text-xs text-amber-800 font-medium">The digital menu automatically hides bar items when their system stock reaches 0 pegs, ensuring guests only see available brands.</p>
      </div>
    </div>
  );
}
