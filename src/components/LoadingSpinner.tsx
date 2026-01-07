import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component
 * Displayed while AuthContext initializes (loading session from sessionStorage)
 * Prevents blank-screen flash and ensures auth state is known before rendering Login/Dashboard
 */
export default function LoadingSpinner(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#050a09] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-brushed-gold/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[60%] bg-forest-green/10 rounded-full blur-[120px]"></div>

      <div className="flex flex-col items-center relative z-10">
        <div className="relative mb-12">
          {/* Custom Peg Measure Animation */}
          <div className="w-24 h-32 relative">
             {/* Top of Peg */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 inset-x-0 h-12 border-2 border-brushed-gold/40 rounded-full flex items-center justify-center"
             >
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-brushed-gold to-transparent opacity-40"></div>
             </motion.div>
             
             {/* Body of Peg */}
             <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-brushed-gold/20 via-white/5 to-transparent border-x border-white/10 rounded-b-2xl">
                {/* Liquid Level */}
                <motion.div 
                  initial={{ height: '0%' }}
                  animate={{ height: '80%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="absolute bottom-0 inset-x-0 bg-brushed-gold/30 rounded-b-2xl blur-sm"
                />
             </div>

             {/* Base/Golden Core */}
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-brushed-gold rounded-full shadow-[0_0_20px_rgba(197,160,89,1)]"
             />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
            Deepa <span className="gold-gradient-text">Hotel</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Initializing Executive Node</p>
          
          <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden relative">
             <motion.div 
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 bg-gradient-to-r from-transparent via-brushed-gold to-transparent"
             />
          </div>
        </div>
      </div>
    </div>
  );
}
