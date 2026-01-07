/**
 * Deepa Brain Intelligence Module - 2026 AI Suite
 * Features: Velocity Analysis, Peak Hour Detection, and Dynamic Markups.
 * Visualization: Radar Chart for Revenue Balance.
 */

import { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Cell 
} from 'recharts';
import { 
  Brain, Zap, TrendingUp, TrendingDown, Clock, 
  ArrowUpRight, Target, Sparkles, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBusinessStore } from '../store/useBusinessStore';
import { transactionHistory } from '../store/transactionHistory';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';

export default function DeepaBrain() {
  const { inventory, rooms, dailySales } = useBusinessStore();
  const transactions = useMemo(() => transactionHistory.getAllTransactions(), []);

  // 1. Velocity Analysis (Last 30 Days)
  const velocityData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const counts = new Map<string, number>();
    transactions.forEach(t => {
      if (new Date(t.timestamp) > thirtyDaysAgo && t.type === 'sale') {
        counts.set(t.productId, (counts.get(t.productId) || 0) + 1);
      }
    });

    const sorted = Array.from(counts.entries())
      .map(([id, count]) => {
        const item = inventory.find(i => i.productName.replace(/\s+/g, '_') + '_' + i.config.size === id || i.productName === id);
        return { name: item?.productName || id, count };
      })
      .sort((a, b) => b.count - a.count);

    return {
      fastest: sorted.slice(0, 3),
      slowest: sorted.reverse().slice(0, 3)
    };
  }, [transactions, inventory]);

  // 2. Peak Hour Detection
  const peakHourData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    transactions.forEach(t => {
      if (t.type === 'sale') {
        const hour = new Date(t.timestamp).getHours();
        hours[hour].count++;
      }
    });
    return hours.filter(h => h.count > 0 || (parseInt(h.hour) > 9 && parseInt(h.hour) < 23));
  }, [transactions]);

  // 3. Radar Data (Revenue Balance)
  const radarData = useMemo(() => {
    // Aggregating from last 7 days of daily sales
    const salesArr = Object.values(dailySales);
    const totals = salesArr.reduce((acc, curr) => ({
      rooms: acc.rooms + curr.roomRent,
      bar: acc.bar + curr.barSales,
      food: acc.food + curr.restaurantBills
    }), { rooms: 0, bar: 0, food: 0 });

    const max = Math.max(totals.rooms, totals.bar, totals.food, 1);

    return [
      { subject: 'Room Revenue', A: (totals.rooms / max) * 100, fullMark: 100 },
      { subject: 'Bar Sales', A: (totals.bar / max) * 100, fullMark: 100 },
      { subject: 'Food & Dining', A: (totals.food / max) * 100, fullMark: 100 },
    ];
  }, [dailySales]);

  // 4. Dynamic Markup Logic
  const smartSuggestions = useMemo(() => {
    const isWeekend = [0, 6].includes(new Date().getDay());
    const suggestions = [];

    if (isWeekend) {
      suggestions.push({
        item: 'Weekend Premium',
        impact: '+15% Markup',
        reason: 'High demand weekend spike detected',
        type: 'markup'
      });
    }

    velocityData.fastest.forEach(item => {
      suggestions.push({
        item: item.name,
        impact: '+5% Dynamic',
        reason: 'Velocity exceeded 30-day average',
        type: 'markup'
      });
    });

    return suggestions.slice(0, 3);
  }, [velocityData]);

  return (
    <div className="space-y-12 animate-fade-in text-white pb-20">
      {/* Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 glass rounded-lg border-white/10 text-brushed-gold animate-pulse">
               <Brain size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brushed-gold/60">Neural Engine v2.0</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            Deepa <span className="gold-gradient-text">Intelligence</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl">
           <Zap size={16} className="text-brushed-gold" />
           <span className="text-xs font-black uppercase tracking-widest text-white/60">AI Recommendations Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart: Revenue Balance */}
        <Card glass className="lg:col-span-5 p-8 flex flex-col items-center">
           <CardHeader className="w-full flex-col items-start gap-2 mb-8">
              <Badge className="bg-brushed-gold text-forest-green border-0 font-black uppercase text-[8px] tracking-[0.2em]">Revenue Balance</Badge>
              <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Yield <span className="text-brushed-gold">Geometry</span></CardTitle>
           </CardHeader>
           
           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                  <Radar
                    name="Revenue"
                    dataKey="A"
                    stroke="#c5a059"
                    fill="#c5a059"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-8 p-5 glass rounded-[2rem] border-white/5 w-full">
              <p className="text-[10px] font-black uppercase text-white/20 tracking-widest text-center mb-4">Strategic Balance Score</p>
              <div className="flex justify-around items-center">
                 <div className="text-center">
                    <p className="text-lg font-black text-white italic">84</p>
                    <p className="text-[8px] font-bold text-white/40 uppercase">Efficiency</p>
                 </div>
                 <div className="w-px h-8 bg-white/5"></div>
                 <div className="text-center">
                    <p className="text-lg font-black text-brushed-gold italic">A+</p>
                    <p className="text-[8px] font-bold text-white/40 uppercase">Grade</p>
                 </div>
              </div>
           </div>
        </Card>

        {/* Velocity & Peak Hours */}
        <div className="lg:col-span-7 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Velocity */}
              <Card glass className="p-8 border-white/5">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 glass rounded-2xl border-white/10 text-emerald-500"><TrendingUp size={20}/></div>
                    <p className="text-sm font-black uppercase tracking-tighter">Fastest <span className="text-white/20">Moving</span></p>
                 </div>
                 <div className="space-y-4">
                    {velocityData.fastest.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5 group">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-white/20">0{i+1}</span>
                            <span className="text-xs font-black uppercase tracking-widest group-hover:text-brushed-gold transition-colors">{item.name}</span>
                         </div>
                         <Badge className="bg-emerald-500/10 text-emerald-500 border-0 font-black text-[9px]">{item.count} Sold</Badge>
                      </div>
                    ))}
                 </div>
              </Card>

              {/* Peak Detection */}
              <Card glass className="p-8 border-white/5">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 glass rounded-2xl border-white/10 text-brushed-gold"><Clock size={20}/></div>
                    <p className="text-sm font-black uppercase tracking-tighter">Peak <span className="text-white/20">Activation</span></p>
                 </div>
                 <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={peakHourData}>
                          <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ display: 'none' }} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                             {peakHourData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.count === Math.max(...peakHourData.map(d => d.count)) ? '#c5a059' : 'rgba(255,255,255,0.1)'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20 px-2">
                    <span>Morning</span>
                    <span>Noon</span>
                    <span>Night</span>
                 </div>
              </Card>
           </div>

           {/* Smart Pricing Suggestions */}
           <Card glass className="p-8 border-white/5 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                 <Sparkles size={120} />
              </div>
              <CardHeader className="mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 glass rounded-2xl border-white/10 text-brushed-gold shadow-2xl"><DollarSign size={20}/></div>
                    <p className="text-lg font-black uppercase tracking-tight">Dynamic <span className="text-brushed-gold">Markups</span></p>
                 </div>
              </CardHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                 {smartSuggestions.map((s, i) => (
                   <div key={i} className="p-5 glass rounded-3xl border-white/5 space-y-3 hover:border-brushed-gold/20 transition-all cursor-pointer group/item">
                      <p className="text-xs font-black text-white uppercase truncate">{s.item}</p>
                      <p className="text-lg font-black text-brushed-gold italic">{s.impact}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase leading-relaxed">{s.reason}</p>
                      <div className="pt-2 flex justify-end">
                         <div className="w-8 h-8 rounded-full glass border-white/5 flex items-center justify-center group-hover/item:text-brushed-gold transition-colors">
                            <ArrowUpRight size={14} />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
