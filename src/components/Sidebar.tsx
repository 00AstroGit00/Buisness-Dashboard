import { LayoutDashboard, Package, Calculator, Users, UserCircle, X, Shield, ShoppingCart, ArrowDownCircle, LogOut, FileCheck, FileBarChart, Activity, Cloud, CloudOff, Loader2, TrendingUp, ClipboardCheck, Upload, Wrench, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User } from '../context/AuthContext';

// ... interfaces ...

function MemoryUsageWidget() {
  const [memory, setMemory] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    const updateMemory = () => {
      if ('memory' in performance) {
        const perfMemory = (performance as any).memory;
        setMemory({
          used: Math.round(perfMemory.usedJSHeapSize / (1024 * 1024)),
          total: Math.round(perfMemory.jsHeapSizeLimit / (1024 * 1024)),
        });
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!memory) return null;

  const usagePercent = (memory.used / memory.total) * 100;
  const isHigh = usagePercent > 80;

  return (
    <div className="px-4 py-3 border-t border-brushed-gold/20">
      <div className="flex items-center gap-2 mb-2">
        <Cpu size={14} className={isHigh ? 'text-red-400' : 'text-brushed-gold'} />
        <span className="text-[10px] font-black uppercase tracking-wider text-brushed-gold/70">System Health (RAM)</span>
      </div>
      <div className="w-full bg-forest-green-dark/50 rounded-full h-1.5 mb-1 overflow-hidden border border-brushed-gold/10">
        <div 
          className={`h-full transition-all duration-1000 ${isHigh ? 'bg-red-500' : 'bg-brushed-gold'}`} 
          style={{ width: `${usagePercent}%` }} 
        />
      </div>
      <div className="flex justify-between text-[9px] font-bold text-brushed-gold/50">
        <span>{memory.used}MB USED</span>
        <span>{memory.total}MB LIMIT</span>
      </div>
    </div>
  );
}

export default function Sidebar({ currentPage, onPageChange, isOpen, onClose, user, onLogout, syncStatus }: SidebarProps) {
  // Define all nav items with access requirements
  const allNavItems: Array<NavItem & { adminOnly?: boolean; accountantOnly?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={20} />, accountantOnly: true },
    { id: 'purchases', label: 'Purchase Inward', icon: <ArrowDownCircle size={20} />, accountantOnly: true },
    { id: 'accounting', label: 'Accounting', icon: <Calculator size={20} />, accountantOnly: true },
    { id: 'billing', label: 'Billing', icon: <ShoppingCart size={20} />, adminOnly: true },
    { id: 'endofday', label: 'End of Day', icon: <FileCheck size={20} /> },
    { id: 'excise', label: 'Excise Report', icon: <FileBarChart size={20} /> },
    { id: 'system', label: 'System Health', icon: <Activity size={20} /> },
    { id: 'analytics', label: 'Profit Analytics', icon: <TrendingUp size={20} />, adminOnly: true },
    { id: 'audit', label: 'Digital Audit', icon: <ClipboardCheck size={20} />, adminOnly: true },
    { id: 'backup', label: 'Backup & Restore', icon: <Upload size={20} />, adminOnly: true },
    { id: 'compliance', label: 'Compliance Vault', icon: <Shield size={20} />, adminOnly: true },
    { id: 'employees', label: 'Employee Hub', icon: <UserCircle size={20} />, adminOnly: true },
    { id: 'staff', label: 'Staff', icon: <Users size={20} />, adminOnly: true },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={20} />, adminOnly: true },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter((item) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has full access
    if (user.role === 'accountant') {
      // Accountant can access: dashboard, inventory, purchases, accounting
      return !item.adminOnly;
    }
    return false;
  });

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-forest-green text-brushed-gold shadow-xl border-r border-brushed-gold/20
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-16 lg:pt-0 flex flex-col
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-forest-green/50 rounded-lg transition-colors text-brushed-gold"
        >
          <X size={24} />
        </button>

        {/* Logo Section */}
        <div className="p-6 border-b border-brushed-gold/20 flex flex-col items-center">
          <img
            src="/assets/images/logo-with-branding.png"
            alt="Deepa Restaurant & Tourist Home Logo"
            className="w-full max-w-[180px] h-auto mb-4 object-contain"
            onError={(e) => {
              // Fallback if image doesn't load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="text-center">
            <h1 className="text-xl font-bold text-brushed-gold">Deepa Restaurant & Tourist Home</h1>
            <p className="text-sm text-brushed-gold/80 mt-1">Cherpulassery, Palakkad</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 border touch-manipulation
                ${
                  currentPage === item.id
                    ? 'bg-brushed-gold text-forest-green font-semibold shadow-lg border-brushed-gold/50'
                    : 'text-brushed-gold/90 border-transparent hover:bg-forest-green/50 hover:text-brushed-gold hover:border-brushed-gold/30'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* System Health RAM Widget */}
        <MemoryUsageWidget />

        {/* Sync Status Indicator */}
          <div className={`mb-4 p-3 rounded-lg border transition-all ${
            syncStatus.isSynced && !syncStatus.isSaving
              ? 'bg-gradient-to-r from-brushed-gold/30 to-brushed-gold/10 border-brushed-gold/70 shadow-[0_0_10px_rgba(197,160,89,0.3)]' // Gold when synced to NVMe SSD
              : syncStatus.isSaving
              ? 'bg-blue-500/20 border-blue-400/50'
              : 'bg-yellow-500/20 border-yellow-400/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {syncStatus.isSaving ? (
                <Loader2 className="text-blue-400 animate-spin" size={16} />
              ) : syncStatus.isSynced ? (
                <Cloud className="text-brushed-gold animate-pulse" size={16} />
              ) : (
                <CloudOff className="text-yellow-400" size={16} />
              )}
              <p className={`text-xs font-medium ${
                syncStatus.isSynced && !syncStatus.isSaving
                  ? 'text-brushed-gold animate-pulse' // Gold text when synced to NVMe SSD
                  : syncStatus.isSaving
                  ? 'text-blue-400'
                  : 'text-yellow-400'
              }`}>
                {syncStatus.isSaving
                  ? 'Saving to NVMe SSD...'
                  : syncStatus.isSynced
                  ? 'Synced to NVMe SSD'
                  : 'Not Synced to NVMe SSD'}
              </p>
            </div>
            {syncStatus.lastSyncTime && (
              <p className="text-xs text-brushed-gold/60 mt-1">
                Last sync: {syncStatus.lastSyncTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {syncStatus.error && (
              <p className="text-xs text-red-400 mt-1">Error: {syncStatus.error}</p>
            )}
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-brushed-gold/20">
          {user && (
            <div className="mb-4 p-3 bg-forest-green/20 rounded-lg">
              <p className="text-sm font-medium text-brushed-gold">{user.name}</p>
              <p className="text-xs text-brushed-gold/70 capitalize mt-1">{user.role}</p>
            </div>
          )}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-brushed-gold/90 border border-brushed-gold/30 hover:bg-forest-green/50 hover:text-brushed-gold transition-all touch-manipulation"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <div className="text-xs text-brushed-gold/70 text-center mt-4">
            <p>© 2024 Deepa Restaurant</p>
            <p className="mt-1">3-Star Hotel Management</p>
          </div>
        </div>
      </aside>
    </>
  );
}

