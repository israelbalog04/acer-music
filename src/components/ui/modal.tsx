'use client';

import { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = 'md',
  showCloseButton = true
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full mx-4 transform transition-all duration-300 scale-100 ${sizeClasses[size]}`}
        style={{
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Composant pour les actions de modal
interface ModalActionsProps {
  children: ReactNode;
  className?: string;
}

export function ModalActions({ children, className = '' }: ModalActionsProps) {
  return (
    <div className={`flex space-x-3 pt-4 border-t border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les sections de modal
interface ModalSectionProps {
  children: ReactNode;
  className?: string;
}

export function ModalSection({ children, className = '' }: ModalSectionProps) {
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {children}
    </div>
  );
}
