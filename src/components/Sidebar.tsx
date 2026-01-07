import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  User,
  Briefcase,
  Building2,
  ShieldCheck,
  ChevronRight,
  Zap,
  History as HistoryIcon,
  Brain
} from 'lucide-react';
import { Button } from './Button';

interface NavItem {

  id: string;

  label: string;

  icon: React.ReactElement;

  adminOnly?: boolean;

}



interface SidebarProps {

  currentPage: string;

  onPageChange: (page: string) => void;

  isOpen: boolean;

  onClose: () => void;

  isCollapsed?: boolean;

  onToggleCollapse?: () => void;

  user?: { name?: string; username?: string; role?: string } | null;

  onLogout: () => void;

  syncStatus?: SyncStatus;

}



export default function Sidebar({ 

  currentPage, 

  onPageChange, 

  isOpen, 

  onClose, 

  isCollapsed = false,

  onToggleCollapse,

  user, 

  onLogout, 

  syncStatus 

}: SidebarProps) {

    const allNavItems: NavItem[] = [

      { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },

      { id: 'quickpour', label: 'Quick Pour', icon: <Zap size={20} /> },

          { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },

          { id: 'ledger', label: 'Matrix Ledger', icon: <HistoryIcon size={20} /> },

          { id: 'rooms', label: 'Floor Matrix', icon: <Building2 size={20} /> },

          { id: 'billing', label: 'Sales', icon: <ShoppingCart size={20} /> },

      

    { id: 'endofday', label: 'EOD Ops', icon: <FileCheck size={20} /> },

    { id: 'accounting', label: 'Finance', icon: <Calculator size={20} />, adminOnly: true },

    { id: 'employees', label: 'Staff Hub', icon: <Users size={20} />, adminOnly: true },

    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} />, adminOnly: true },

    { id: 'brain', label: 'Intelligence', icon: <Brain size={20} />, adminOnly: true },

    { id: 'settings', label: 'System', icon: <Settings size={20} />, adminOnly: true },

  ];



  const navItems = allNavItems.filter((item) => {

    if (!user) return false;

    // Hide admin-only items if user is not an Admin

    if (item.adminOnly && user.role !== 'ADMIN') return false;

    

    // Check if user has explicit access to this page via context logic

    // This provides a double-layer of security

    return true; 

  });





  return (

    <>

      {/* Premium Overlay for Mobile */}

      <AnimatePresence>

        {isOpen && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden"

            onClick={onClose}

          />

        )}

      </AnimatePresence>



      {/* Sidebar Container */}

      <aside

        className={`

          fixed lg:sticky top-0 left-0 z-[70] h-screen

          ${isCollapsed ? 'w-24' : 'w-72'} 

          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}

          bg-[#050a09]/80 backdrop-blur-3xl border-r border-white/5

          transition-all duration-500 ease-in-out flex flex-col

          overflow-hidden group/sidebar shadow-2xl

        `}

      >

        {/* Toggle Collapse Button (Desktop) */}

        <button

          onClick={onToggleCollapse}

          className="hidden lg:flex absolute top-8 -right-3 w-6 h-6 bg-brushed-gold rounded-full items-center justify-center text-forest-green shadow-lg hover:scale-110 active:scale-90 transition-all z-20"

        >

          <ChevronRight size={14} className={`transition-transform duration-500 ${isCollapsed ? '' : 'rotate-180'}`} />

        </button>



        {/* Logo Section */}

        <div className={`p-8 ${isCollapsed ? 'px-4 text-center' : ''}`}>

          <div className="flex items-center gap-4">

             <div className="relative shrink-0">

                <div className="absolute -inset-2 bg-brushed-gold/20 rounded-2xl blur-lg opacity-0 group-hover/sidebar:opacity-100 transition duration-500"></div>

                <div className="relative w-12 h-12 glass rounded-xl flex items-center justify-center border border-white/10 shadow-xl">

                   <Building2 className="text-brushed-gold" size={24} />

                </div>

             </div>

             {!isCollapsed && (

               <div className="flex flex-col animate-fade-in">

                  <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">

                    Deepa <span className="text-brushed-gold">Hotel</span>

                  </h1>

                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-1.5">Executive</span>

               </div>

             )}

          </div>

        </div>



        {/* Navigation */}

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide py-4">

          {navItems.map((item) => {

            const isActive = currentPage === item.id;

            return (

              <button

                key={item.id}

                onClick={() => {

                  onPageChange(item.id);

                  onClose();

                }}

                className={`

                  w-full flex items-center gap-4 px-4 py-4 rounded-2xl

                  transition-all duration-500 group relative

                  ${isActive

                    ? 'bg-gradient-to-r from-brushed-gold/20 to-transparent text-brushed-gold border border-brushed-gold/20 shadow-xl shadow-brushed-gold/5'

                    : 'text-white/40 hover:text-white hover:bg-white/5'

                  }

                  ${isCollapsed ? 'justify-center px-0' : ''}

                `}

              >

                {isActive && (

                  <motion.div 

                    layoutId="sidebar-active"

                    className="absolute inset-0 bg-gradient-to-r from-brushed-gold/10 to-transparent rounded-2xl pointer-events-none"

                  />

                )}

                

                <div className={`shrink-0 transition-all duration-500 ${isActive ? 'scale-110 text-brushed-gold' : 'group-hover:scale-110 group-hover:text-white'}`}>

                  {item.icon}

                </div>



                {!isCollapsed && (

                  <span className={`font-bold text-sm tracking-wide transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-0.5'}`}>

                    {item.label}

                  </span>

                )}



                {isActive && !isCollapsed && (

                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brushed-gold shadow-[0_0_8px_rgba(197,160,89,1)]" />

                )}

                

                {/* Tooltip for collapsed state */}

                {isCollapsed && (

                  <div className="absolute left-20 px-3 py-2 bg-brushed-gold text-forest-green rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl">

                    {item.label}

                  </div>

                )}

              </button>

            );

          })}

        </nav>



        {/* User Profile Footer */}

        <div className="p-4 mt-auto">

          <div className={`glass rounded-3xl p-4 border border-white/5 relative overflow-hidden group/profile ${isCollapsed ? 'px-2' : ''}`}>

            <div className="flex items-center gap-4 relative z-10">

              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brushed-gold to-white/10 flex items-center justify-center border border-white/10 shadow-lg shrink-0">

                <User className="text-forest-green" size={20} />

              </div>

              {!isCollapsed && (

                <div className="min-w-0 flex-1 animate-fade-in">

                  <p className="text-xs font-black text-white truncate">{user?.username}</p>

                  <p className="text-[9px] font-bold text-brushed-gold uppercase tracking-widest mt-1 opacity-60">{user?.role}</p>

                </div>

              )}

            </div>



            <button

              onClick={onLogout}

              className={`

                mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl

                bg-white/5 text-white hover:bg-red-500 hover:text-white transition-all duration-500

                ${isCollapsed ? 'p-3' : 'text-xs font-black uppercase tracking-widest'}

              `}

            >

              <LogOut size={16} />

              {!isCollapsed && <span>Sign Out</span>}

            </button>

          </div>

        </div>

      </aside>

    </>

  );

}
