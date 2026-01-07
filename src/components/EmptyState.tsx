import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 empty-state-forest-depth pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="p-8 glass rounded-full border-white/5 mb-8 inline-block empty-state-gold-glow">
          <Icon size={64} className="text-brushed-gold opacity-40" />
        </div>
        
        <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3">
          {title}
        </h3>
        <p className="text-sm font-medium text-white/20 uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
        
        {action && (
          <div className="mt-10">
            {action}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EmptyState;
