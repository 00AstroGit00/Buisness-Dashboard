import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glass?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = true,
  glass = true,
  padded = true
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        rounded-[2rem] transition-all duration-500 ease-out border border-white/5 gpu-accelerated
        ${glass ? 'glass' : 'bg-white/5'}
        ${hoverable ? 'hover:scale-[1.02] hover:bg-white/[0.07] hover:border-white/10 cursor-pointer shadow-2xl' : ''}
        ${padded ? 'p-6 md:p-8' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-6 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-black text-white gold-gradient-text tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-white/70 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mt-8 pt-6 border-t border-white/5 ${className}`}>
    {children}
  </div>
);

export default Card;
