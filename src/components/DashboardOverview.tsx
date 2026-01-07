/**
 * Dashboard Overview - 2026 Interactive Hospitality Experience
 * Features: Framer Motion layoutId expansions, Glassmorphism, and Real-time Metrics.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, DollarSign, BellRing, AlertTriangle, 
  X, ArrowUpRight, TrendingUp, Package, 
  Building2, CheckCircle2, Clock, History
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';
import { Card } from './Card';
import { Badge } from './Badge';

interface MetricDetailProps {
  id: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DashboardOverview() {
  const { rooms, inventory, dailySales } = useBusinessStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // --- 1. Real-time Metrics Calculation ---
  const metrics = useMemo(() => {
    const roomList = Object.values(rooms);
    const occupiedCount = roomList.filter(r => r.status === 'occupied').length;
    const occupancyRate = roomList.length > 0 ? (occupiedCount / roomList.length) * 100 : 0;

    const salesArr = Object.values(dailySales);
    const totalBarSales = salesArr.reduce((sum, day) => sum + (day.barSales || 0), 0);
    
    const stockAlerts = inventory.filter(item => item.currentStock.totalBottles < 3).length;

    return {
      occupancy: { 
        value: `${Math.round(occupancyRate)}%`, 
        label: 'Live Occupancy', 
        icon: <Users size={24} />,
        color: 'text-emerald-500',
        detail: `${occupiedCount} Rooms Active out of ${roomList.length}`
      },
      revenue: { 
        value: formatCurrency(totalBarSales), 
        label: 'Bar Revenue', 
        icon: <DollarSign size={24} />,
        color: 'text-brushed-gold',
        detail: 'Total aggregated bar collections for current cycle'
      },
      kots: { 
        value: '12', // Mock pending KOTs
        label: 'Pending KOTs', 
        icon: <BellRing size={24} />,
        color: 'text-amber-500',
        detail: 'Active tickets in dispatch pipeline'
      },
      alerts: { 
        value: stockAlerts.toString(), 
        label: 'Stock Alerts', 
        icon: <AlertTriangle size={24} />,
        color: 'text-red-500',
        detail: 'Critical items requiring immediate restock'
      }
    };
  }, [rooms, inventory, dailySales]);

  return (
    <div className="space-y-12 animate-fade-in text-white relative min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-1.5 bg-gradient-to-r from-brushed-gold to-transparent rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">Operational Pulse</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            Deepa <span className="gold-gradient-text">Live</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]"></div>
           <span className="text-xs font-black uppercase tracking-widest text-white/60">System Synced & Online</span>
        </div>
      </div>

      {/* Metric Grid - 2x2 on Desktop, Stack on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
        {Object.entries(metrics).map(([id, metric]) => (
          <motion.div
            key={id}
            layoutId={`card-${id}`}
            onClick={() => setExpandedId(id)}
            className="cursor-pointer group"
          >
            <Card glass className="p-10 border-brushed-gold/30 bg-[#0a3d31]/10 hover:bg-[#0a3d31]/20 transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  {metric.icon}
               </div>
               
               <div className="flex justify-between items-start mb-12">
                  <div className={`p-4 glass rounded-2xl border-white/10 ${metric.color} shadow-2xl group-hover:scale-110 transition-transform`}>
                    {metric.icon}
                  </div>
                  <div className="w-10 h-10 rounded-full glass border-white/5 flex items-center justify-center text-white/10 group-hover:text-brushed-gold group-hover:border-brushed-gold/20 transition-all">
                     <ArrowUpRight size={20} />
                  </div>
               </div>

               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{metric.label}</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter italic group-hover:gold-gradient-text transition-all">
                    {id === 'revenue' ? <PrivateNumber value={metric.value} format={(v) => v.toString()} /> : metric.value}
                  </h3>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Expanded Modal Overlay */}
      <AnimatePresence>
        {expandedId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              layoutId={`card-${expandedId}`}
              className="relative w-full max-w-3xl glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col bg-[#050a09]"
            >
              <div className="bg-gradient-to-br from-forest-green to-black p-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                    {metrics[expandedId as keyof typeof metrics].icon}
                 </div>
                 <div className="flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="text-4xl font-black tracking-tighter uppercase italic">{metrics[expandedId as keyof typeof metrics].label}</h3>
                      <p className="text-[10px] font-black text-brushed-gold uppercase tracking-[0.5em] mt-3">Extended Intelligence View</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setExpandedId(null); }} 
                      className="p-4 glass rounded-full hover:bg-white/10 text-white transition-colors"
                    >
                       <X size={28}/>
                    </button>
                 </div>
              </div>

              <div className="p-12 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 glass rounded-[2rem] border-white/5 space-y-4">
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Key Metric</p>
                       <p className="text-4xl font-black text-white italic">{metrics[expandedId as keyof typeof metrics].value}</p>
                       <p className="text-xs font-bold text-white/40 uppercase leading-relaxed">{metrics[expandedId as keyof typeof metrics].detail}</p>
                    </div>
                    
                    <div className="p-8 glass rounded-[2rem] border-white/5 space-y-6">
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Health Indicator</p>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-green-500">
                             <CheckCircle2 size={24} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-white uppercase">Nominal</p>
                             <p className="text-[10px] font-bold text-white/20 uppercase">Within Parameters</p>
                          </div>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-brushed-gold"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] px-4">Historical Reference</p>
                    <div className="space-y-2">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="flex items-center justify-between p-6 glass rounded-2xl border-white/5 group hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/20">
                                  <History size={18} />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-white/80 uppercase">Cycle Ref #{1024 - i}</p>
                                  <p className="text-[9px] font-bold text-white/20 uppercase">Jan 0{8 - i}, 2026</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-brushed-gold italic">Verified</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20 text-center">
                 <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Deepa Intelligent Ops Terminal v4.2</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
