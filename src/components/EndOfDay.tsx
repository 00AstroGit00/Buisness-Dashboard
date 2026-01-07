/**
 * End of Day Summary Component - Upgraded UI
 * Daily Closing Report with Export and Auto-Backup
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Package, 
  DollarSign, 
  CheckCircle2, 
  Save, 
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Cloud,
  ChevronRight,
  Printer,
  ShieldCheck,
  Building2,
  Clock,
  PieChart
} from 'lucide-react';
import { useStore } from '../store/Store';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { exportEndOfDayReport, exportInventoryToExcel } from '../utils/endOfDayExporter';
import { createBackup, getBackupReminderStatus } from '../utils/backupManager';
import { scheduleAutoSync, getSyncStatus, triggerManualSync } from '../utils/cloudSync';
import PrivateNumber from './PrivateNumber';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

export default function EndOfDay() {
  const { inventory, dailySales, expenses } = useStore();
  const [backupStatus, setBackupStatus] = useState<{ lastBackup: Date | null; nextBackup: Date | null } | null>(null);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ lastSync: Date | null; nextSync: Date | null; syncCount: number } | null>(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const closingReport = useMemo(() => {
    const totalPegsSold = inventory.reduce((sum, item) => sum + (item.sales || 0), 0);
    const todaySales = dailySales.filter((sale) => sale.date === today);
    const roomRevenue = todaySales.reduce((sum, sale) => sum + sale.roomRent, 0);
    const restaurantRevenue = todaySales.reduce((sum, sale) => sum + sale.restaurantBills, 0);
    const barRevenue = todaySales.reduce((sum, sale) => sum + sale.barSales, 0);
    const totalRevenue = roomRevenue + restaurantRevenue + barRevenue;
    const todayExpenses = expenses.filter((expense) => expense.date === today);
    const totalExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expensesByCategory = todayExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    const netProfit = totalRevenue - totalExpenses;

    return {
      date: today,
      totalPegsSold,
      roomRevenue,
      restaurantRevenue,
      barRevenue,
      totalRevenue,
      totalExpenses,
      expensesByCategory,
      netProfit,
      salesCount: todaySales.length,
      expenseCount: todayExpenses.length,
    };
  }, [inventory, dailySales, expenses, today]);

  const handleAutoBackup = useCallback(() => {
    const backupFile = createBackup();
    if (backupFile) {
      setBackupStatus(getBackupReminderStatus());
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Auto-Backup Complete', { body: `Backup saved: ${backupFile.name}` });
      }
    }
  }, []);

  useEffect(() => {
    let cleanupSync: (() => void) | undefined;
    try { cleanupSync = scheduleAutoSync(); } catch (error) { console.error(error); }
    
    const checkBackupStatus = () => {
      setBackupStatus(getBackupReminderStatus());
      setSyncStatus(getSyncStatus());
      const now = new Date();
      if ((now.getHours() === 22 && now.getMinutes() >= 30) || (now.getHours() === 23 && now.getMinutes() <= 30)) {
        setShowBackupReminder(true);
      }
    };

    checkBackupStatus();
    const interval = setInterval(checkBackupStatus, 60000);
    return () => { clearInterval(interval); if (cleanupSync) cleanupSync(); };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Operational Closing</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Daily <span className="text-brushed-gold">Settlement</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1">Business Day: {new Date(today).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <Clock size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">Auto-closing at 11:59 PM</span>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" leftIcon={<Printer size={18} />} className="rounded-2xl border-forest-green/20">
             Print Summary
           </Button>
           <Button 
             variant="gold" 
             onClick={() => exportEndOfDayReport(closingReport, dailySales.filter(s => s.date === today), expenses.filter(e => e.date === today))}
             leftIcon={<Download size={18} />}
             className="rounded-2xl shadow-xl shadow-brushed-gold/10"
           >
             Final Export
           </Button>
        </div>
      </div>

      {/* Backup Reminder Banner - Upgraded */}
      {showBackupReminder && (
        <Card className="bg-forest-green border-0 shadow-2xl relative overflow-hidden group p-0">
           <div className="absolute top-0 right-0 p-8 opacity-10 animate-pulse"><Bell size={120} /></div>
           <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brushed-gold">
                    <Cloud size={32} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-white">Daily Backup Required</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Secure your data before closing the terminal</p>
                 </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                 <Button variant="gold" className="flex-1 md:flex-none rounded-xl" onClick={handleAutoBackup} leftIcon={<Save size={18} />}>Execute Backup</Button>
                 <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl" onClick={() => setShowBackupReminder(false)}>Later</Button>
              </div>
           </div>
        </Card>
      )}

      {/* Closing Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-xl border-l-4 border-forest-green">
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-gray-400">Inventory Volume</p>
              <Package className="text-forest-green" size={18} />
           </CardHeader>
           <h3 className="text-3xl font-black text-forest-green tracking-tighter">
              {formatNumber(closingReport.totalPegsSold, 0)} <span className="text-xs uppercase text-gray-400">Pegs</span>
           </h3>
           <p className="text-[10px] font-bold text-green-600 mt-2 uppercase flex items-center gap-1">
              <TrendingUp size={10} /> Volume Optimized
           </p>
        </Card>

        <Card className="bg-white border-0 shadow-xl border-l-4 border-brushed-gold">
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-gray-400">Total Inflow</p>
              <ArrowUpRight className="text-brushed-gold" size={18} />
           </CardHeader>
           <h3 className="text-3xl font-black text-forest-green tracking-tighter">
              <PrivateNumber value={closingReport.totalRevenue} format={formatCurrency} />
           </h3>
           <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-[8px] border-0">{closingReport.salesCount} Settlements</Badge>
           </div>
        </Card>

        <Card className="bg-white border-0 shadow-xl border-l-4 border-red-500">
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-gray-400">Operational Outflow</p>
              <ArrowDownRight className="text-red-500" size={18} />
           </CardHeader>
           <h3 className="text-3xl font-black text-forest-green tracking-tighter">
              <PrivateNumber value={closingReport.totalExpenses} format={formatCurrency} />
           </h3>
           <p className="text-[10px] font-bold text-red-400 mt-2 uppercase tracking-widest">{closingReport.expenseCount} Transactions</p>
        </Card>

        <Card className={`border-0 shadow-xl relative overflow-hidden ${closingReport.netProfit >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-red-500'} text-white`}>
           <div className="absolute bottom-0 right-0 p-4 opacity-10"><TrendingUp size={80} /></div>
           <CardHeader className="mb-2">
              <p className="text-[10px] font-black uppercase text-white/40">Net Daily Yield</p>
              <ShieldCheck className="text-white/60" size={18} />
           </CardHeader>
           <h3 className="text-3xl font-black tracking-tighter">
              <PrivateNumber value={closingReport.netProfit} format={formatCurrency} alwaysBlur={true} />
           </h3>
           <p className="text-[10px] font-bold text-white/60 mt-2 uppercase">
              {closingReport.totalRevenue > 0 ? `${formatNumber((closingReport.netProfit / closingReport.totalRevenue) * 100, 1)}% Margin Rate` : 'No yield'}
           </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown - Upgraded */}
        <Card className="bg-white border-0 shadow-2xl rounded-3xl p-8 overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Building2 size={120} /></div>
           <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-brushed-gold/10 text-brushed-gold rounded-2xl"><DollarSign size={24} /></div>
                 <div>
                    <CardTitle className="text-xl font-black">Revenue Streams</CardTitle>
                    <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">Inflow by department</p>
                 </div>
              </div>
           </CardHeader>
           
           <div className="mt-8 space-y-4 relative z-10">
              <StreamRow label="Room Architecture" value={closingReport.roomRevenue} color="bg-forest-green" total={closingReport.totalRevenue} />
              <StreamRow label="Dining & Cuisine" value={closingReport.restaurantRevenue} color="bg-brushed-gold" total={closingReport.totalRevenue} />
              <StreamRow label="Spirit Portfolio" value={closingReport.barRevenue} color="bg-forest-green-light" total={closingReport.totalRevenue} />
              
              <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                 <span className="text-xs font-black uppercase text-forest-green tracking-widest">Total Daily Inflow</span>
                 <span className="text-2xl font-black text-forest-green">{formatCurrency(closingReport.totalRevenue)}</span>
              </div>
           </div>
        </Card>

        {/* Expenses Breakdown - Upgraded */}
        <Card className="bg-white border-0 shadow-2xl rounded-3xl p-8 overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform"><PieChart size={120} /></div>
           <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><TrendingDown size={24} /></div>
                 <div>
                    <CardTitle className="text-xl font-black">Cost Centers</CardTitle>
                    <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">Outflow Categorization</p>
                 </div>
              </div>
           </CardHeader>

           <div className="mt-8 space-y-4 relative z-10">
              {Object.entries(closingReport.expensesByCategory).length > 0 ? (
                Object.entries(closingReport.expensesByCategory).map(([cat, val]) => (
                  <StreamRow key={cat} label={cat} value={val} color="bg-red-500" total={closingReport.totalExpenses} />
                ))
              ) : (
                <div className="py-12 text-center">
                   <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.3em]">No costs logged today</p>
                </div>
              )}

              <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                 <span className="text-xs font-black uppercase text-forest-green tracking-widest">Total Operating Cost</span>
                 <span className="text-2xl font-black text-red-600">{formatCurrency(closingReport.totalExpenses)}</span>
              </div>
           </div>
        </Card>
      </div>

      {/* Backup & Sync Status Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="border-0 shadow-xl rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-white">
            <CardHeader className="mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-forest-green text-brushed-gold rounded-2xl"><History size={24} /></div>
                  <div>
                     <CardTitle className="text-lg font-black">System Snapshots</CardTitle>
                     <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">Local redundant storage</p>
                  </div>
               </div>
            </CardHeader>
            <div className="space-y-4">
               <div className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-gray-400">Last Redundancy</span>
                  <span className="text-xs font-bold text-forest-green">{backupStatus?.lastBackup?.toLocaleString('en-IN') || 'None'}</span>
               </div>
               <div className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-gray-400">Next Scheduled</span>
                  <span className="text-xs font-bold text-brushed-gold">Tonight, 11:00 PM</span>
               </div>
               <Button variant="secondary" className="w-full rounded-2xl h-14" leftIcon={<Save size={18} />} onClick={handleAutoBackup}>Manual Backup</Button>
            </div>
         </Card>

         <Card className="border-0 shadow-xl rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-white">
            <CardHeader className="mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl"><Cloud size={24} /></div>
                  <div>
                     <CardTitle className="text-lg font-black">Cloud Synchronization</CardTitle>
                     <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">Off-site data mirror</p>
                  </div>
               </div>
            </CardHeader>
            <div className="space-y-4">
               <div className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-gray-400">Sync Status</span>
                  <Badge variant="success" className="text-[8px] uppercase font-black border-0">Synchronized</Badge>
               </div>
               <div className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-gray-400">Mirror Count</span>
                  <span className="text-xs font-bold text-forest-green">{syncStatus?.syncCount || 0} Successful</span>
               </div>
               <Button variant="secondary" className="w-full rounded-2xl h-14" leftIcon={<Download size={18} />} onClick={triggerManualSync}>Force Cloud Mirror</Button>
            </div>
         </Card>
      </div>
    </div>
  );
}

function StreamRow({ label, value, color, total }: { label: string, value: number, color: string, total: number }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-xs font-black text-forest-green tracking-tight">{label}</span>
          <span className="text-xs font-black text-forest-green">{formatCurrency(value)}</span>
       </div>
       <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-1000`} 
            style={{ width: `${percent}%` }}
          />
       </div>
    </div>
  );
}
