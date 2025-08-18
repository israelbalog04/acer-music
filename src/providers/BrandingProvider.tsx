'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { BrandingConfig, DEFAULT_BRANDING_CONFIG } from '@/types/branding';

interface BrandingContextType {
  config: BrandingConfig;
  isLoading: boolean;
  applyTheme: (config: BrandingConfig) => void;
}

const BrandingContext = createContext<BrandingContextType>({
  config: DEFAULT_BRANDING_CONFIG,
  isLoading: true,
  applyTheme: () => {}
});

export function useBrandingContext() {
  return useContext(BrandingContext);
}

interface BrandingProviderProps {
  children: React.ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT_BRANDING_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const { churchId } = useUserData();

  // Fonction pour appliquer le thème
  const applyTheme = (themeConfig: BrandingConfig) => {
    const root = document.documentElement;

    // Couleurs
    const { colors } = themeConfig.theme;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);

    // Appliquer aussi aux classes CSS Tailwind via des variables
    root.style.setProperty('--tw-color-primary-50', lightenColor(colors.primary, 0.95));
    root.style.setProperty('--tw-color-primary-100', lightenColor(colors.primary, 0.9));
    root.style.setProperty('--tw-color-primary-200', lightenColor(colors.primary, 0.8));
    root.style.setProperty('--tw-color-primary-300', lightenColor(colors.primary, 0.7));
    root.style.setProperty('--tw-color-primary-400', lightenColor(colors.primary, 0.6));
    root.style.setProperty('--tw-color-primary-500', colors.primary);
    root.style.setProperty('--tw-color-primary-600', darkenColor(colors.primary, 0.1));
    root.style.setProperty('--tw-color-primary-700', darkenColor(colors.primary, 0.2));
    root.style.setProperty('--tw-color-primary-800', darkenColor(colors.primary, 0.3));
    root.style.setProperty('--tw-color-primary-900', darkenColor(colors.primary, 0.4));

    // Typographie
    const { typography } = themeConfig.theme;
    root.style.setProperty('--font-heading', typography.headingFont);
    root.style.setProperty('--font-body', typography.bodyFont);

    // Classes body pour le layout
    const { layout } = themeConfig;
    document.body.className = [
      document.body.className.split(' ').filter(c => !c.startsWith('theme-') && !c.startsWith('density-') && !c.startsWith('sidebar-')).join(' '),
      `theme-${layout.cardStyle}`,
      `density-${themeConfig.theme.spacing.density}`,
      `sidebar-${layout.sidebarPosition}`,
      themeConfig.features.darkModeEnabled && themeConfig.features.darkModeDefault ? 'dark' : 'light',
      themeConfig.features.animationsEnabled ? 'animations-enabled' : 'animations-disabled'
    ].filter(Boolean).join(' ');

    console.log('🎨 Thème appliqué:', {
      primary: colors.primary,
      secondary: colors.secondary,
      churchId
    });
  };

  // Charger la configuration de branding au montage
  useEffect(() => {
    const loadBrandingConfig = async () => {
      if (!churchId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/branding/${churchId}`);
        
        if (response.ok) {
          const data = await response.json();
          const loadedConfig = data.config || DEFAULT_BRANDING_CONFIG;
          setConfig(loadedConfig);
          applyTheme(loadedConfig);
        } else {
          console.warn('Configuration de branding non trouvée, utilisation des valeurs par défaut');
          applyTheme(DEFAULT_BRANDING_CONFIG);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration de branding:', error);
        applyTheme(DEFAULT_BRANDING_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrandingConfig();
  }, [churchId]);

  return (
    <BrandingContext.Provider value={{ config, isLoading, applyTheme }}>
      {children}
    </BrandingContext.Provider>
  );
}

// Utilitaires pour les couleurs
function lightenColor(color: string, amount: number): string {
  // Simple approximation - en production, utilisez une lib comme chroma.js
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function darkenColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}