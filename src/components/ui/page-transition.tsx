'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (displayChildren !== children) {
      setIsTransitioning(true);
      
      // Délai pour permettre l'animation de sortie
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [children, displayChildren]);

  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isTransitioning 
          ? 'opacity-0 transform translate-y-4' 
          : 'opacity-100 transform translate-y-0'
        }
      `}
    >
      {displayChildren}
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