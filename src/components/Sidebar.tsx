import React from 'react';
import type { SyncStatus } from '../hooks/useStoreSync';
import SystemHealth from './SystemHealth';
import {
  LayoutDashboard,
  Package,
  ArrowDownCircle,
  Calculator,
  ShoppingCart,
  FileCheck,
  FileBarChart,
  TrendingUp,
  ClipboardCheck,
  Upload,
  Shield,
  UserCircle,
  Users,
  Wrench,
  Settings,
  X,
  LogOut,
  Menu,
  User,
  Briefcase,
  BarChart3,
  Building,
  FileText,
  DollarSign,
  Calendar,
  TrendingDown,
  Archive,
  UserCog,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  adminOnly?: boolean;
  accountantOnly?: boolean;
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  user?: { name?: string; username?: string; role?: string } | null;
  onLogout: () => void;
  syncStatus?: SyncStatus;
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
    // System Health removed as it is now a widget
    { id: 'analytics', label: 'Profit Analytics', icon: <TrendingUp size={20} />, adminOnly: true },
    { id: 'audit', label: 'Digital Audit', icon: <ClipboardCheck size={20} />, adminOnly: true },
    { id: 'backup', label: 'Backup & Restore', icon: <Upload size={20} />, adminOnly: true },
    { id: 'compliance', label: 'Compliance Vault', icon: <Shield size={20} />, adminOnly: true },
    { id: 'employees', label: 'Employee Hub', icon: <UserCircle size={20} />, adminOnly: true },
    { id: 'staff', label: 'Staff', icon: <Users size={20} />, adminOnly: true },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={20} />, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, adminOnly: true },
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
          w-64 bg-gradient-to-b from-forest-green to-forest-green-light text-brushed-gold shadow-2xl border-r border-brushed-gold/20
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          pt-16 lg:pt-0 flex flex-col
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-forest-green/30 rounded-full transition-colors text-brushed-gold bg-black/10"
        >
          <X size={20} />
        </button>

        {/* Logo Section */}
        <div className="p-6 border-b border-brushed-gold/20 flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mb-4">
            <Building className="text-brushed-gold" size={40} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-brushed-gold">Deepa Restaurant & Tourist Home</h1>
            <p className="text-sm text-brushed-gold/80 mt-1">Cherpulassery, Palakkad</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-brushed-gold/20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 border touch-manipulation
                ${
                  currentPage === item.id
                    ? 'bg-brushed-gold text-forest-green font-semibold shadow-lg border-brushed-gold/50'
                    : 'text-brushed-gold/90 border-transparent hover:bg-forest-green/30 hover:text-brushed-gold hover:border-brushed-gold/30'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* System Health Widget */}
        <div className="px-4 pb-2">
          <SystemHealth />
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-brushed-gold/20 bg-forest-green/10">
          {user && (
            <div className="mb-4 p-3 bg-gradient-to-r from-brushed-gold/10 to-brushed-gold/5 rounded-xl border border-brushed-gold/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-forest-green/20 rounded-full">
                  <User className="text-brushed-gold" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brushed-gold truncate max-w-[120px]">{user.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Briefcase size={12} className="text-brushed-gold/70" />
                    <p className="text-xs text-brushed-gold/70 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-brushed-gold/90 border border-brushed-gold/30 hover:bg-forest-green/30 hover:text-brushed-gold transition-all touch-manipulation bg-gradient-to-r from-forest-green/50 to-forest-green/30"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
          <div className="text-xs text-brushed-gold/60 text-center mt-4 flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <ShieldCheck size={12} className="text-brushed-gold/60" />
              <span>Secure System</span>
            </div>
            <p>© 2024 Deepa Restaurant</p>
            <p className="mt-1">3-Star Hotel Management</p>
          </div>
        </div>
      </aside>
    </>
  );
}

