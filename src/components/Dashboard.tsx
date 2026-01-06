import { useState, useMemo, Suspense, lazy } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStoreSync } from '../hooks/useStoreSync';

// ✅ Lazy Load ALL Components to save RAM on your 8GB HP Laptop
// Only the visible page is loaded into memory at any given time
const DashboardOverview = lazy(() => import('./DashboardOverview'));
const RoomManagement = lazy(() => import('./RoomManagement'));
const Inventory = lazy(() => import('./Inventory'));
const Accounting = lazy(() => import('./Accounting'));
const EmployeeHub = lazy(() => import('./EmployeeHub'));
const ComplianceVault = lazy(() => import('./ComplianceVault'));
const BillingSystem = lazy(() => import('./BillingSystem'));
const PurchaseInward = lazy(() => import('./PurchaseInward'));
const ProfitAnalytics = lazy(() => import('./ProfitAnalytics'));
const DigitalAudit = lazy(() => import('./DigitalAudit'));
const SystemMonitor = lazy(() => import('./SystemMonitor'));
const BackupRestore = lazy(() => import('./BackupRestore'));
const PerformanceHUD = lazy(() => import('./PerformanceHUD'));
const SecurityLog = lazy(() => import('./SecurityLog'));
const MaintenanceDashboard = lazy(() => import('./MaintenanceDashboard'));
const EndOfDay = lazy(() => import('./EndOfDay'));
const ExciseReport = lazy(() => import('./ExciseReport'));
const SystemHealth = lazy(() => import('./SystemHealth'));

// ✅ Lazy Load Less-Critical Shared Components
const EmergencyLock = lazy(() => import('./EmergencyLock'));
const OfflineIndicator = lazy(() => import('./OfflineIndicator'));

// Keep critical UI components eagerly loaded for instant display
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import PrivacyModeToggle from './PrivacyModeToggle';

type Page = 'dashboard' | 'rooms' | 'inventory' | 'accounting' | 'employees' | 'compliance' | 'billing' | 'purchases' | 'analytics' | 'audit' | 'backup' | 'security-log' | 'maintenance' | 'endofday' | 'excise' | 'system';

export default function Dashboard() {
  const { user, logout, hasAccess } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const syncStatus = useStoreSync();

  // FIX: Access control without infinite loops
  const activePage = useMemo(() => {
    if (hasAccess(currentPage)) return currentPage;
    const fallbacks: Page[] = ['dashboard', 'inventory', 'rooms', 'billing'];
    return fallbacks.find(p => hasAccess(p)) || 'dashboard';
  }, [currentPage, hasAccess]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardOverview />;
      case 'rooms': return <RoomManagement />;
      case 'inventory': return <Inventory />;
      case 'accounting': return <Accounting />;
      case 'employees': return <EmployeeHub />;
      case 'compliance': return <ComplianceVault />;
      case 'billing': return <BillingSystem />;
      case 'purchases': return <PurchaseInward />;
      case 'analytics': return <ProfitAnalytics />;
      case 'audit': return <DigitalAudit />;
      case 'backup': return <BackupRestore />;
      case 'security-log': return <SecurityLog />;
      case 'maintenance': return <MaintenanceDashboard />;
      case 'endofday': return <EndOfDay />;
      case 'excise': return <ExciseReport />;
      case 'system': return <SystemHealth />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* ✅ Lazy load system monitoring components to save RAM */}
      <Suspense fallback={null}>
        <SystemMonitor />
      </Suspense>
      <Suspense fallback={null}>
        <PerformanceHUD />
      </Suspense>
      <Suspense fallback={null}>
        <OfflineIndicator />
      </Suspense>
      {user?.role === 'admin' && (
        <Suspense fallback={null}>
          <EmergencyLock />
        </Suspense>
      )}
      
      {/* Sidebar for Desktop / Overlay for Mobile */}
      <Sidebar 
        currentPage={activePage} 
        onPageChange={(p) => { setCurrentPage(p as Page); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={logout}
        syncStatus={syncStatus}
      />

      <main className="flex-1 overflow-y-auto h-screen pb-20 lg:pb-0">
          {/* Mobile Header Optimized for S23 Ultra */}
          <header className="lg:hidden bg-[#0a3d31] p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
             <div className="flex flex-col">
               <h1 className="text-[#c5a059] font-bold text-lg">Deepa Hotel</h1>
               <span className="text-[#c5a059]/70 text-[10px] uppercase tracking-widest">Cherpulassery</span>
             </div>
             <div className="flex items-center gap-2">
               <PrivacyModeToggle />
               <button 
                 onClick={() => setSidebarOpen(true)} 
                 className="text-[#c5a059] p-2"
                 title="Open Menu"
                 aria-label="Open navigation menu"
               >
                 <Menu size={28} />
               </button>
             </div>
          </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-64 text-[#0a3d31]">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-sm font-medium">Loading {activePage}...</p>
            </div>
          }>
            {renderPage()}
          </Suspense>
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <div className="lg:hidden border-t border-gray-200">
        <BottomNavigation currentPage={activePage} onPageChange={(p) => setCurrentPage(p as Page)} />
      </div>
    </div>
  );
}