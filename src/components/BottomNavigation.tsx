/**
 * Bottom Navigation Component
 * Thumb-friendly navigation for Samsung S23 Ultra and mobile devices
 * All primary controls within thumb-reach zone
 */

import { LayoutDashboard, Package, Calculator, UserCircle, Folder, ReceiptText, TrendingUp, Settings, Home, ShoppingCart, FileText, Shield, Users, BarChart3, Archive, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type React from 'react';

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  const { hasAccess } = useAuth();

  // All available nav items
  const allNavItems: Array<NavItem & { adminOnly?: boolean }> = [
    { id: 'dashboard', label: 'Home', icon: <Home size={24} /> },
    { id: 'inventory', label: 'Stock', icon: <Package size={24} /> },
    { id: 'accounting', label: 'Finance', icon: <Calculator size={24} /> },
    { id: 'employees', label: 'Staff', icon: <Users size={24} />, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={24} />, adminOnly: true },
    { id: 'compliance', label: 'Compliance', icon: <Shield size={24} />, adminOnly: true },
    { id: 'billing', label: 'Billing', icon: <ReceiptText size={24} />, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: <Wrench size={24} />, adminOnly: true }
  ];

  // Filter based on access
  const navItems = allNavItems.filter((item) => hasAccess(item.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-forest-green to-forest-green-light border-t-2 border-brushed-gold/30 shadow-2xl lg:hidden">
      <div className="flex items-center justify-around h-20 px-2 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                flex flex-col items-center justify-center
                min-h-[60px] min-w-[60px] px-2 py-1.5 rounded-2xl
                transition-all duration-200 touch-manipulation
                ${isActive
                  ? 'bg-gradient-to-b from-brushed-gold to-brushed-gold-light text-forest-green shadow-xl scale-105'
                  : 'text-brushed-gold/80 hover:text-brushed-gold hover:bg-forest-green/30'
                }
              `}
              aria-label={item.label}
            >
              <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area spacer for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-gradient-to-t from-forest-green to-forest-green-light" />
    </nav>
  );
}

