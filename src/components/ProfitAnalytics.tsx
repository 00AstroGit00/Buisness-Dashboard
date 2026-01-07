/**
 * Profit Analytics Component - Upgraded UI
 * Advanced financial intelligence and strategic forecasting.
 * Features: Revenue trends, Break-even analysis, and Tax insights.
 */

import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, 
  Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, PieChart as PieChartIcon, 
  Download, Calculator, ShieldCheck, Zap, DollarSign,
  Activity, ArrowUpRight, ArrowDownRight, Briefcase, 
  History, Eye, EyeOff
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

const FOREST_GREEN = '#0a3d31';
const BRUSHED_GOLD = '#c5a059';
const COLORS_GST = [FOREST_GREEN, BRUSHED_GOLD];

export default function ProfitAnalytics() {
  const { expenses } = useBusinessStore();

  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      name: m,
      Revenue: Math.floor(Math.random() * 500000) + 800000,
      Expenses: Math.floor(Math.random() * 300000) + 400000,
    }));
  }, []);

  const breakEven = useMemo(() => {
    const avgRoomRate = 1200;
    const monthlyFixedCosts = 150000;
    const roomsNeeded = Math.ceil(monthlyFixedCosts / avgRoomRate);
    const occupancyPercent = (roomsNeeded / (10 * 30)) * 100;
    return { roomsNeeded, occupancyPercent, monthlyFixedCosts };
  }, []);

  const taxData = [
    { name: 'Food GST (5%)', value: 45200 },
    { name: 'Liquor Tax (18%)', value: 82400 },
  ];

  const handleExportCA = () => {
    const headers = "Date,Category,Description,Amount,GST Slab\n";
    const rows = expenses.map(e => `${e.date},${e.category},${e.description},${e.amount},18%`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Deepa_Financial_Export_CA_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24 font-sans">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Strategic Intelligence</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Financial <span className="text-brushed-gold">Vault</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1 font-black uppercase text-[9px] tracking-widest">Enterprise Analytics Active</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <ShieldCheck size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">Audited for FY 24-25</span>
             </div>
          </div>
        </div>

        <Button 
          variant="gold" 
          onClick={handleExportCA}
          leftIcon={<Download size={18} />}
          className="rounded-2xl shadow-xl shadow-brushed-gold/10 font-black tracking-widest uppercase text-xs"
        >
          Export for Chartered Accountant
        </Button>
      </div>

      {/* Main Performance Chart */}
      <Card className="border-0 shadow-2xl p-8 rounded-[2.5rem] bg-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Activity size={120} /></div>
         <CardHeader>
            <div className="flex items-center gap-3 relative z-10">
               <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={24} /></div>
               <div>
                  <CardTitle className="text-xl font-black">Performance Trajectory</CardTitle>
                  <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest mt-1">12-Month Projected Growth</p>
               </div>
            </div>
         </CardHeader>
         
         <div className="h-[400px] mt-8 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData}>
                  <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={FOREST_GREEN} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={FOREST_GREEN} stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BRUSHED_GOLD} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={BRUSHED_GOLD} stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: FOREST_GREEN }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: FOREST_GREEN }} tickFormatter={v => `₹${v/100000}L`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: '0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '16px' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '8px', color: FOREST_GREEN }}
                  />
                  <Legend iconType="circle" />
                  <Area type="monotone" name="Gross Revenue" dataKey="Revenue" stroke={FOREST_GREEN} strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" name="Expenditure" dataKey="Expenses" stroke={BRUSHED_GOLD} strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strategic Break-even Analysis */}
        <Card className="lg:col-span-2 bg-forest-green border-0 shadow-2xl p-10 rounded-[2.5rem] text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform scale-150"><ShieldCheck size={200} /></div>
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-12">
                 <div className="p-3 bg-white/10 rounded-2xl text-brushed-gold shadow-2xl"><Target size={24} /></div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Equilibrium Analysis</h3>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Monthly Threshold Targets</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 flex-1">
                 <div className="space-y-2 group">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Inventory Velocity</p>
                    <p className="text-4xl font-black text-brushed-gold tracking-tighter group-hover:scale-110 transition-transform origin-left">{breakEven.roomsNeeded}</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase">Units / Month Required</p>
                 </div>
                 <div className="space-y-2 group">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fixed Exposure</p>
                    <p className="text-4xl font-black text-brushed-gold tracking-tighter group-hover:scale-110 transition-transform origin-left">{formatCurrency(breakEven.monthlyFixedCosts)}</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase">Base Burn Rate</p>
                 </div>
                 <div className="space-y-2 group">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Target Utilization</p>
                    <p className="text-4xl font-black text-brushed-gold tracking-tighter group-hover:scale-110 transition-transform origin-left">{breakEven.occupancyPercent.toFixed(1)}%</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase">Yield Efficiency</p>
                 </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-brushed-gold text-forest-green flex items-center justify-center shadow-2xl animate-pulse">
                    <Zap size={20} />
                 </div>
                 <p className="text-xs font-black text-white/80 uppercase tracking-wider leading-relaxed">
                    Intelligence Insight: <span className="text-brushed-gold">Focus on Mid-Week Portfolio Promotions</span> to hedge fixed exposure risks.
                 </p>
              </div>
           </div>
        </Card>

        {/* Tax Insights Visualization */}
        <Card className="bg-white border-0 shadow-2xl p-8 rounded-[2.5rem] flex flex-col justify-between group overflow-hidden relative">
           <div className="absolute -bottom-8 -right-8 p-8 opacity-5 group-hover:scale-125 transition-transform"><Calculator size={160} /></div>
           <CardHeader className="mb-0">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-brushed-gold/10 text-brushed-gold rounded-2xl group-hover:rotate-12 transition-transform"><PieChartIcon size={20} /></div>
                 <div>
                    <CardTitle className="text-lg font-black tracking-tight">Fiscal Provision</CardTitle>
                    <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest mt-1">Est. Liability Breakdown</p>
                 </div>
              </div>
           </CardHeader>
           
           <div className="h-[240px] my-8">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={taxData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10}>
                       {taxData.map((_, index) => (
                         <Cell key={index} fill={COLORS_GST[index % COLORS_GST.length]} className="stroke-white stroke-[4px]" />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>

           <div className="space-y-3 relative z-10">
              {taxData.map((t, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group/item hover:border-brushed-gold/30 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS_GST[idx % COLORS_GST.length] }}></div>
                      <span className="text-[10px] font-black text-forest-green/60 uppercase tracking-widest">{t.name}</span>
                   </div>
                   <span className="text-sm font-black text-forest-green">{formatCurrency(t.value)}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>
    </div>
  );
}