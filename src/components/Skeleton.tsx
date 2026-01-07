import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}) => {
  const baseStyles = 'bg-gray-200 animate-pulse';
  
  const variants = {
    text: 'rounded h-3 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      style={style}
    />
  );
};

export default Skeleton;
