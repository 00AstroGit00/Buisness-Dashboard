/**
 * Billing System Component - Upgraded UI
 * Professional checkout module for Rooms, Bar, and Restaurant.
 * Features: Search, Auto-Sum, GST Engine, and Specialized Printing.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, Search, Printer, X, Calculator, CreditCard, Banknote, 
  Download, Receipt, MessageCircle, Mail, ChevronRight, User, Hash, 
  ArrowRight, Building2, Table, Wine, Inbox, Zap, Clock, CheckCircle2,
  BellRing, Flame, GlassWater
} from 'lucide-react';
import { usePDF } from 'react-to-pdf';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateBillTax, type ItemCategory } from '../utils/gstCalculator';
import { printInvoice } from '../utils/printReceipt';
import ReceiptTemplate from './ReceiptTemplate';
import PrivateNumber from './PrivateNumber';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';
import { EmptyState } from './EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import BillSlideOver from './BillSlideOver';

// Sound URL for notifications
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

interface KOT {
  id: string;
  tableId: string;
  items: any[];
  status: 'pending' | 'preparing' | 'served';
  timestamp: number;
}

export default function BillingSystem() {
  const { rooms, inventory, recordSale } = useBusinessStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null); 
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [pendingKOTs, setPendingKOTs] = useState<KOT[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Broadcast Channel for Real-time Dispatch
  const dispatchChannel = useMemo(() => new BroadcastChannel('deepa_dispatch'), []);

  const playNotification = useCallback(() => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(e => console.warn('Sound play blocked by browser policy'));
  }, []);

  useEffect(() => {
    dispatchChannel.onmessage = (event) => {
      if (event.data.type === 'NEW_TICKET') {
        setPendingKOTs(prev => [event.data.kot, ...prev]);
        playNotification();
      } else if (event.data.type === 'STATUS_CHANGE') {
        setPendingKOTs(prev => prev.map(k => k.id === event.data.id ? { ...k, status: event.data.status } : k));
      }
    };
    return () => dispatchChannel.close();
  }, [dispatchChannel, playNotification]);

  // Popular Quick-Tap Items
  const popularPegs = useMemo(() => {
    return inventory.slice(0, 6).map(item => ({
      id: item.productName,
      name: item.productName.split(' ')[0],
      fullName: item.productName,
      price: 150, // Mock price
      category: 'liquor' as ItemCategory
    }));
  }, [inventory]);

  const addToOrder = (item: any) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleDispatch = () => {
    if (!selectedEntity || orderItems.length === 0) return;

    const newKOT: KOT = {
      id: `KOT-${Date.now()}`,
      tableId: selectedEntity,
      items: orderItems,
      status: 'pending',
      timestamp: Date.now()
    };

    setPendingKOTs(prev => [newKOT, ...prev]);
    dispatchChannel.postMessage({ type: 'NEW_TICKET', kot: newKOT });
    
    // Deduct stock immediately
    orderItems.forEach(item => {
      if (item.category === 'liquor') {
        recordSale(item.fullName, 60, item.qty);
      }
    });

    setOrderItems([]);
  };

  const updateKOTStatus = (id: string, status: KOT['status']) => {
    setPendingKOTs(prev => prev.map(k => k.id === id ? { ...k, status } : k));
    dispatchChannel.postMessage({ type: 'STATUS_CHANGE', id, status });
  };

  // --- 2. Auto-Sum Logic ---
  const currentBill = useMemo(() => {
    if (!selectedEntity) return null;

    // Pulling pending charges
    const items = [
      { description: 'Room Stay (Daily Rate)', amount: 1500, category: 'room' as ItemCategory, qty: 1 },
      { description: 'Restaurant Order (KOT #442)', amount: 450, category: 'food' as ItemCategory, qty: 1 },
      { description: 'Bar - Pegs (60ml x 2)', amount: 300, category: 'liquor' as ItemCategory, qty: 2 },
    ];

    const guestId = selectedEntity.replace('Room ', '');
    const guestData = selectedEntity.startsWith('Room') ? rooms[guestId] : null;

    return {
      items,
      taxCalc: calculateBillTax(items.map(i => ({ amount: i.amount, category: i.category })), false),
      guestName: guestData?.currentGuest || 'Guest',
      guestPhone: '919876543210' // Mock phone for prototype
    };
  }, [selectedEntity, rooms]);

  const handleWhatsAppShare = () => {
    if (!currentBill) return;
    
    const message = encodeURIComponent(
      `*DEEPA RESTAURANT & TOURIST HOME*\n\n` +
      `Hello ${currentBill.guestName},\n` +
      `Thank you for staying with us! Your bill for ${selectedEntity} is ready.\n\n` +
      `*Total Amount:* ${formatCurrency(currentBill.taxCalc.total)}\n` +
      `*Receipt Link:* [PDF Attached]\n\n` +
      `Visit again soon! 🙏`
    );
    
    window.open(`whatsapp://send?phone=${currentBill.guestPhone}&text=${message}`, '_blank');
  };

  const handlePrintInvoice = () => {
    if (!selectedEntity || !currentBill) return;
    
    printInvoice({
      receiptNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      items: currentBill.items.map(i => ({
        description: i.description,
        qty: i.qty,
        amount: i.amount,
        category: i.category
      })),
      taxSummary: {
        foodGst: currentBill.taxCalc.cgst + currentBill.taxCalc.sgst,
        liquorTax: currentBill.taxCalc.excise || 0
      },
      total: currentBill.taxCalc.total,
      roomNumber: selectedEntity.startsWith('Room') ? selectedEntity.replace('Room ', '') : undefined,
      guestName: currentBill.guestName
    });
  };

  const { toPDF, targetRef } = usePDF({
    filename: `Invoice_${selectedEntity || 'Guest'}.pdf`,
  });

  const handleEntitySelect = (id: string) => {
    setSelectedEntity(id);
    setSearchQuery('');
  };

  const filteredEntities = useMemo(() => {
    const all = [
      ...Object.keys(rooms).map(id => ({ id: `Room ${id}`, type: 'room' })),
      { id: 'Table 1', type: 'restaurant' },
      { id: 'Table 2', type: 'restaurant' },
      { id: 'Bar Counter', type: 'bar' }
    ];
    return all.filter(e => e.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rooms, searchQuery]);

  return (
    <div className="space-y-12 animate-fade-in text-white" ref={targetRef}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-1.5 bg-gradient-to-r from-brushed-gold to-transparent rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">POS Terminal #01</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Checkout <span className="gold-gradient-text">Matrix</span>
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                <Receipt size={16} className="text-brushed-gold" />
                <span className="text-xs font-black uppercase tracking-widest text-white/60">GST Engine v4.2</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card glass className="p-8 border-white/5">
             <div className="relative group mb-10">
               <div className="absolute inset-0 bg-gradient-to-r from-brushed-gold/10 to-transparent blur-2xl group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
               <Input 
                 placeholder="Search Rooms, Tables, or Guest IDs..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 leftIcon={<Search className="text-brushed-gold" size={24} />}
                 className="py-6 px-8 rounded-3xl border-white/5 glass relative z-10 font-bold text-xl placeholder:text-white/10"
               />
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
               {filteredEntities.map(entity => {
                 const isSelected = selectedEntity === entity.id;
                 return (
                   <button
                     key={entity.id}
                     onClick={() => handleEntitySelect(entity.id)}
                     className={`
                       p-8 rounded-[2rem] border transition-all duration-500 relative group overflow-hidden flex flex-col items-center text-center gap-4
                       ${isSelected 
                         ? 'bg-brushed-gold border-brushed-gold shadow-2xl scale-[1.05]' 
                         : 'bg-white/5 border-white/5 hover:border-white/20'
                       }
                     `}
                   >
                     <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${isSelected ? 'bg-forest-green text-white shadow-xl' : 'bg-white/5 text-brushed-gold'}`}>
                        {entity.type === 'room' ? <Building2 size={28} /> : 
                         entity.type === 'restaurant' ? <Table size={28} /> : 
                         <Wine size={28} />}
                     </div>
                     <div>
                        <div className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1 ${isSelected ? 'text-forest-green/40' : 'text-white/20'}`}>
                           {entity.type}
                        </div>
                        <div className={`font-black text-lg tracking-tighter uppercase ${isSelected ? 'text-forest-green' : 'text-white'}`}>
                           {entity.id}
                        </div>
                     </div>
                   </button>
                 );
               })}
             </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card glass className="p-8 border-white/5">
                <div className="flex justify-between items-center mb-8">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Rapid Selection Grid</p>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Live Inventory Linked</span>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {popularPegs.map(peg => (
                     <button 
                       key={peg.id}
                       onClick={() => addToOrder(peg)}
                       className="p-4 rounded-2xl glass border border-white/5 hover:border-brushed-gold/40 transition-all flex flex-col items-center gap-2 group active:scale-95 touch-target"
                     >
                        <Wine size={20} className="text-brushed-gold group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase truncate w-full text-center">{peg.name}</span>
                        <span className="text-[8px] font-bold text-white/20">₹{peg.price}</span>
                     </button>
                   ))}
                </div>
             </Card>

             <Card glass className="p-8 border-white/5 flex flex-col min-h-[400px]">
                <div className="flex items-center gap-3 mb-8">
                   <ShoppingCart size={20} className="text-brushed-gold" />
                   <h3 className="text-sm font-black uppercase tracking-widest">Order Staging</h3>
                </div>

                {orderItems.length > 0 ? (
                  <div className="flex-1 flex flex-col">
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                       {orderItems.map(item => (
                         <div key={item.id} className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                            <div className="flex items-center gap-3">
                               <span className="w-8 h-8 rounded-lg glass border-white/10 flex items-center justify-center font-black text-xs text-brushed-gold">{item.qty}x</span>
                               <span className="text-xs font-black uppercase tracking-tight">{item.name}</span>
                            </div>
                            <button onClick={() => setOrderItems(prev => prev.filter(i => i.id !== item.id))} className="text-white/20 hover:text-red-500 transition-colors">
                               <X size={14} />
                            </button>
                         </div>
                       ))}
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-white/5">
                       <Button 
                        variant="gold" 
                        onClick={handleDispatch}
                        disabled={!selectedEntity}
                        className="w-full h-14 rounded-xl uppercase font-black tracking-widest text-[10px]"
                        leftIcon={<Flame size={16} />}
                       >
                         Dispatch to Bar/Kitchen
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/10 gap-4">
                     <GlassWater size={48} className="opacity-20" />
                     <p className="text-[8px] font-black uppercase tracking-[0.3em]">No items staged</p>
                  </div>
                )}
             </Card>
          </div>

          <Card glass className="p-8 border-white/5 flex flex-col min-h-[400px]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <BellRing size={20} className="text-emerald-500" />
                   <h3 className="text-sm font-black uppercase tracking-widest">Live Dispatch</h3>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[8px] font-black">{pendingKOTs.length} Active</Badge>
             </div>

             <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                {pendingKOTs.map(kot => (
                  <div key={kot.id} className="p-5 glass rounded-2xl border-white/5 space-y-4 relative overflow-hidden group">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{kot.tableId}</p>
                           <p className="text-[8px] font-bold text-white/10 uppercase mt-0.5">{new Date(kot.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <Badge className={`
                           border-0 text-[8px] font-black uppercase tracking-widest
                           ${kot.status === 'pending' ? 'bg-red-500/10 text-red-500' : 
                             kot.status === 'preparing' ? 'bg-amber-500/10 text-amber-500' : 
                             'bg-emerald-500/10 text-emerald-500'}
                        `}>
                           {kot.status}
                        </Badge>
                     </div>
                     
                     <div className="space-y-1">
                        {kot.items.map((item, i) => (
                          <p key={i} className="text-[10px] font-bold text-white/60 uppercase">{item.qty}x {item.name}</p>
                        ))}
                     </div>

                     <div className="flex gap-2 pt-2">
                        {kot.status === 'pending' && (
                          <button onClick={() => updateKOTStatus(kot.id, 'preparing')} className="flex-1 py-2 glass rounded-lg text-[8px] font-black uppercase text-white/40 hover:bg-amber-500/20 hover:text-amber-500 transition-all">Start</button>
                        )}
                        {kot.status === 'preparing' && (
                          <button onClick={() => updateKOTStatus(kot.id, 'served')} className="flex-1 py-2 glass rounded-lg text-[8px] font-black uppercase text-white/40 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all">Serve</button>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </Card>

          {selectedEntity && currentBill && (
            <Card glass className="border-white/5 p-10 animate-slide-in-bottom">
               <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">Active <span className="text-brushed-gold">Session</span></h3>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Resource: {selectedEntity}</p>
                  </div>
                  <div className="flex items-center gap-5">
                     <div className="text-right">
                        <p className="text-sm font-black text-white uppercase">{currentBill.guestName}</p>
                        <p className="text-[9px] font-black text-white/20 uppercase mt-1 tracking-widest">Guest Node Verified</p>
                     </div>
                     <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-brushed-gold border-white/10 shadow-2xl">
                        <User size={28} />
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  {currentBill.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 glass rounded-3xl border-white/5 group hover:border-white/20 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center font-black text-sm text-brushed-gold shadow-xl">
                             {item.qty}x
                          </div>
                          <div>
                             <p className="font-black text-lg text-white tracking-tight uppercase">{item.description}</p>
                             <Badge className="bg-white/5 text-white/40 text-[9px] border-white/10 uppercase tracking-widest mt-1 font-black">{item.category}</Badge>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-xl text-white font-mono">{formatCurrency(item.amount)}</p>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Base Rate</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          )}

          {!selectedEntity && !searchQuery && !orderItems.length && (
            <EmptyState 
              icon={Inbox}
              title="No Terminal Selected"
              description="Identify a room or table to initialize the billing protocol and calculate fiscal liabilities."
            />
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card glass className="border-white/5 bg-[#0a3d31]/40 text-white p-10 relative overflow-hidden group min-h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Calculator size={150} />
            </div>
            
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-10 relative z-10">Payment Protocol</h3>
            
            {currentBill ? (
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                  <span className="text-white/40">Subtotal</span>
                  <span className="font-mono text-white/80">{formatCurrency(currentBill.taxCalc.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                  <span className="text-white/40">Fiscal Surcharge</span>
                  <span className="text-brushed-gold font-mono">+{formatCurrency(currentBill.taxCalc.cgst + currentBill.taxCalc.sgst + (currentBill.taxCalc.excise || 0))}</span>
                </div>
                <div className="pt-10 border-t border-white/5 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Settlement Total</span>
                  <div className="text-5xl font-black text-white tracking-tighter italic">
                    <PrivateNumber value={currentBill.taxCalc.total} format={formatCurrency} />
                  </div>
                </div>

                <div className="pt-10 space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Transfer Channel</p>
                   <div className="grid grid-cols-3 gap-3">
                      {(['cash', 'card', 'upi'] as const).map(m => (
                        <button 
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`
                            py-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-[0.2em]
                            ${paymentMethod === m 
                              ? 'bg-brushed-gold border-brushed-gold text-forest-green shadow-[0_0_20px_rgba(197,160,89,0.3)]' 
                              : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}
                          `}
                        >
                          {m}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 space-y-6 relative z-10">
                 <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto border-white/5 shadow-2xl">
                    <Receipt size={40} className="text-white/10" />
                 </div>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Awaiting Resource Link</p>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="secondary" 
                disabled={!selectedEntity}
                onClick={handleWhatsAppShare}
                className="rounded-[1.5rem] border-white/5 h-16 uppercase tracking-widest text-[10px]"
                leftIcon={<MessageCircle size={20} className="text-[#25D366]" />}
              >
                WhatsApp
              </Button>
              <Button 
                variant="secondary"
                disabled={!selectedEntity}
                onClick={() => toPDF()}
                className="rounded-[1.5rem] border-white/5 h-16 uppercase tracking-widest text-[10px]"
                leftIcon={<Download size={20} className="text-blue-500" />}
              >
                Snapshot
              </Button>
            </div>
            
            <Button 
              variant="gold"
              disabled={!selectedEntity}
              onClick={handlePrintInvoice}
              className="w-full h-20 rounded-[2rem] shadow-2xl shadow-brushed-gold/20 text-xl font-black tracking-widest uppercase italic"
              leftIcon={<Printer size={24}/>}
            >
              Finalize & Commit
            </Button>

            <div className="pt-6 flex items-center justify-between px-4 opacity-20">
               <span className="text-[8px] font-black uppercase tracking-[0.3em]">Encrypted Handshake: RSA-4096</span>
               <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}