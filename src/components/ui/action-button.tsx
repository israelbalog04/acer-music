'use client';

import { ReactNode } from 'react';
import { Button } from './button';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ActionButton({
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = ''
}: ActionButtonProps) {
  const baseClasses = 'font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:scale-100';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Traitement...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {icon && icon}
          <span>{children}</span>
        </div>
      )}
    </Button>
  );
}

// Composant pour les boutons d'action outline
interface OutlineActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function OutlineActionButton({
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = ''
}: OutlineActionButtonProps) {
  const baseClasses = 'font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:transform-none disabled:scale-100 border-2';
  
  const variantClasses = {
    primary: 'text-blue-600 border-blue-600 hover:bg-blue-50 hover:border-blue-700',
    secondary: 'text-gray-600 border-gray-600 hover:bg-gray-50 hover:border-gray-700',
    danger: 'text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700',
    success: 'text-green-600 border-green-600 hover:bg-green-50 hover:border-green-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant="outline"
      className={combinedClasses}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
          <span>Traitement...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {icon && icon}
          <span>{children}</span>
        </div>
      )}
    </Button>
  );
}
