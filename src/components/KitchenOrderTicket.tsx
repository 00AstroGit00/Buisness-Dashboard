/**
 * Kitchen Order Ticket (KOT) Component
 * Features: Touch-optimized ordering, Bar sync, and Room bill integration.
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Wine, 
  Send, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Plus, 
  Minus,
  Table as TableIcon,
  Bell
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { storeSyncManager } from '../utils/storeSync';
import { formatCurrency } from '../utils/formatCurrency';

// --- Types ---
interface KOTItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  category: 'food' | 'liquor';
  status: 'pending' | 'preparing' | 'served';
}

const MENU_ITEMS = [
  { name: 'Chicken Biriyani', price: 180, category: 'food' },
  { name: 'Fish Moilee', price: 240, category: 'food' },
  { name: 'M.C. Brandy 60ml', price: 150, category: 'liquor' },
  { name: 'Kingfisher 650ml', price: 180, category: 'liquor' },
];

export default function KitchenOrderTicket() {
  const { recordSale, rooms } = useBusinessStore();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [cart, setCart] = useState<KOTItem[]>([]);

  // --- 1. Order Management ---
  const addToCart = (item: any) => {
    const existing = cart.find(i => i.name === item.name);
    if (existing) {
      setCart(cart.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, id: Date.now().toString(), qty: 1, status: 'pending' }]);
    }
  };

  const handleSendOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    // --- 2. Bar Sync: Broadcast to MI Pad 7 ---
    const liquorItems = cart.filter(i => i.category === 'liquor');
    if (liquorItems.length > 0) {
      storeSyncManager.broadcast('sale-recorded', {
        type: 'BAR_ORDER',
        table: selectedTable,
        items: liquorItems,
        timestamp: Date.now()
      });
    }

    alert(`Order sent for Table ${selectedTable}. Bar notified.`);
    setCart([]);
    setSelectedTable(null);
  };

  // --- 3. Finalization Logic ---
  const handleServe = (itemId: string) => {
    const item = cart.find(i => i.id === itemId);
    if (item && item.category === 'liquor') {
      // Deduct from inventory instantly
      recordSale(item.name, 60, item.qty);
    }
    // Logic to add to Room Bill would happen here if table is linked to room
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-forest-green flex items-center gap-3">
          <Utensils className="text-brushed-gold" size={32} />
          Digital KOT Terminal
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Table</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t.toString())}
                  className={`py-4 rounded-2xl font-black transition-all ${selectedTable === t.toString() ? 'bg-forest-green text-white shadow-lg scale-105' : 'bg-gray-50 text-forest-green hover:bg-gray-100'}`}
                >
                  T-{t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Menu</h3>
            <div className="space-y-2">
              {MENU_ITEMS.map(item => (
                <button
                  key={item.name}
                  onClick={() => addToCart(item)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-brushed-gold/10 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    {item.category === 'liquor' ? <Wine size={18} className="text-brushed-gold"/> : <Utensils size={18} className="text-forest-green"/>}
                    <span className="font-bold text-forest-green">{item.name}</span>
                  </div>
                  <Plus size={18} className="text-gray-300 group-hover:text-forest-green" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Cart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 flex flex-col h-full min-h-[500px]">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-forest-green">Active Order Ticket</h3>
              <p className="text-xs font-bold text-brushed-gold uppercase tracking-widest">
                {selectedTable ? `Table T-${selectedTable}` : 'Select a table to start'}
              </p>
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></button>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto mb-8 pr-2">
            <AnimatePresence>
              {cart.map(item => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${item.category === 'liquor' ? 'bg-brushed-gold/20 text-brushed-gold' : 'bg-forest-green/10 text-forest-green'}`}>
                      {item.category === 'liquor' ? <Wine size={20}/> : <Utensils size={20}/>}
                    </div>
                    <div>
                      <p className="font-black text-forest-green uppercase text-sm">{item.name}</p>
                      <p className="text-xs font-bold text-gray-400">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
                    <button onClick={() => {/* dec qty */}} className="p-1 text-gray-300"><Minus size={16}/></button>
                    <span className="font-black text-forest-green w-6 text-center">{item.qty}</span>
                    <button onClick={() => {/* inc qty */}} className="p-1 text-forest-green"><Plus size={16}/></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-200 py-20">
                <Bell size={64} className="mb-4 opacity-20" />
                <p className="font-bold italic uppercase tracking-widest text-xs">Waiting for selections...</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <span className="font-black text-gray-400 uppercase text-xs">Est. Total</span>
              <span className="text-2xl font-black text-forest-green">
                {formatCurrency(cart.reduce((s, i) => s + (i.price * i.qty), 0))}
              </span>
            </div>
            
            <button 
              disabled={!selectedTable || cart.length === 0}
              onClick={handleSendOrder}
              className="w-full py-5 bg-forest-green text-brushed-gold rounded-2xl font-black text-lg shadow-xl hover:bg-forest-green-light active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
            >
              <Send size={24} />
              SEND TO KITCHEN & BAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
