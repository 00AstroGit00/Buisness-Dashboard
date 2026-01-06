/**
 * Bottom Navigation Component
 * Thumb-friendly navigation for Samsung S23 Ultra and mobile devices
 * All primary controls within thumb-reach zone
 */

import { LayoutDashboard, Package, Calculator, UserCircle, Folder, ReceiptText, TrendingUp } from 'lucide-react';
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
    { id: 'dashboard', label: 'Dash', icon: <LayoutDashboard size={24} /> },
    { id: 'inventory', label: 'Stock', icon: <Package size={24} /> },
    { id: 'accounting', label: 'Acct', icon: <Calculator size={24} /> },
    { id: 'employees', label: 'Staff', icon: <UserCircle size={24} />, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={24} />, adminOnly: true },
    { id: 'compliance', label: 'Vault', icon: <Folder size={24} />, adminOnly: true },
    { id: 'billing', label: 'Bill', icon: <ReceiptText size={24} />, adminOnly: true },
  ];

  // Filter based on access
  const navItems = allNavItems.filter((item) => hasAccess(item.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-forest-green border-t-2 border-brushed-gold/30 shadow-2xl lg:hidden">
      <div className="flex items-center justify-around h-20 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                flex flex-col items-center justify-center 
                min-h-[64px] min-w-[64px] px-3 py-2 rounded-xl
                transition-all duration-200 touch-manipulation
                ${isActive 
                  ? 'bg-brushed-gold text-forest-green shadow-lg scale-105' 
                  : 'text-brushed-gold/70 hover:text-brushed-gold hover:bg-forest-green/50'
                }
              `}
              aria-label={item.label}
            >
              <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </div>
              <span className={`text-xs font-medium mt-1 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Safe area spacer for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-forest-green" />
    </nav>
  );
}

