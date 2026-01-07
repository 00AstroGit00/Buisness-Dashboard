/**
 * Analytics Overview Component - 2026 Night Mode UI
 * Features: High-density financial tracking with Recharts Area Charts.
 * Aesthetic: Gold to Transparent gradients, Glassmorphism, Forest Green context.
 */

import { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Activity, ShoppingCart, 
  Users, Receipt, ArrowUpRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';

export default function AnalyticsOverview() {
  const { inventory, rooms, dailySales } = useBusinessStore();

  // Mock data for the gradient area chart
  const performanceData = useMemo(() => {
    return [
      { time: '06:00', revenue: 4500 },
      { time: '09:00', revenue: 12000 },
      { time: '12:00', revenue: 28000 },
      { time: '15:00', revenue: 19000 },
      { time: '18:00', revenue: 42000 },
      { time: '21:00', revenue: 65000 },
      { time: '00:00', revenue: 38000 },
    ];
  }, []);

  const stats = useMemo(() => {
    const totalPegs = inventory.reduce((sum, item) => sum + (item.sales || 0), 0);
    const roomList = Object.values(rooms);
    const occupiedCount = roomList.filter(r => r.status === 'occupied').length;
    const occupancyRate = roomList.length > 0 ? (occupiedCount / roomList.length) * 100 : 0;
    
    return {
      todayPegs: totalPegs,
      occupancy: occupancyRate,
      pendingInvoices: 12 // Mock constant for UI
    };
  }, [inventory, rooms]);

  return (
    <div className="space-y-12 animate-fade-in text-white gpu-accelerated">
      {/* 2026 Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-1.5 bg-gradient-to-r from-brushed-gold to-transparent rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">Live Intelligence</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Performance <span className="gold-gradient-text">Stream</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]"></div>
           <span className="text-xs font-black uppercase tracking-widest text-white/60">Real-time Telemetry Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard 
          title="Today's Peg Sales" 
          value={stats.todayPegs} 
          unit="Units" 
          icon={<ShoppingCart size={24} />} 
          trend="+12%" 
          color="text-brushed-gold"
        />
        <KPICard 
          title="Room Occupancy" 
          value={Math.round(stats.occupancy)} 
          unit="%" 
          icon={<Users size={24} />} 
          trend="+5.4%" 
          color="text-emerald-500"
        />
        <KPICard 
          title="Pending Invoices" 
          value={stats.pendingInvoices} 
          unit="Docs" 
          icon={<Receipt size={24} />} 
          trend="Critical" 
          color="text-red-500"
        />
      </div>

      {/* Main Analytics Area */}
      <div className="grid grid-cols-1 gap-8">
        <Card glass className="p-8 md:p-12 border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Activity size={200} />
          </div>
          
          <CardHeader className="flex-col items-start gap-2 mb-12">
             <Badge className="bg-brushed-gold text-forest-green border-0 font-black uppercase tracking-widest text-[10px]">Revenue Velocity</Badge>
             <CardTitle className="text-3xl font-black uppercase tracking-tighter italic">Intraday <span className="text-brushed-gold">Cashflow</span></CardTitle>
          </CardHeader>

          <div className="h-[400px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="analyticsGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }}
                  hide={typeof window !== 'undefined' && window.innerWidth < 640}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(v) => `₹${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 10, 9, 0.9)', 
                    backdropFilter: 'blur(20px)', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    padding: '20px'
                  }}
                  labelStyle={{ fontWeight: 900, color: '#c5a059', marginBottom: '8px', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c5a059" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#analyticsGold)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
             <div className="p-6 glass rounded-3xl border-white/5">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Peak Volume</p>
                <p className="text-2xl font-black text-white mt-1">21:00</p>
             </div>
             <div className="p-6 glass rounded-3xl border-white/5">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Avg Ticket</p>
                <p className="text-2xl font-black text-brushed-gold mt-1">₹1,450</p>
             </div>
             <div className="p-6 glass rounded-3xl border-white/5">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Growth Rate</p>
                <p className="text-2xl font-black text-green-500 mt-1">+18.2%</p>
             </div>
             <div className="p-6 glass rounded-3xl border-white/5">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">System Load</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-[45%] h-full bg-brushed-gold"></div>
                   </div>
                   <span className="text-xs font-black text-white/40">45%</span>
                </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, unit, icon, trend, color }: any) {
  return (
    <Card glass className="p-8 border-white/5 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className={`p-4 glass rounded-2xl border-white/10 ${color} shadow-2xl`}>
          {icon}
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
           <ArrowUpRight size={12} className={trend === 'Critical' ? 'text-red-500' : 'text-green-500'} />
           <span className={`text-[10px] font-black uppercase ${trend === 'Critical' ? 'text-red-500' : 'text-green-500'}`}>{trend}</span>
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{title}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-5xl font-black text-white tracking-tighter italic">
            <PrivateNumber value={value} format={(v) => formatNumber(v as number, 0)} />
          </h3>
          <span className="text-sm font-black text-white/20 uppercase">{unit}</span>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] transition-colors duration-500"></div>
    </Card>
  );
}
