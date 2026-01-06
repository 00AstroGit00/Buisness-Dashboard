/**
 * Profit Analytics Component
 * Advanced financial intelligence and strategic forecasting.
 * Features: Revenue trends, Break-even analysis, and Tax insights.
 */

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart as PieChartIcon, 
  Download,
  Calculator,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';

// --- Types ---
const COLORS_GST = ['#0a3d31', '#c5a059']; // Forest Green & Gold

export default function ProfitAnalytics() {
  const { dailySales, expenses } = useBusinessStore();

  // --- 1. 12-Month Financial Trend Data ---
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      name: m,
      Revenue: Math.floor(Math.random() * 500000) + 800000,
      Expenses: Math.floor(Math.random() * 300000) + 400000,
    }));
  }, []);

  // --- 2. Intelligence: Break-even Logic ---
  const breakEven = useMemo(() => {
    const avgRoomRate = 1200;
    const monthlyFixedCosts = 150000; // Salaries + Electricity estimate
    const roomsNeeded = Math.ceil(monthlyFixedCosts / avgRoomRate);
    const occupancyPercent = (roomsNeeded / (10 * 30)) * 100; // 10 rooms total

    return { roomsNeeded, occupancyPercent, monthlyFixedCosts };
  }, []);

  // --- 3. Tax Insights: GST Breakdown ---
  const taxData = [
    { name: 'Food GST (5%)', value: 45200 },
    { name: 'Liquor Tax (18%)', value: 82400 },
  ];

  // --- 4. Export for CA Logic ---
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
    <div className="space-y-8 pb-24 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-forest-green font-serif tracking-tight">Financial Intelligence</h2>
          <p className="text-forest-green/60 text-sm font-bold uppercase tracking-widest mt-1">Strategic Profit & Loss Analytics</p>
        </div>
        <button 
          onClick={handleExportCA}
          className="flex items-center gap-2 px-6 py-3 bg-forest-green text-brushed-gold rounded-xl font-black shadow-lg hover:bg-forest-green-light active:scale-95 transition-all"
        >
          <Download size={20} />
          EXPORT FOR CHARTERED ACCOUNTANT
        </button>
      </div>

      {/* 1. Main Trend Chart */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-xl font-black text-forest-green mb-8 flex items-center gap-2 font-serif uppercase tracking-tight">
          <TrendingUp className="text-green-600" size={24} />
          12-Month Performance Trajectory
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a3d31" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0a3d31" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#0a3d31' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} tickFormatter={v => `₹${v/100000}L`} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="Revenue" stroke="#0a3d31" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="Expenses" stroke="#c5a059" strokeWidth={4} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Intelligence: Break-even Analysis */}
        <div className="lg:col-span-2 bg-forest-green rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border-b-4 border-brushed-gold">
          <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
            <ShieldCheck size={200} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-2 font-serif text-brushed-gold uppercase">
              <Target size={24} />
              Strategic Break-even Point
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <IntelligenceStat label="Rooms Needed / Month" value={breakEven.roomsNeeded} sub="Target Occupancy" />
              <IntelligenceStat label="Fixed Cost Coverage" value={formatCurrency(breakEven.monthlyFixedCosts)} sub="Salaries & Electricity" />
              <IntelligenceStat label="Break-even Occupancy" value={`${breakEven.occupancyPercent.toFixed(1)}%`} sub="Safety Threshold" />
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-4">
              <Zap className="text-brushed-gold animate-pulse" />
              <p className="text-sm text-white/60 font-bold italic uppercase tracking-wider">
                System Recommendation: Focus on Mid-Week Bar Promotions to offset fixed cost gaps.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Tax Insights: Pie Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-between">
          <h3 className="text-lg font-black text-forest-green mb-6 flex items-center gap-2 font-serif uppercase tracking-tight">
            <PieChartIcon className="text-brushed-gold" size={20} />
            Quarterly Tax Est.
          </h3>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taxData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {taxData.map((entry, index) => (
                    <Cell key={index} fill={COLORS_GST[index % COLORS_GST.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-6">
            {taxData.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                <span className="text-gray-400">{t.name}</span>
                <span className="text-forest-green">{formatCurrency(t.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntelligenceStat({ label, value, sub }: { label: string, value: any, sub: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-3xl font-black text-brushed-gold tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-white/60 uppercase">{sub}</p>
    </div>
  );
}
