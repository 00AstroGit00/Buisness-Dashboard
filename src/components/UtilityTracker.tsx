/**
 * Utility Tracker Component
 * Features: Bill logging, Occupancy-cost analysis, and Predictive maintenance alerts.
 * Optimized for resource management and AC optimization.
 */

import { useState, useMemo } from 'react';
import { 
  Zap, 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Plus, 
  CheckCircle, 
  Wind,
  ThermometerSnowflake,
  Calculator
} from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';

export default function UtilityTracker() {
  const { rooms, inventory, expenses } = useBusinessStore();
  
  // Local state for bill logging
  const [billData, setBillData] = useState({ type: 'Electricity' as const, amount: '', month: 'January' });

  // --- 1. Analytics Logic: Cost Per Occupied Room ---
  const analysis = useMemo(() => {
    const totalOccupied = Object.values(rooms).filter(r => r.status === 'occupied').length;
    const avgOccupancy = 8.4; // Mock 30-day average for prototype
    
    // Monthly Electricity Estimate (Mock)
    const elecBill = 45000;
    const costPerRoom = elecBill / (avgOccupancy * 30); // Monthly cost per room per day

    return { 
      totalOccupied, 
      costPerRoom: Number(costPerRoom.toFixed(2)),
      isSpikeDetected: costPerRoom > 200 // Threshold for alert
    };
  }, [rooms]);

  // --- 2. Correlation Data: Bar Sales vs Utility ---
  const correlationData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => ({
      name: day,
      BarSales: Math.floor(Math.random() * 5000) + (idx > 4 ? 8000 : 2000),
      UtilityUsage: Math.floor(Math.random() * 100) + (idx > 4 ? 150 : 60), // Higher on weekends
    }));
  }, []);

  return (
    <div className="space-y-8 pb-24 animate-fade-in font-sans">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-forest-green flex items-center gap-3 font-serif">
            <Zap className="text-brushed-gold" size={32} />
            Utility & Resource Tracker
          </h2>
          <p className="text-forest-green/60 text-sm font-bold uppercase tracking-widest mt-1 tracking-tighter">Energy management and operational efficiency</p>
        </div>
      </div>

      {/* 3. Intelligence: Cost Per Occupied Room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-black text-forest-green font-serif uppercase tracking-tight">Resource Efficiency</h3>
              <p className="text-gray-400 text-xs font-bold uppercase">Cost per occupied room analysis</p>
            </div>
            {analysis.isSpikeDetected && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-2xl flex items-center gap-3 text-red-600 animate-pulse">
                <AlertTriangle size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Maintenance Check Alert</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard label="Current Occupancy" value={`${analysis.totalOccupied} Rooms`} icon={<Bed size={18}/>} />
            <MetricCard label="Daily Resource Cost" value={formatCurrency(analysis.costPerRoom)} sub="Per Active Unit" />
            <MetricCard label="System Status" value="Optimized" status="healthy" />
          </div>
        </div>

        {/* 4. Bill Logging Form */}
        <div className="bg-forest-green rounded-3xl p-8 text-white shadow-2xl border-b-4 border-brushed-gold">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2 font-serif text-brushed-gold uppercase">
            <Plus size={20} />
            Log Monthly Bill
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Utility Type</label>
              <select 
                value={billData.type}
                onChange={e => setBillData({...billData, type: e.target.value as any})}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-brushed-gold outline-none font-bold text-white"
              >
                <option>Electricity</option>
                <option>Water</option>
                <option>Diesel</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Invoice Amount (₹)</label>
              <input 
                type="number"
                value={billData.amount}
                onChange={e => setBillData({...billData, amount: e.target.value})}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-brushed-gold outline-none font-bold text-white"
                placeholder="0.00"
              />
            </div>
            <button className="w-full py-4 mt-4 bg-brushed-gold text-forest-green rounded-xl font-black uppercase text-xs shadow-lg hover:bg-brushed-gold-light transition-all active:scale-95">
              Sync Bill to Accounting
            </button>
          </div>
        </div>
      </div>

      {/* 5. Correlation Visualization: Bar Sales vs usage */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-lg font-black text-forest-green flex items-center gap-2 font-serif uppercase tracking-tight">
              <ThermometerSnowflake className="text-brushed-gold" size={24} />
              Bar Sales vs AC Usage Correlation
            </h3>
            <p className="text-gray-400 text-xs font-bold uppercase mt-1">Optimize cooling schedules based on sales velocity</p>
          </div>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={correlationData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#0a3d31' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" />
              <Bar yAxisId="left" dataKey="BarSales" name="Sales Volume (₹)" fill="#0a3d31" radius={[4, 4, 0, 0]} barSize={30} />
              <Line yAxisId="right" type="monotone" dataKey="UtilityUsage" name="Energy Usage (kWh)" stroke="#c5a059" strokeWidth={4} dot={{ r: 6, fill: '#c5a059' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
          <Wind className="text-brushed-gold" size={24} />
          <p className="text-sm text-gray-600 font-bold italic uppercase tracking-wider">
            Operational Insight: Weekends show a <span className="text-forest-green">45% increase</span> in energy load. Recommend pre-cooling the bar area from 6:30 PM on Fri/Sat.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, status, icon }: { label: string, value: any, sub?: string, status?: string, icon?: any }) {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-2xl font-black text-forest-green tracking-tighter">{value}</p>
        </div>
        {sub && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sub}</p>}
        {status === 'healthy' && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle size={12}/>
            <span className="text-[10px] font-black uppercase">System Healthy</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Bed({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bed"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
}
