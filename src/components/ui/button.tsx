import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  animated?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    animated = true,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-[#3244c7] text-white hover:bg-[#2938b3] focus:ring-[#3244c7] shadow-lg shadow-[#3244c7]/25 hover:shadow-xl hover:shadow-[#3244c7]/30',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-200',
      outline: 'border-2 border-[#3244c7] bg-transparent text-[#3244c7] hover:bg-[#3244c7] hover:text-white focus:ring-[#3244c7]',
      ghost: 'text-gray-600 hover:text-[#3244c7] hover:bg-gray-50 focus:ring-gray-500'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    const animatedClasses = animated 
      ? 'hover:scale-105 active:scale-95 transition-transform duration-100' 
      : '';

    const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${animatedClasses} ${className}`;
      
    if (animated && loading) {
      return (
        <button
          className={buttonClasses}
          disabled={disabled || loading}
          ref={ref}
          {...props}
        >
          <svg 
            className="animate-spin-custom -ml-1 mr-3 h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </button>
      );
    }

    return (
      <button
        className={buttonClasses}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin-custom -ml-1 mr-3 h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };