/**
 * Optimized Accounting Component
 * Features: Virtualized Expense Ledger and Memoized Summaries.
 * Optimized for HP Laptop (8GB RAM) and i3 Processor.
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calculator,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useBusinessStore, Expense } from '../store/useBusinessStore';
import { useSystemMonitor } from './SystemMonitor';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';

// --- Memoized Row Component for Virtualized List ---

const ExpenseRow = memo(({ 
  data, 
  index, 
  style 
}: { 
  data: { expenses: Expense[], onRemove: (id: string) => void }, 
  index: number, 
  style: React.CSSProperties 
}) => {
  const expense = data.expenses[index];
  if (!expense) return null;

  return (
    <div style={style} className="flex items-center justify-between px-6 py-2 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
      <div className="flex-1">
        <p className="text-sm font-bold text-forest-green tracking-tight leading-tight">{expense.description}</p>
        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{expense.category}</p>
      </div>
      <div className="flex items-center gap-6">
        <p className="font-black text-red-600 text-sm">{formatCurrency(expense.amount)}</p>
        <button 
          onClick={() => data.onRemove(expense.id)}
          className="p-1.5 text-gray-200 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.data.expenses[prev.index] === next.data.expenses[next.index];
});

// --- Main Optimized Component ---

export default function Accounting() {
  const { expenses, dailySales, addExpense, removeExpense, inventory } = useBusinessStore();
  const { onRenderCallback } = useSystemMonitor();
  const [expForm, setExpForm] = useState({ category: 'Kitchen Supplies' as const, amount: '', description: '' });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // --- Memoized Calculations (Avoid CPU Spikes) ---
  
  const todaySummary = useMemo(() => {
    const sales = dailySales[today] || { roomRent: 0, restaurantBills: 0, barSales: 0 };
    const dayExps = expenses.filter(e => e.date === today);
    
    const rev = sales.roomRent + sales.restaurantBills + sales.barSales;
    const expTotal = dayExps.reduce((s, e) => s + e.amount, 0);
    const tax = (sales.restaurantBills * 0.05) + (sales.barSales * 0.18);

    return { rev, expTotal, tax, net: rev - expTotal - tax, dailyExps: dayExps };
  }, [dailySales, expenses, today]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const s = dailySales[ds] || { roomRent: 0, restaurantBills: 0, barSales: 0 };
      const r = s.roomRent + s.restaurantBills + s.barSales;
      const e = expenses.filter(ex => ex.date === ds).reduce((sm, ex) => sm + ex.amount, 0);
      data.push({ name: d.toLocaleDateString('en-IN', { weekday: 'short' }), Revenue: r, Expenses: e });
    }
    return data;
  }, [dailySales, expenses]);

  const handleExpSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.amount) return;
    addExpense({ date: today, category: expForm.category as any, amount: parseFloat(expForm.amount), description: expForm.description });
    setExpForm({ category: 'Kitchen Supplies', amount: '', description: '' });
  }, [expForm, addExpense, today]);

  const listData = useMemo(() => ({
    expenses: todaySummary.dailyExps,
    onRemove: removeExpense
  }), [todaySummary.dailyExps, removeExpense]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in font-sans">
      {/* Performance Card */}
      <div className="bg-white rounded-3xl border-4 border-brushed-gold shadow-2xl p-8 text-center max-w-2xl mx-auto">
        <p className="text-[10px] font-black text-forest-green/40 uppercase tracking-[0.3em] mb-4 font-serif">Financial Position</p>
        <div className="text-6xl font-black text-forest-green mb-2 tracking-tighter">
          <PrivateNumber value={todaySummary.net} format={formatCurrency} />
        </div>
        <div className="flex justify-center gap-6 items-center pt-6 mt-4 border-t border-gray-50">
          <StatMini label="Gross Revenue" value={todaySummary.rev} color="text-green-600" />
          <div className="w-px h-8 bg-gray-100"></div>
          <StatMini label="Total Expenses" value={todaySummary.expTotal} color="text-red-600" />
          <div className="w-px h-8 bg-gray-100"></div>
          <StatMini label="Tax Est." value={todaySummary.tax} color="text-brushed-gold" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry & List Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-forest-green/5 shadow-sm p-6">
            <h3 className="text-lg font-black text-forest-green mb-6 flex items-center gap-2 font-serif">
              <Plus className="text-brushed-gold" size={20} />
              Quick Expense
            </h3>
            <form onSubmit={handleExpSubmit} className="grid grid-cols-2 gap-4">
              <select 
                value={expForm.category}
                onChange={e => setExpForm({...expForm, category: e.target.value as any})}
                className="col-span-1 p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-bold text-xs"
              >
                <option>Kitchen Supplies</option>
                <option>Staff Wages</option>
                <option>Utilities</option>
                <option>Misc</option>
              </select>
              <input 
                type="number"
                value={expForm.amount}
                onChange={e => setExpForm({...expForm, amount: e.target.value})}
                className="col-span-1 p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-bold text-xs"
                placeholder="₹ Amount"
              />
              <input 
                type="text"
                value={expForm.description}
                onChange={e => setExpForm({...expForm, description: e.target.value})}
                className="col-span-2 p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-bold text-xs"
                placeholder="What was this for?"
              />
              <button className="col-span-2 py-4 btn-primary-gold rounded-xl font-black uppercase text-xs shadow-lg">Save Record</button>
            </form>
          </div>

          {/* Virtualized Expense List */}
          <div className="bg-white rounded-2xl border border-forest-green/5 shadow-sm overflow-hidden h-[300px]">
            <div className="bg-gray-50 p-4 border-b border-gray-100">
              <h3 className="text-forest-green font-black text-[10px] uppercase tracking-widest">Today's Audit Trail</h3>
            </div>
            {todaySummary.dailyExps.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-300 italic text-sm">No expenses logged</div>
            ) : (
              <List
                height={250}
                itemCount={todaySummary.dailyExps.length}
                itemSize={55}
                width="100%"
                itemData={listData}
              >
                {ExpenseRow}
              </List>
            )}
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-2xl border border-forest-green/5 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-8">
            <Calculator className="text-brushed-gold" size={24} />
            <h3 className="text-lg font-black text-forest-green uppercase tracking-widest font-serif">7-Day Trajectory</h3>
          </div>
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
                <Bar dataKey="Revenue" fill="#0a3d31" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="Expenses" fill="#c5a059" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="text-center">
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-black ${color}`}>{formatCurrency(value)}</p>
    </div>
  );
}