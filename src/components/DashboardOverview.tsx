import { useMemo, useState, useEffect, Suspense } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertTriangle, Calendar, FileText, TrendingUp, TrendingDown, Database, Loader2, DollarSign, Users, ShoppingCart, Package, Activity, Eye, EyeOff } from 'lucide-react';
import { useStore, type DailySales, type Expense, type ProductInventory } from '../store/Store';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';
import { usePrivacyMode } from '../context/PrivacyModeContext';
import './DashboardOverview.css';

// Brand colors
const FOREST_GREEN = '#0a3d31';
const BRUSHED_GOLD = '#c5a059';
const FOREST_GREEN_LIGHT = '#0d5243';
const BRUSHED_GOLD_LIGHT = '#d4b371';
const FOREST_GREEN_DARK = '#062821';
const BRUSHED_GOLD_DARK = '#a6893f';

interface ComplianceDeadline {
  name: string;
  dueDate: Date;
  type: 'license' | 'gst' | 'other';
  daysRemaining: number;
}

export default function DashboardOverview() {
  const { dailySales, expenses, inventory, addDailySale, addExpense, addInventoryItem } = useStore();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();
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

  // Calculate summary metrics
  const totalPegsSold = useMemo(() =>
    inventory.reduce((sum, item) => sum + (item.sales || 0), 0),
    [inventory]
  );

  const totalRevenue = useMemo(() =>
    dailySales.reduce((sum, sale) => sum + sale.roomRent + sale.restaurantBills + sale.barSales, 0),
    [dailySales]
  );

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses]
  );

  const netProfit = totalRevenue - totalExpenses;

  // Colors for pie chart
  const COLORS = [BRUSHED_GOLD, FOREST_GREEN, BRUSHED_GOLD_LIGHT, FOREST_GREEN_LIGHT, BRUSHED_GOLD_DARK];

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
      {/* Page Header with Privacy Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-forest-green mb-1">
            Operational Dashboard
          </h2>
          <p className="text-forest-green/70 text-sm">
            Real-time metrics for Deepa Restaurant & Tourist Home
          </p>
        </div>

        <button
          onClick={togglePrivacyMode}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            isPrivacyMode
              ? 'bg-brushed-gold text-forest-green shadow-md'
              : 'bg-gray-200 text-forest-green/70 hover:bg-gray-300'
          }`}
          title={isPrivacyMode ? 'Privacy Mode Active' : 'Privacy Mode Inactive'}
        >
          {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>Privacy Mode {isPrivacyMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-forest-green to-forest-green-light rounded-2xl p-5 text-white shadow-lg border border-forest-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">
                <PrivateNumber
                  value={totalRevenue}
                  format={formatCurrency}
                />
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingUp className="text-brushed-gold" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <span className="text-green-300">▲</span>
              <span>12.5% from last week</span>
            </span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-gradient-to-br from-brushed-gold to-brushed-gold-light rounded-2xl p-5 text-forest-green shadow-lg border border-brushed-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-green/80">Net Profit</p>
              <h3 className="text-2xl font-bold mt-1">
                <PrivateNumber
                  value={netProfit}
                  format={formatCurrency}
                />
              </h3>
            </div>
            <div className="p-3 bg-forest-green/20 rounded-full">
              <DollarSign className="text-forest-green" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-forest-green/70">
            <span className="flex items-center gap-1">
              <span className="text-green-600">▲</span>
              <span>8.2% from last week</span>
            </span>
          </div>
        </div>

        {/* Total Pegs Sold Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-green/70">Pegs Sold</p>
              <h3 className="text-2xl font-bold text-forest-green mt-1">
                {formatNumber(totalPegsSold, 0)}
              </h3>
            </div>
            <div className="p-3 bg-forest-green/10 rounded-full">
              <Package className="text-forest-green" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-forest-green/60">
            <span className="flex items-center gap-1">
              <span className="text-green-600">▲</span>
              <span>15.3% from last week</span>
            </span>
          </div>
        </div>

        {/* Room Occupancy Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-green/70">Room Occupancy</p>
              <h3 className="text-2xl font-bold text-forest-green mt-1">
                84<span className="text-sm">%</span>
              </h3>
            </div>
            <div className="p-3 bg-forest-green/10 rounded-full">
              <Users className="text-forest-green" size={24} />
            </div>
          </div>
          <div className="mt-3 text-xs text-forest-green/60">
            <span className="flex items-center gap-1">
              <span className="text-green-600">▲</span>
              <span>3.1% from last week</span>
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expense Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-forest-green flex items-center gap-2">
              <TrendingUp className="text-brushed-gold" size={20} />
              Revenue vs Expense
            </h3>
            <span className="text-xs text-forest-green/60">Last 7 days</span>
          </div>

          {revenueExpenseData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-forest-green/50 gap-4">
              <p className="text-center">No data available. Add sales and expenses to see the chart.</p>
              <button
                onClick={handleLoadDemoData}
                className="px-4 py-2 bg-forest-green text-brushed-gold rounded-lg hover:bg-forest-green-dark transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Database size={16} />
                Load Demo Data
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueExpenseData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
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
                    backgroundColor: 'white',
                    border: `1px solid ${FOREST_GREEN}`,
                    borderRadius: '8px',
                    color: FOREST_GREEN,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill={BRUSHED_GOLD} name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill={FOREST_GREEN} name="Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Selling Brands Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-forest-green flex items-center gap-2">
              <TrendingDown className="text-brushed-gold" size={20} />
              Top Selling Brands
            </h3>
            <span className="text-xs text-forest-green/60">Peg Sales</span>
          </div>

          {topSellingBrands.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-forest-green/50 gap-4">
              <p className="text-center">No sales data available. Start recording peg sales to see top brands.</p>
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
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={topSellingBrands}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent !== undefined ? (percent * 100).toFixed(0) : '0')}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topSellingBrands.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${FOREST_GREEN}`,
                        borderRadius: '8px',
                        color: FOREST_GREEN,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      formatter={(value: number | undefined) => value !== undefined ? `${formatNumber(value, 1)} pegs` : ''}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:w-1/3 flex flex-col justify-center">
                {topSellingBrands.map((brand, index) => (
                  <div key={brand.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-forest-green font-medium truncate max-w-[120px]">{brand.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-forest-green">{formatNumber(brand.value, 1)} pegs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Alert Widget */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-forest-green flex items-center gap-2">
            <AlertTriangle className="text-brushed-gold" size={20} />
            Compliance Alerts
          </h3>
          <span className="text-xs text-forest-green/60">Upcoming deadlines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceDeadlines.map((deadline, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                deadline.daysRemaining <= 7
                  ? 'bg-red-50 border-red-200'
                  : deadline.daysRemaining <= 30
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {deadline.type === 'license' ? (
                    <FileText className="text-forest-green" size={18} />
                  ) : (
                    <Calendar className="text-forest-green" size={18} />
                  )}
                  <h4 className="font-semibold text-forest-green">{deadline.name}</h4>
                </div>
                {deadline.daysRemaining <= 30 && (
                  <AlertTriangle
                    className={deadline.daysRemaining <= 7 ? 'text-red-600' : 'text-yellow-600'}
                    size={16}
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
    </div>
    </Suspense>
  );
}

