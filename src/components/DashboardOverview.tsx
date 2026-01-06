import { useMemo, useState, useEffect, Suspense } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Calendar, FileText, TrendingUp, TrendingDown, Database, Loader2 } from 'lucide-react';
import { useStore, type DailySales, type Expense, type ProductInventory } from '../store/Store';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';
import './DashboardOverview.css';

// Brand colors
const FOREST_GREEN = '#0a3d31';
const BRUSHED_GOLD = '#c5a059';
const FOREST_GREEN_LIGHT = '#0d5243';
const BRUSHED_GOLD_LIGHT = '#d4b371';

interface ComplianceDeadline {
  name: string;
  dueDate: Date;
  type: 'license' | 'gst' | 'other';
  daysRemaining: number;
}

export default function DashboardOverview() {
  const { dailySales, expenses, inventory, addDailySale, addExpense, addInventoryItem } = useStore();
  const [complianceDeadlines, setComplianceDeadlines] = useState<ComplianceDeadline[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Parse compliance deadlines from document filenames
  useEffect(() => {
    const deadlines: ComplianceDeadline[] = [];

    // Parse Bar License dates from filenames
    // "Bar License 2025-2026.pdf" -> expires end of 2026
    const barLicense2026 = new Date('2026-12-31');
    deadlines.push({
      name: 'Bar License',
      dueDate: barLicense2026,
      type: 'license',
      daysRemaining: Math.ceil((barLicense2026.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)),
    });

    // GST filing is typically monthly - set to end of current month
    const now = new Date();
    const gstFilingDate = new Date(now.getFullYear(), now.getMonth() + 1, 20); // 20th of next month
    deadlines.push({
      name: 'GST Filing',
      dueDate: gstFilingDate,
      type: 'gst',
      daysRemaining: Math.ceil((gstFilingDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)),
    });

    // Update days remaining
    const updatedDeadlines = deadlines.map((deadline) => ({
      ...deadline,
      daysRemaining: Math.ceil((deadline.dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    // Defer setState to avoid cascading synchronous renders inside the effect
    setTimeout(() => setComplianceDeadlines(updatedDeadlines), 0);
  }, [currentTime]);

  // Demo Data Loader
  const handleLoadDemoData = () => {
    if (confirm('Load demo data? This will add sample sales, expenses, and inventory.')) {
      // 1. Add Demo Inventory
      const demoProducts: any[] = [
        { productName: 'Royal Challenge', size: 750, sales: 120 },
        { productName: 'Mansion House', size: 1000, sales: 95 },
        { productName: 'Old Monk', size: 750, sales: 150 },
        { productName: 'Bacardi Lemon', size: 750, sales: 45 },
        { productName: 'Magic Moments', size: 750, sales: 60 },
      ];

      demoProducts.forEach(p => {
        addInventoryItem({
          productName: p.productName,
          category: 'IMFL',
          currentStock: 50,
          config: { size: p.size, cases: 0, bottles: 0, pegs: 0 },
          sales: p.sales,
          lastUpdated: new Date().toISOString()
        } as any);
      });

      // 2. Add Demo Sales (Last 7 Days)
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        addDailySale({
          id: `demo-sale-${i}`,
          date: dateStr,
          roomRent: 8000 + Math.random() * 5000,
          restaurantBills: 5000 + Math.random() * 3000,
          barSales: 15000 + Math.random() * 8000,
        });
      }

      // 3. Add Demo Expenses
      addExpense({ id: 'demo-exp-1', date: new Date().toISOString().split('T')[0], category: 'Wages', description: 'Staff Wages', amount: 12000 });
      addExpense({ id: 'demo-exp-2', date: new Date().toISOString().split('T')[0], category: 'Supplies', description: 'Kitchen Supplies', amount: 4500 });
    }
  };

  // Prepare Revenue vs Expense data
  const revenueExpenseData = useMemo(() => {
    const dataMap = new Map<string, { date: string; revenue: number; expense: number }>();

    // Aggregate revenue by date
    dailySales.forEach((sale) => {
      const total = sale.roomRent + sale.restaurantBills + sale.barSales;
      const existing = dataMap.get(sale.date) || { date: sale.date, revenue: 0, expense: 0 };
      existing.revenue += total;
      dataMap.set(sale.date, existing);
    });

    // Aggregate expenses by date
    expenses.forEach((expense) => {
      const existing = dataMap.get(expense.date) || { date: expense.date, revenue: 0, expense: 0 };
      existing.expense += expense.amount;
      dataMap.set(expense.date, existing);
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [dailySales, expenses]);

  // Prepare Top Selling Brands data (based on peg sales)
  const topSellingBrands = useMemo(() => {
    const brandSales = new Map<string, number>();

    inventory.forEach((item) => {
      if (item.sales > 0) {
        // Extract brand name from product name (e.g., "Royal Challenge 750ml" -> "Royal Challenge")
        const brandName = item.productName.replace(/\s+\d+ml$/, '').trim();
        const currentSales = brandSales.get(brandName) || 0;
        brandSales.set(brandName, currentSales + item.sales);
      }
    });

    // Convert to array and sort by sales, take top 5
    return Array.from(brandSales.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [inventory]);

  // Colors for pie chart
  const COLORS = [BRUSHED_GOLD, FOREST_GREEN, BRUSHED_GOLD_LIGHT, FOREST_GREEN_LIGHT, '#a6893f'];

  // Format countdown timer
  const formatCountdown = (days: number): string => {
    if (days < 0) {
      return `Overdue by ${Math.abs(days)} days`;
    }
    if (days === 0) {
      return 'Due today!';
    }
    if (days === 1) {
      return 'Due tomorrow';
    }
    if (days <= 7) {
      return `${days} days remaining`;
    }
    if (days <= 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} remaining`;
    }
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} remaining`;
  };

  const getUrgencyColor = (days: number): string => {
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-red-500';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-64 text-forest-green">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="text-sm font-medium">Loading Dashboard Overview...</p>
      </div>
    }>
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-forest-green mb-2">
          Dashboard Overview
        </h2>
        <p className="text-forest-green/70">
          Welcome back! Here's what's happening at your hotel today.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expense Bar Chart */}
        <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
          <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
            <TrendingUp className="text-brushed-gold" size={20} />
            Revenue vs Expense (Last 7 Days)
          </h3>
          {revenueExpenseData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-forest-green/50 gap-4">
              <p>No data available. Add sales and expenses to see the chart.</p>
              <button 
                onClick={handleLoadDemoData}
                className="px-4 py-2 bg-forest-green text-brushed-gold rounded-lg hover:bg-forest-green-dark transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Database size={16} />
                Load Demo Data
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueExpenseData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BRUSHED_GOLD} opacity={0.2} />
                <XAxis
                  dataKey="date"
                  stroke={FOREST_GREEN}
                  tick={{ fill: FOREST_GREEN, fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  stroke={FOREST_GREEN}
                  tick={{ fill: FOREST_GREEN, fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: FOREST_GREEN,
                    border: `1px solid ${BRUSHED_GOLD}`,
                    borderRadius: '8px',
                    color: BRUSHED_GOLD,
                  }}
                  formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill={BRUSHED_GOLD} name="Revenue" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill={FOREST_GREEN} name="Expense" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Selling Brands Pie Chart */}
        <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
          <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
            <TrendingDown className="text-brushed-gold" size={20} />
            Top Selling Brands (Peg Sales)
          </h3>
          {topSellingBrands.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-forest-green/50 gap-4">
              <p>No sales data available. Start recording peg sales to see top brands.</p>
              {inventory.length === 0 && (
                <button 
                  onClick={handleLoadDemoData}
                  className="px-4 py-2 bg-forest-green text-brushed-gold rounded-lg hover:bg-forest-green-dark transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Database size={16} />
                  Load Demo Data
                </button>
              )}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topSellingBrands}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent !== undefined ? (percent * 100).toFixed(0) : '0')}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topSellingBrands.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: FOREST_GREEN,
                    border: `1px solid ${BRUSHED_GOLD}`,
                    borderRadius: '8px',
                    color: BRUSHED_GOLD,
                  }}
                  formatter={(value: number | undefined) => value !== undefined ? `${formatNumber(value, 1)} pegs` : ''}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {topSellingBrands.length > 0 && (
            <div className="mt-4 space-y-2">
              {topSellingBrands.map((brand, index) => (
                <div key={brand.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full brand-color-dot"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-forest-green">{brand.name}</span>
                  </div>
                  <span className="font-semibold text-forest-green">{formatNumber(brand.value, 1)} pegs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Alert Widget */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md p-6">
        <h3 className="text-lg font-semibold text-forest-green mb-4 flex items-center gap-2">
          <AlertTriangle className="text-brushed-gold" size={20} />
          Compliance Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceDeadlines.map((deadline, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                deadline.daysRemaining <= 7
                  ? 'bg-red-50 border-red-300'
                  : deadline.daysRemaining <= 30
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-green-50 border-green-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {deadline.type === 'license' ? (
                    <FileText className="text-forest-green" size={20} />
                  ) : (
                    <Calendar className="text-forest-green" size={20} />
                  )}
                  <h4 className="font-semibold text-forest-green">{deadline.name}</h4>
                </div>
                {deadline.daysRemaining <= 30 && (
                  <AlertTriangle
                    className={deadline.daysRemaining <= 7 ? 'text-red-600' : 'text-yellow-600'}
                    size={18}
                  />
                )}
              </div>
              <p className={`text-sm font-medium mb-1 ${getUrgencyColor(deadline.daysRemaining)}`}>
                {formatCountdown(deadline.daysRemaining)}
              </p>
              <p className="text-xs text-forest-green/60">
                Due: {deadline.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
        {complianceDeadlines.length === 0 && (
          <div className="text-center py-8 text-forest-green/50">
            <Calendar size={48} className="mx-auto mb-2 opacity-50" />
            <p>No compliance deadlines configured</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-brushed-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-forest-green/70">Total Revenue</span>
            <TrendingUp className="text-brushed-gold" size={20} />
          </div>
          <div className="text-2xl font-bold text-forest-green">
            <PrivateNumber 
              value={dailySales.reduce((sum, sale) => sum + sale.roomRent + sale.restaurantBills + sale.barSales, 0)}
              format={formatCurrency}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-brushed-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-forest-green/70">Total Expenses</span>
            <TrendingDown className="text-brushed-gold" size={20} />
          </div>
          <div className="text-2xl font-bold text-forest-green">
            <PrivateNumber 
              value={expenses.reduce((sum, exp) => sum + exp.amount, 0)}
              format={formatCurrency}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-brushed-gold/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-forest-green/70">Total Peg Sales</span>
            <TrendingUp className="text-brushed-gold" size={20} />
          </div>
          <p className="text-2xl font-bold text-forest-green">
            {formatNumber(
              inventory.reduce((sum, item) => sum + item.sales, 0),
              1
            )}{' '}
            pegs
          </p>
        </div>
      </div>
    </div>
    </Suspense>
  );
}

