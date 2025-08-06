'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="animate-fadeInUp">
      {children}
    </div>
  );
}

// Animation variants as CSS classes (to be added to globals.css)
export const animationClasses = {
  fadeInUp: 'animate-fadeInUp',
  slideInLeft: 'animate-slideInLeft',
  scaleIn: 'animate-scaleIn',
  bounceIn: 'animate-bounceIn',
  pulse: 'animate-pulse-custom',
  spin: 'animate-spin-custom',
  hover: 'hover:scale-105 hover:-translate-y-1 transition-transform duration-200',
  tap: 'active:scale-95 transition-transform duration-100'
};