/**
 * Accounting Component
 * Full-featured financial tracker for hotel operations.
 * Includes Revenue Logging, Expense Tracking, GST Logic, and Analytics.
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Calculator,
  Calendar,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useBusinessStore, Expense } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';

// --- Types ---
type RevenueSource = 'roomRent' | 'restaurantBills' | 'barSales';

export default function Accounting() {
  const { expenses, dailySales, addExpense, recordDailySale, removeExpense } = useBusinessStore();
  
  // Local state for forms
  const [revData, setRevData] = useState({ roomRent: '', restaurantBills: '', barSales: '' });
  const [expData, setExpData] = useState({ category: 'Misc', amount: '', description: '' });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // --- 1. Financial Totals Logic ---
  const totals = useMemo(() => {
    const todaySales = dailySales[today] || { roomRent: 0, restaurantBills: 0, barSales: 0 };
    const todayExpenses = expenses.filter(e => e.date === today);

    const grossRev = todaySales.roomRent + todaySales.restaurantBills + todaySales.barSales;
    const totalExp = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // --- 2. GST Engine Logic ---
    // Restaurant Food: 5% GST
    const foodTax = todaySales.restaurantBills * 0.05;
    // Kerala Liquor Tax: 18% (Standard assumption for bar accounting)
    const liquorTax = todaySales.barSales * 0.18;

    return {
      grossRev,
      totalExp,
      foodTax,
      liquorTax,
      totalTax: foodTax + liquorTax,
      netProfit: grossRev - totalExp - (foodTax + liquorTax)
    };
  }, [today, dailySales, expenses]);

  // --- 3. Chart Data Preparation (Last 7 Days) ---
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const sales = dailySales[dateStr] || { roomRent: 0, restaurantBills: 0, barSales: 0 };
      const revenue = sales.roomRent + sales.restaurantBills + sales.barSales;
      const dayExpenses = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);

      data.push({
        name: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        Revenue: revenue,
        Expenses: dayExpenses
      });
    }
    return data;
  }, [dailySales, expenses]);

  // --- Handlers ---
  const handleRevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordDailySale(today, {
      roomRent: parseFloat(revData.roomRent) || 0,
      restaurantBills: parseFloat(revData.restaurantBills) || 0,
      barSales: parseFloat(revData.barSales) || 0,
    });
    setRevData({ roomRent: '', restaurantBills: '', barSales: '' });
  };

  const handleExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expData.amount) return;
    addExpense({
      date: today,
      category: expData.category as any,
      amount: parseFloat(expData.amount),
      description: expData.description
    });
    setExpData({ category: 'Misc', amount: '', description: '' });
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* 4. Centerpiece: Net Profit Card */}
      <div className="bg-white rounded-3xl border-4 border-brushed-gold shadow-2xl p-10 text-center max-w-3xl mx-auto transform hover:scale-[1.02] transition-all">
        <p className="text-xs font-black text-forest-green/40 uppercase tracking-[0.2em] mb-3">Daily Performance Position</p>
        <div className="text-7xl font-black text-forest-green mb-4 leading-none">
          <PrivateNumber value={totals.netProfit} format={formatCurrency} />
        </div>
        <div className="flex justify-center gap-8 items-center pt-6 border-t border-gray-100">
          <div className="text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Gross Revenue</p>
            <p className="text-xl font-black text-green-600">{formatCurrency(totals.grossRev)}</p>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Outflow</p>
            <p className="text-xl font-black text-red-600">{formatCurrency(totals.totalExp)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Form */}
        <div className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-6">
          <h3 className="text-lg font-black text-forest-green mb-6 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={24} />
            Log Today's Revenue
          </h3>
          <form onSubmit={handleRevSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Room Rent" value={revData.roomRent} onChange={v => setRevData({...revData, roomRent: v})} />
              <Input label="Restaurant" value={revData.restaurantBills} onChange={v => setRevData({...revData, restaurantBills: v})} />
            </div>
            <Input label="Bar Sales (Linked to Stock)" value={revData.barSales} onChange={v => setRevData({...revData, barSales: v})} />
            <button className="w-full py-4 bg-forest-green text-brushed-gold rounded-xl font-black hover:bg-forest-green-light transition-all shadow-lg active:scale-95">
              Record Daily Earnings
            </button>
          </form>
        </div>

        {/* Expense Form */}
        <div className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-6">
          <h3 className="text-lg font-black text-forest-green mb-6 flex items-center gap-2">
            <TrendingDown className="text-red-600" size={24} />
            Log Operational Cost
          </h3>
          <form onSubmit={handleExpSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select 
                value={expData.category}
                onChange={e => setExpData({...expData, category: e.target.value})}
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-bold text-forest-green"
              >
                <option>Purchase Cost</option>
                <option>Wages</option>
                <option>Utilities</option>
                <option>Misc</option>
              </select>
              <Input label="Amount (₹)" value={expData.amount} onChange={v => setExpData({...expData, amount: v})} />
            </div>
            <Input label="Description (Milk, Veg, etc.)" value={expData.description} onChange={v => setExpData({...expData, description: v})} />
            <button className="w-full py-4 bg-gray-100 text-forest-green rounded-xl font-black hover:bg-gray-200 transition-all active:scale-95">
              Record Expense
            </button>
          </form>
        </div>
      </div>

      {/* Analytics: Revenue vs Expense Chart */}
      <div className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-8">
        <h3 className="text-lg font-black text-forest-green mb-8 flex items-center gap-2">
          <BarChartIcon className="text-brushed-gold" size={24} />
          Weekly Financial Trajectory
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#0a3d31' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#999' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(197, 160, 89, 0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="Revenue" fill="#0a3d31" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="Expenses" fill="#c5a059" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-forest-green/40 uppercase ml-1 tracking-wider">{label}</label>
      <input 
        type={label.includes('Amount') || label.includes('Sales') || label.includes('Rent') || label.includes('Restaurant') ? 'number' : 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold focus:bg-white outline-none font-bold text-forest-green transition-all"
        placeholder="0.00"
      />
    </div>
  );
}
