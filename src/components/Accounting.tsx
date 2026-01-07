import { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Trash2,
  FileText,
  Search,
  PieChart
} from 'lucide-react';
import { useBusinessStore, type Expense } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

export default function Accounting() {
  const { dailySales, expenses, addExpense, removeExpense } = useBusinessStore();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    category: 'Supplies',
    amount: 0,
    description: '',
  });

  const revenueSummary = useMemo(() => {
    let total = 0;
    let bar = 0;
    let restaurant = 0;
    let room = 0;

    Object.values(dailySales).forEach((sale) => {
      total += (sale.barSales || 0) + (sale.restaurantBills || 0) + (sale.roomRent || 0);
      bar += (sale.barSales || 0);
      restaurant += (sale.restaurantBills || 0);
      room += (sale.roomRent || 0);
    });

    return { total, bar, restaurant, room };
  }, [dailySales]);

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, exp) => sum + exp.amount, 0), 
  [expenses]);

  const netProfit = revenueSummary.total - totalExpenses;

  const filteredExpenses = useMemo(() => {
    if (expenseFilter === 'all') return expenses;
    return expenses.filter(e => e.category === expenseFilter);
  }, [expenses, expenseFilter]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.amount <= 0 || !newExpense.description) return;
    addExpense(newExpense);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Supplies',
      amount: 0,
      description: '',
    });
    setShowAddExpense(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Financial Control</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Accounts <span className="text-brushed-gold">Ledger</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1">Fiscal Year 2024-25</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <Calendar size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">Auto-balancing Active</span>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" leftIcon={<Download size={18} />} className="rounded-2xl border-forest-green/20">
             Export Audit
           </Button>
           <Button 
             variant="gold" 
             onClick={() => setShowAddExpense(true)}
             leftIcon={<Plus size={18} />}
             className="rounded-2xl shadow-xl shadow-brushed-gold/10"
           >
             Record Expense
           </Button>
        </div>
      </div>

      {/* Financial Health Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-forest-green border-0 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp size={100} />
           </div>
           <CardHeader className="mb-2">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Gross Revenue</p>
             <ArrowUpRight className="text-brushed-gold" size={20} />
           </CardHeader>
           <h3 className="text-3xl font-black text-white tracking-tighter">
             <PrivateNumber value={revenueSummary.total} format={formatCurrency} />
           </h3>
           <div className="mt-4 flex gap-2">
              <div className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-bold text-white/60">BAR: {formatCurrency(revenueSummary.bar)}</div>
              <div className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-bold text-white/60">HOTEL: {formatCurrency(revenueSummary.room)}</div>
           </div>
        </Card>

        <Card className="bg-white border-0 shadow-xl relative overflow-hidden group">
           <CardHeader className="mb-2">
             <p className="text-[10px] font-black uppercase tracking-widest text-forest-green/40">Total Operational Cost</p>
             <ArrowDownRight className="text-red-500" size={20} />
           </CardHeader>
           <h3 className="text-3xl font-black text-forest-green tracking-tighter">
             <PrivateNumber value={totalExpenses} format={formatCurrency} />
           </h3>
           <p className="text-[10px] font-bold text-red-600 mt-2 uppercase tracking-widest flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Outflow active
           </p>
        </Card>

        <Card className="bg-brushed-gold border-0 shadow-xl relative overflow-hidden group">
           <div className="absolute bottom-0 right-0 p-4 opacity-20">
             <PieChart size={80} />
           </div>
           <CardHeader className="mb-2">
             <p className="text-[10px] font-black uppercase tracking-widest text-forest-green/40">Net Operating Profit</p>
             <Badge variant="gold" className="bg-white/30 text-forest-green border-0 font-black">EXCELLENT</Badge>
           </CardHeader>
           <h3 className="text-3xl font-black text-forest-green tracking-tighter">
             <PrivateNumber value={netProfit} format={formatCurrency} />
           </h3>
           <p className="text-[10px] font-bold text-forest-green/60 mt-2 uppercase tracking-widest">
             Available for distribution
           </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expense Entry Modal-like (Animated inline for 8GB RAM smoothness) */}
        {showAddExpense && (
          <Card className="lg:col-span-1 border-brushed-gold/30 shadow-2xl animate-slide-in-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="text-brushed-gold" size={20} />
                New Entry
              </CardTitle>
              <Button variant="ghost" size="xs" onClick={() => setShowAddExpense(false)}><Trash2 size={16} /></Button>
            </CardHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <Input 
                label="Transaction Date" 
                type="date" 
                value={newExpense.date}
                onChange={e => setNewExpense({...newExpense, date: e.target.value})}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-forest-green px-1">Category</label>
                <select 
                  className="select-field"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option>Supplies</option>
                  <option>Wages</option>
                  <option>Utilities</option>
                  <option>Maintenance</option>
                  <option>Excise Fees</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>
              <Input 
                label="Amount (₹)" 
                type="number" 
                placeholder="0.00"
                value={newExpense.amount || ''}
                onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
              />
              <Input 
                label="Description" 
                placeholder="What was this for?"
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
              />
              <Button variant="gold" className="w-full mt-4 rounded-xl" type="submit">
                Post Transaction
              </Button>
            </form>
          </Card>
        )}

        {/* Expense History Table */}
        <Card className={`${showAddExpense ? 'lg:col-span-2' : 'lg:col-span-3'} border-0 shadow-2xl rounded-3xl overflow-hidden p-0`}>
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-md">
            <div>
              <h3 className="text-xl font-black text-forest-green">Transaction History</h3>
              <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">Recent operational expenditures</p>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brushed-gold/20"
                 />
               </div>
               <select 
                 value={expenseFilter}
                 onChange={e => setExpenseFilter(e.target.value)}
                 className="px-3 py-2 bg-gray-50 border-0 rounded-xl text-xs font-bold text-forest-green focus:ring-2 focus:ring-brushed-gold/20"
               >
                 <option value="all">All Categories</option>
                 <option>Supplies</option>
                 <option>Wages</option>
                 <option>Utilities</option>
               </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest-green/40 text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest-green/40"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-20">
                          <FileText size={48} />
                          <p className="font-black uppercase tracking-[0.2em] text-sm">No Transactions Recorded</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-brushed-gold/5 transition-colors group">
                      <td className="px-6 py-4 text-xs font-bold text-forest-green/60">
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-forest-green/5 text-forest-green border-0 uppercase text-[9px]">
                          {exp.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-forest-green">
                        {exp.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-forest-green">{formatCurrency(exp.amount)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeExpense(exp.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
