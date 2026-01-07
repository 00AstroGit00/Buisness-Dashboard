import { useState, useMemo, Suspense, lazy } from 'react';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AppShell from './layout/AppShell';

// ✅ Lazy Load ALL Components for RAM Efficiency
const DashboardOverview = lazy(() => import('./DashboardOverview'));
const VisualFloorPlan = lazy(() => import('./VisualFloorPlan'));
const Inventory = lazy(() => import('./Inventory'));
const QuickPour = lazy(() => import('./QuickPour'));
const LiquorLedger = lazy(() => import('./LiquorLedger'));
const Accounting = lazy(() => import('./Accounting'));
const EmployeeHub = lazy(() => import('./EmployeeHub'));
const ComplianceVault = lazy(() => import('./ComplianceVault'));
const BillingSystem = lazy(() => import('./BillingSystem'));
const PurchaseInward = lazy(() => import('./PurchaseInward'));
const AnalyticsOverview = lazy(() => import('./AnalyticsOverview'));
const DeepaBrain = lazy(() => import('./DeepaBrain'));
const DigitalAudit = lazy(() => import('./DigitalAudit'));
const SystemMonitor = lazy(() => import('./SystemMonitor'));
const BackupRestore = lazy(() => import('./BackupRestore'));
const PerformanceHUD = lazy(() => import('./PerformanceHUD'));
const SecurityLog = lazy(() => import('./SecurityLog'));
const MaintenanceDashboard = lazy(() => import('./MaintenanceDashboard'));
const EndOfDay = lazy(() => import('./EndOfDay'));
const ExciseReport = lazy(() => import('./ExciseReport'));
const Settings = lazy(() => import('./Settings'));

// ✅ Shared Components
const EmergencyLock = lazy(() => import('./EmergencyLock'));
const OfflineIndicator = lazy(() => import('./OfflineIndicator'));

type Page = 'dashboard' | 'rooms' | 'inventory' | 'quickpour' | 'ledger' | 'accounting' | 'employees' | 'compliance' | 'billing' | 'purchases' | 'analytics' | 'brain' | 'audit' | 'backup' | 'security-log' | 'maintenance' | 'endofday' | 'excise' | 'system' | 'settings';

export default function Dashboard() {
  const { user, hasAccess } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const activePage = useMemo(() => {
    if (hasAccess(currentPage)) return currentPage;
    const fallbacks: Page[] = ['dashboard', 'inventory', 'rooms', 'billing'];
    return fallbacks.find(p => hasAccess(p)) || 'dashboard';
  }, [currentPage, hasAccess]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardOverview />;
      case 'rooms': return <VisualFloorPlan />;
      case 'inventory': return <Inventory />;
      case 'quickpour': return <QuickPour />;
      case 'ledger': return <LiquorLedger />;
      case 'accounting': return <Accounting />;
      case 'employees': return <EmployeeHub />;
      case 'compliance': return <ComplianceVault />;
      case 'billing': return <BillingSystem />;
      case 'purchases': return <PurchaseInward />;
      case 'analytics': return <AnalyticsOverview />;
      case 'brain': return <DeepaBrain />;
      case 'audit': return <DigitalAudit />;
      case 'backup': return <BackupRestore />;
      case 'security-log': return <SecurityLog />;
      case 'maintenance': return <MaintenanceDashboard />;
      case 'endofday': return <EndOfDay />;
      case 'excise': return <ExciseReport />;
      case 'settings': return <Settings />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <AppShell currentPage={activePage} onPageChange={(p) => setCurrentPage(p as Page)}>
      {/* System HUDs */}
      <Suspense fallback={null}>
        <SystemMonitor />
        <PerformanceHUD />
        <OfflineIndicator />
        {user?.role === 'ADMIN' && <EmergencyLock />}
      </Suspense>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-[60vh] text-white">
           <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-brushed-gold animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 size={28} className="text-brushed-gold opacity-30" />
              </div>
           </div>
           <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30 animate-pulse">Initializing Environment</p>
        </div>
      }>
        <motion.div 
          key={activePage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="gpu-accelerated"
        >
          {renderPage()}
        </motion.div>
      </Suspense>
    </AppShell>
  );
}
