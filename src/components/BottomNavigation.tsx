import { 
  Home, Package, Calculator, Users, 
  BarChart3, Shield, ReceiptText, Wrench, 
  Menu, Building2, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import React from 'react';

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onSearchClick: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactElement;
}

export default function BottomNavigation({ currentPage, onPageChange, onSearchClick }: BottomNavigationProps) {

  const { hasAccess } = useAuth();



  // 2026 Primary Actions for Mobile

  const allNavItems: Array<NavItem & { adminOnly?: boolean; isSearch?: boolean }> = [

    { id: 'inventory', label: 'Stock', icon: <Package size={20} /> },

    { id: 'rooms', label: 'Rooms', icon: <Building2 size={20} /> },

    { id: 'search', label: 'Search', icon: <Search size={20} />, isSearch: true },

    { id: 'billing', label: 'Sales', icon: <ReceiptText size={20} /> },

    { id: 'analytics', label: 'Stats', icon: <BarChart3 size={20} />, adminOnly: true }

  ];



  // Filter based on access

  const navItems = allNavItems.filter((item) => item.isSearch || hasAccess(item.id)).slice(0, 5);



  return (

    <nav className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-8 lg:hidden pointer-events-none">

      <div className="max-w-lg mx-auto pointer-events-auto">

        <div className="bg-[#050a09]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around h-20 px-4 relative overflow-hidden">

          {/* Subtle background glow */}

          <div className="absolute inset-0 bg-gradient-to-t from-brushed-gold/5 to-transparent pointer-events-none"></div>

          

          {navItems.map((item) => {

            const isActive = currentPage === item.id;

            return (

              <button

                key={item.id}

                onClick={() => item.isSearch ? onSearchClick() : onPageChange(item.id)}

                className={`

                  relative flex flex-col items-center justify-center

                  min-h-[56px] min-w-[56px] rounded-2xl

                  transition-all duration-500 ease-out active:scale-90

                  ${isActive

                    ? 'text-brushed-gold'

                    : 'text-white/30 hover:text-white/60'

                  }

                `}

                aria-label={item.label}

              >

                {/* Active Indicator Bar */}

                {isActive && (

                  <motion.div 

                    layoutId="bottom-nav-active"

                    className="absolute -top-4 w-8 h-1 bg-brushed-gold rounded-full shadow-[0_0_12px_rgba(197,160,89,1)]"

                  />

                )}

                

                <div className={`relative z-10 transition-transform duration-500 ${isActive ? 'scale-125 -translate-y-1' : ''}`}>

                  {item.icon}

                </div>

                

                <span className={`

                  relative z-10 text-[8px] font-black uppercase tracking-[0.2em] mt-2

                  transition-all duration-500

                  ${isActive ? 'opacity-100' : 'opacity-40'}

                `}>

                  {item.label}

                </span>

              </button>

            );

          })}

        </div>

      </div>

      

      {/* Safe area spacer for devices with home indicator */}

      <div className="h-safe-area-inset-bottom" />

    </nav>

  );

}
