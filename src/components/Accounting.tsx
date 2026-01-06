/**
 * Optimized Accounting Component
 * Features: Virtualized Expense Ledger and Memoized Summaries.
 * Optimized for HP Laptop (8GB RAM) and i3 Processor.
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List } from '../libs/reactWindowShim';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Calculator,
  Trash2,
  FileSpreadsheet,
  DollarSign,
  Receipt,
  PiggyBank,
  CreditCard,
  Building,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  FileText,
  Calendar,
  Filter,
  Search
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
import { useBusinessStore } from '../store/useBusinessStore';
import type { Expense } from '../store/useBusinessStore';
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
    <div style={style} className="flex items-center justify-between px-6 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-forest-green/10 rounded-lg">
            <Receipt size={16} className="text-forest-green" />
          </div>
          <div>
            <p className="text-sm font-bold text-forest-green tracking-tight leading-tight">{expense.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-500 uppercase font-medium bg-gray-100 px-2 py-1 rounded-full">{expense.category}</span>
              <span className="text-[10px] text-gray-400">{expense.date}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-bold text-red-600 text-base">{formatCurrency(expense.amount)}</p>
        <button
          onClick={() => data.onRemove(expense.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete expense"
        >
          <Trash2 size={16} />
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Filter expenses based on search and category
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (searchTerm) {
      result = result.filter(exp =>
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(exp => exp.category === selectedCategory);
    }

    return result;
  }, [expenses, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in font-sans">
      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-forest-green to-forest-green-light rounded-2xl p-5 text-white shadow-lg border border-forest-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Gross Revenue</p>
              <h3 className="text-2xl font-bold mt-1">
                <PrivateNumber value={todaySummary.rev} format={formatCurrency} />
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingUp className="text-brushed-gold" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <span className="text-green-300">▲</span>
              <span>Today's revenue</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-green/70">Total Expenses</p>
              <h3 className="text-2xl font-bold text-forest-green mt-1">
                <PrivateNumber value={todaySummary.expTotal} format={formatCurrency} />
              </h3>
            </div>
            <div className="p-3 bg-forest-green/10 rounded-full">
              <Receipt className="text-forest-green" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-forest-green/60">
            <span className="flex items-center gap-1">
              <span className="text-red-600">▼</span>
              <span>Today's expenses</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-green/70">Tax Estimate</p>
              <h3 className="text-2xl font-bold text-forest-green mt-1">
                <PrivateNumber value={todaySummary.tax} format={formatCurrency} />
              </h3>
            </div>
            <div className="p-3 bg-forest-green/10 rounded-full">
              <FileText className="text-forest-green" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-forest-green/60">
            <span className="flex items-center gap-1">
              <span className="text-brushed-gold">•</span>
              <span>Estimated tax</span>
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-brushed-gold to-brushed-gold-light rounded-2xl p-5 text-forest-green shadow-lg border border-brushed-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-green/80">Net Profit</p>
              <h3 className="text-2xl font-bold mt-1">
                <PrivateNumber value={todaySummary.net} format={formatCurrency} />
              </h3>
            </div>
            <div className="p-3 bg-forest-green/20 rounded-full">
              <PiggyBank className="text-forest-green" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-forest-green/70">
            <span className="flex items-center gap-1">
              <span className="text-green-600">▲</span>
              <span>Today's profit</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry & List Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-forest-green mb-6 flex items-center gap-2">
              <Plus className="text-brushed-gold" size={20} />
              Add New Expense
            </h3>
            <form onSubmit={handleExpSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={expForm.category}
                onChange={e => setExpForm({...expForm, category: e.target.value as any})}
                className="col-span-1 p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent outline-none font-medium text-sm"
              >
                <option value="Kitchen Supplies">Kitchen Supplies</option>
                <option value="Staff Wages">Staff Wages</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Marketing">Marketing</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Misc">Miscellaneous</option>
              </select>
              <input
                type="number"
                value={expForm.amount}
                onChange={e => setExpForm({...expForm, amount: e.target.value})}
                className="col-span-1 p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent outline-none font-medium text-sm"
                placeholder="Amount (₹)"
                required
              />
              <input
                type="text"
                value={expForm.description}
                onChange={e => setExpForm({...expForm, description: e.target.value})}
                className="col-span-2 p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent outline-none font-medium text-sm"
                placeholder="Description"
                required
              />
              <button
                type="submit"
                className="col-span-2 py-3 bg-gradient-to-r from-forest-green to-forest-green-light hover:from-forest-green-light hover:to-forest-green text-brushed-gold rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                Save Expense
              </button>
            </form>
          </div>

          {/* Expense List with Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-forest-green font-bold text-lg flex items-center gap-2">
                <Receipt className="text-brushed-gold" size={20} />
                Expense Records
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-forest-green focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-forest-green focus:border-transparent outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Kitchen Supplies">Kitchen Supplies</option>
                  <option value="Staff Wages">Staff Wages</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
              </div>
            </div>

            <div className="h-[300px]">
              {filteredExpenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-forest-green/50 p-8 text-center">
                  <Receipt size={48} className="mb-4 opacity-50" />
                  <h4 className="text-lg font-bold text-forest-green/40 mb-2">No Expenses Found</h4>
                  <p className="text-forest-green/60">Try adjusting your search or category filter</p>
                </div>
              ) : (
                <List
                  height={250}
                  itemCount={filteredExpenses.length}
                  itemSize={70}
                  width="100%"
                  itemData={{ expenses: filteredExpenses, onRemove: removeExpense }}
                >
                  {ExpenseRow}
                </List>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-brushed-gold" size={24} />
            <h3 className="text-lg font-bold text-forest-green">7-Day Revenue vs Expenses</h3>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#0a3d31' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#999' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(197, 160, 89, 0.05)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                  }}
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