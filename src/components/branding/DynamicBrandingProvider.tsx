'use client';

import React, { useEffect, ReactNode } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { BrandingConfig } from '@/types/saas';

interface DynamicBrandingProviderProps {
  children: ReactNode;
}

export function DynamicBrandingProvider({ children }: DynamicBrandingProviderProps) {
  const { organization, isLoading } = useTenant();

  useEffect(() => {
    if (isLoading || !organization?.branding) return;

    applyBrandingToDOM(organization.branding);
  }, [organization?.branding, isLoading]);

  return <>{children}</>;
}

// =============================================================================
// BRANDING APPLICATION
// =============================================================================

function applyBrandingToDOM(branding: BrandingConfig) {
  const root = document.documentElement;

  // Apply color scheme
  Object.entries(branding.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
    
    // Generate color variations for Tailwind classes
    if (key === 'primary') {
      generateColorVariations(root, 'primary', value);
    }
    if (key === 'secondary') {
      generateColorVariations(root, 'secondary', value);
    }
  });

  // Apply typography
  if (branding.typography) {
    root.style.setProperty('--font-heading', branding.typography.headingFont);
    root.style.setProperty('--font-body', branding.typography.bodyFont);
    
    // Apply font size scale
    const fontSizes = getFontSizeScale(branding.typography.fontSize);
    Object.entries(fontSizes).forEach(([size, value]) => {
      root.style.setProperty(`--text-${size}`, value);
    });
  }

  // Apply layout preferences
  if (branding.layout) {
    document.body.className = updateBodyClasses(
      document.body.className,
      branding.layout
    );
  }

  // Apply custom CSS if provided
  if (branding.customCSS) {
    applyCustomCSS(branding.customCSS);
  }
}

function generateColorVariations(root: HTMLElement, colorName: string, baseColor: string) {
  const variations = generateColorShades(baseColor);
  
  Object.entries(variations).forEach(([shade, color]) => {
    root.style.setProperty(`--color-${colorName}-${shade}`, color);
  });
}

function generateColorShades(baseColor: string): Record<string, string> {
  // Convert hex to HSL for better color manipulation
  const hsl = hexToHsl(baseColor);
  
  return {
    '50': hslToHex(hsl.h, Math.max(0, hsl.s - 50), Math.min(100, hsl.l + 45)),
    '100': hslToHex(hsl.h, Math.max(0, hsl.s - 40), Math.min(100, hsl.l + 35)),
    '200': hslToHex(hsl.h, Math.max(0, hsl.s - 30), Math.min(100, hsl.l + 25)),
    '300': hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.min(100, hsl.l + 15)),
    '400': hslToHex(hsl.h, Math.max(0, hsl.s - 10), Math.min(100, hsl.l + 5)),
    '500': baseColor,
    '600': hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 10)),
    '700': hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)),
    '800': hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 30)),
    '900': hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 40)),
  };
}

function getFontSizeScale(size: 'small' | 'medium' | 'large'): Record<string, string> {
  const scales = {
    small: {
      'xs': '0.75rem',
      'sm': '0.875rem', 
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    medium: {
      'xs': '0.8rem',
      'sm': '0.9rem',
      'base': '1.1rem',
      'lg': '1.25rem',
      'xl': '1.4rem',
      '2xl': '1.65rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
    },
    large: {
      'xs': '0.85rem',
      'sm': '0.95rem',
      'base': '1.2rem',
      'lg': '1.35rem',
      'xl': '1.5rem',
      '2xl': '1.8rem',
      '3xl': '2.25rem',
      '4xl': '2.75rem',
    }
  };
  
  return scales[size];
}

function updateBodyClasses(currentClasses: string, layout: BrandingConfig['layout']): string {
  const classes = currentClasses
    .split(' ')
    .filter(cls => 
      !cls.startsWith('sidebar-') && 
      !cls.startsWith('density-') && 
      !cls.startsWith('cards-')
    );
  
  if (layout.sidebarPosition) {
    classes.push(`sidebar-${layout.sidebarPosition}`);
  }
  
  if (layout.density) {
    classes.push(`density-${layout.density}`);
  }
  
  if (layout.cardStyle) {
    classes.push(`cards-${layout.cardStyle}`);
  }
  
  return classes.join(' ');
}

function applyCustomCSS(customCSS: string) {
  let styleElement = document.getElementById('dynamic-branding-styles');
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'dynamic-branding-styles';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = customCSS;
}

// =============================================================================
// COLOR UTILITIES
// =============================================================================

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// =============================================================================
// BRANDING HOOK FOR COMPONENTS
// =============================================================================

export function useDynamicBranding() {
  const { organization } = useTenant();
  
  const getBrandingVar = (variable: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${variable}`)
      .trim();
  };

  const applyBrandingToElement = (
    element: HTMLElement, 
    styles: Record<string, string>
  ) => {
    Object.entries(styles).forEach(([property, value]) => {
      // Replace branding variables in the value
      const processedValue = value.replace(
        /var\(--color-(\w+)\)/g, 
        (_, colorName) => getBrandingVar(colorName)
      );
      element.style.setProperty(property, processedValue);
    });
  };

  return {
    branding: organization?.branding,
    terminology: organization?.terminology,
    getBrandingVar,
    applyBrandingToElement,
    
    // Helper methods for common branding tasks
    getPrimaryColor: () => getBrandingVar('primary'),
    getSecondaryColor: () => getBrandingVar('secondary'),
    getAccentColor: () => getBrandingVar('accent'),
    getTextColor: () => getBrandingVar('text'),
    getSurfaceColor: () => getBrandingVar('surface'),
  };
}