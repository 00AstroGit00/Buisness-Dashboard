import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStoreSync } from '../../hooks/useStoreSync';
import { useBusinessStore } from '../../store/useBusinessStore';
import Sidebar from '../Sidebar';
import BottomNavigation from '../BottomNavigation';
import { 
  Menu, Search, Bell, ChevronRight, Command, Building2, Package, User, Hash, ShoppingCart, Save, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrivacyModeToggle from '../PrivacyModeToggle';
import { useSystemPulse } from '../../hooks/useSystemPulse';
import GlobalSearch from '../GlobalSearch';

interface AppShellProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: any) => void;
}

export default function AppShell({ children, currentPage, onPageChange }: AppShellProps) {
  const { user, logout } = useAuth();
  const { inventory, rooms, isOnline, setOnlineStatus, offlineQueue } = useBusinessStore();
  const { status: pulseStatus, domCount } = useSystemPulse();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const syncStatus = useStoreSync();

  // Network Status Monitor
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  // Scroll Detection
  useEffect(() => {
    const handleScroll = (e: any) => {
      setIsScrolled(e.target.scrollTop > 20);
    };
    const mainElement = document.getElementById('main-content');
    mainElement?.addEventListener('scroll', handleScroll);
    return () => mainElement?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050a09] flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-brushed-gold selection:text-forest-green text-white">
      {/* 2026 Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-brushed-gold/10 rounded-full blur-[150px]"></div>
         <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[60%] bg-forest-green/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Global Command Palette */}
      <GlobalSearch 
        isOpen={showSearch} 
        onOpenChange={setShowSearch}
        onPageChange={onPageChange}
      />

      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={logout}
        syncStatus={syncStatus}
      />

      <main 
        id="main-content"
        className="flex-1 overflow-y-auto h-screen relative z-10 scroll-smooth custom-scrollbar"
      >
          <header className={`
            sticky top-0 z-40 transition-all duration-500 px-6 md:px-12 py-6
            ${isScrolled 
              ? 'bg-black/40 backdrop-blur-2xl py-4 border-b border-white/5 shadow-2xl' 
              : 'bg-transparent'
            }
          `}>
             <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-3 glass text-white rounded-2xl border-white/10 touch-target"
                  >
                    <Menu size={20} />
                  </button>
                  
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
                      Deepa <span className="gold-gradient-text">Hotel</span>
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                   {/* System Pulse Indicator */}
                   <div 
                    className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border-white/5"
                    title={`DOM Nodes: ${domCount} | System health optimized for 8GB RAM`}
                   >
                      <div className="relative">
                         <Activity 
                          size={14} 
                          className={`
                            ${pulseStatus === 'healthy' ? 'text-green-500' : 
                              pulseStatus === 'warning' ? 'text-amber-500' : 'text-red-500'}
                          `} 
                         />
                         <motion.div 
                           animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className={`
                             absolute inset-0 rounded-full
                             ${pulseStatus === 'healthy' ? 'bg-green-500' : 
                               pulseStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}
                           `}
                         />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/20 hidden lg:block">Pulse</span>
                   </div>

                   <AnimatePresence>
                     {(!isOnline || offlineQueue.length > 0) && (
                       <motion.div
                         initial={{ opacity: 0, scale: 0.5 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.5 }}
                         className="flex items-center gap-2 px-3 py-1.5 glass rounded-xl border-brushed-gold/30 text-brushed-gold"
                         title={isOnline ? `${offlineQueue.length} items syncing...` : 'Offline - Saving Locally'}
                       >
                          <Save size={16} className={offlineQueue.length > 0 ? 'animate-pulse' : ''} />
                          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                            {isOnline ? 'Syncing' : 'Local Save'}
                          </span>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   <button 
                    onClick={() => setShowSearch(true)}
                    className="hidden md:flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-3 group hover:border-brushed-gold/40 transition-all touch-target"
                   >
                      <Search size={18} className="text-white/40 group-hover:text-brushed-gold" />
                      <span className="text-sm font-bold text-white/20 group-hover:text-white/40">Open Command...</span>
                      <div className="flex items-center gap-1 ml-4 px-2 py-0.5 bg-black/40 rounded-lg border border-white/10">
                        <Command size={10} className="text-white/40" />
                        <span className="text-[10px] font-black text-white/40 uppercase">K</span>
                      </div>
                   </button>

                   <PrivacyModeToggle />
                   
                   <button className="relative p-3.5 glass rounded-2xl text-white border-white/10 touch-target">
                      <Bell size={20} />
                      <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brushed-gold rounded-full border-2 border-black"></span>
                   </button>

                   <div className="hidden sm:block h-10 w-px bg-white/5 mx-2"></div>

                   <button className="flex items-center gap-4 p-2 pr-6 glass rounded-2xl hover:bg-white/5 transition-all group border-white/10 touch-target">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brushed-gold to-brushed-gold-light text-forest-green flex items-center justify-center font-black text-lg shadow-xl shrink-0">
                        {user?.username?.[0] || 'A'}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-black text-white leading-none truncate max-w-[100px]">{user?.username || 'Admin'}</p>
                        <p className="text-[10px] font-black text-brushed-gold uppercase tracking-widest mt-1.5 opacity-60">{user?.role || 'Staff'}</p>
                      </div>
                   </button>
                </div>
             </div>
          </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 lg:pb-16 relative z-10">
          {children}
        </div>
      </main>

      <BottomNavigation 
        currentPage={currentPage} 
        onPageChange={onPageChange} 
        onSearchClick={() => setShowSearch(true)}
      />
    </div>
  );
}
