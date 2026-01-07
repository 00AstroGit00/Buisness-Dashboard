import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 touch-target gpu-accelerated overflow-hidden relative group';
    
    const variants = {
      primary: 'bg-gradient-to-r from-brushed-gold to-brushed-gold-light text-forest-green shadow-[0_8px_20px_rgba(197,160,89,0.3)] hover:shadow-[0_12px_30px_rgba(197,160,89,0.5)] border-0',
      secondary: 'bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10',
      outline: 'bg-transparent border-2 border-brushed-gold text-brushed-gold hover:bg-brushed-gold/10',
      ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/5 border-transparent',
      danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10',
      gold: 'bg-gradient-to-tr from-brushed-gold via-brushed-gold-light to-brushed-gold text-forest-green font-black uppercase tracking-widest',
    };

    const sizes = {
      xs: 'px-4 py-2 text-xs rounded-xl min-h-[32px]',
      sm: 'px-5 py-2.5 text-sm rounded-xl min-h-[40px]',
      md: 'px-6 py-3 text-base rounded-2xl min-h-[48px]',
      lg: 'px-8 py-4 text-lg rounded-[1.25rem] min-h-[56px]',
      xl: 'px-10 py-5 text-xl rounded-[1.5rem] min-h-[64px]',
    };

    const variantStyles = variants[variant] || variants.primary;
    const sizeStyles = sizes[size] || sizes.md;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
