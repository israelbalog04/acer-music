'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrandingConfig, DEFAULT_BRANDING_CONFIG, validateBrandingConfig } from '@/types/branding';

interface UseBrandingOptions {
  organizationId?: string;
  enablePreview?: boolean;
  autoSave?: boolean;
  saveDelay?: number;
}

interface UseBrandingReturn {
  config: BrandingConfig;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isPreviewMode: boolean;
  errors: string[];
  warnings: string[];
  
  // Actions
  updateConfig: (updates: Partial<BrandingConfig>) => void;
  updateColors: (colors: Partial<BrandingConfig['theme']['colors']>) => void;
  updateTypography: (typography: Partial<BrandingConfig['theme']['typography']>) => void;
  updateLayout: (layout: Partial<BrandingConfig['layout']>) => void;
  updateAssets: (assets: Partial<BrandingConfig['assets']>) => void;
  updateFeatures: (features: Partial<BrandingConfig['features']>) => void;
  uploadAsset: (assetType: string, file: File) => Promise<string>;
  removeAsset: (assetType: string) => Promise<boolean>;
  
  // Contrôles
  saveConfig: () => Promise<boolean>;
  resetConfig: () => void;
  setPreviewMode: (enabled: boolean) => void;
  applyTheme: (config?: BrandingConfig) => void;
  
  // Utilitaires
  exportConfig: () => string;
  importConfig: (configJson: string) => boolean;
}

export function useBranding(options: UseBrandingOptions = {}): UseBrandingReturn {
  const {
    organizationId,
    enablePreview = true,
    autoSave = false,
    saveDelay = 2000
  } = options;

  // États
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT_BRANDING_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<BrandingConfig>(DEFAULT_BRANDING_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Validation en temps réel
  const validation = useMemo(() => {
    return validateBrandingConfig(config);
  }, [config]);

  // État dérivé
  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(originalConfig);
  }, [config, originalConfig]);

  // Charger la configuration
  const loadConfig = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/branding/${organizationId}`);
      
      if (response.ok) {
        const data = await response.json();
        const loadedConfig = data.config || DEFAULT_BRANDING_CONFIG;
        setConfig(loadedConfig);
        setOriginalConfig(loadedConfig);
        
        // Appliquer le thème immédiatement
        if (!isPreviewMode) {
          applyTheme(loadedConfig);
        }
      } else {
        console.warn('Impossible de charger la configuration, utilisation des valeurs par défaut');
        setConfig(DEFAULT_BRANDING_CONFIG);
        setOriginalConfig(DEFAULT_BRANDING_CONFIG);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      setConfig(DEFAULT_BRANDING_CONFIG);
      setOriginalConfig(DEFAULT_BRANDING_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, isPreviewMode]);

  // Sauvegarder la configuration
  const saveConfig = useCallback(async (): Promise<boolean> => {
    if (!organizationId || !validation.valid) {
      return false;
    }

    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/branding/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            ...config,
            lastUpdated: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        const savedConfig = { ...config, lastUpdated: new Date().toISOString() };
        setOriginalConfig(savedConfig);
        setConfig(savedConfig);
        
        // Appliquer le thème si pas en mode preview
        if (!isPreviewMode) {
          applyTheme(savedConfig);
        }
        
        return true;
      } else {
        console.error('Erreur lors de la sauvegarde');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, config, validation.valid, isPreviewMode]);

  // Auto-save avec debounce
  useEffect(() => {
    if (!autoSave || !isDirty || !validation.valid) {
      return;
    }

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      saveConfig();
    }, saveDelay);

    setSaveTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [config, autoSave, saveDelay, isDirty, validation.valid, saveConfig]);

  // Appliquer le thème via CSS custom properties
  const applyTheme = useCallback((themeConfig?: BrandingConfig) => {
    const targetConfig = themeConfig || config;
    const root = document.documentElement;

    // Couleurs
    const { colors } = targetConfig.theme;
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

    // Typographie
    const { typography } = targetConfig.theme;
    root.style.setProperty('--font-heading', typography.headingFont);
    root.style.setProperty('--font-body', typography.bodyFont);
    root.style.setProperty('--font-size-base', typography.fontScale.base);
    root.style.setProperty('--letter-spacing', typography.letterSpacing.toString());
    root.style.setProperty('--line-height', typography.lineHeight.toString());

    // Espacement
    const { spacing } = targetConfig.theme;
    Object.entries(spacing.scale).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Layout
    const { layout } = targetConfig;
    root.style.setProperty('--sidebar-position', layout.sidebarPosition);
    root.style.setProperty('--border-radius', getBorderRadiusValue(layout.borderRadius));

    // Classes CSS conditionnelles
    document.body.className = [
      `theme-${layout.cardStyle}`,
      `density-${targetConfig.theme.spacing.density}`,
      `sidebar-${layout.sidebarPosition}`,
      targetConfig.features.darkModeEnabled && targetConfig.features.darkModeDefault ? 'dark' : 'light',
      targetConfig.features.animationsEnabled ? 'animations-enabled' : 'animations-disabled'
    ].join(' ');

    // CSS personnalisé
    if (targetConfig.assets.customCSS) {
      let customStyleElement = document.getElementById('custom-branding-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'custom-branding-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = targetConfig.assets.customCSS;
    }
  }, [config]);

  // Actions de mise à jour
  const updateConfig = useCallback((updates: Partial<BrandingConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Appliquer en temps réel si en mode preview
      if (enablePreview && isPreviewMode) {
        applyTheme(newConfig);
      }
      
      return newConfig;
    });
  }, [enablePreview, isPreviewMode, applyTheme]);

  const updateColors = useCallback((colors: Partial<BrandingConfig['theme']['colors']>) => {
    updateConfig({
      theme: {
        ...config.theme,
        colors: {
          ...config.theme.colors,
          ...colors
        }
      }
    });
  }, [config.theme, updateConfig]);

  const updateTypography = useCallback((typography: Partial<BrandingConfig['theme']['typography']>) => {
    updateConfig({
      theme: {
        ...config.theme,
        typography: {
          ...config.theme.typography,
          ...typography
        }
      }
    });
  }, [config.theme, updateConfig]);

  const updateLayout = useCallback((layout: Partial<BrandingConfig['layout']>) => {
    updateConfig({
      layout: {
        ...config.layout,
        ...layout
      }
    });
  }, [config.layout, updateConfig]);

  const updateAssets = useCallback((assets: Partial<BrandingConfig['assets']>) => {
    updateConfig({
      assets: {
        ...config.assets,
        ...assets
      }
    });
  }, [config.assets, updateConfig]);

  const updateFeatures = useCallback((features: Partial<BrandingConfig['features']>) => {
    updateConfig({
      features: {
        ...config.features,
        ...features
      }
    });
  }, [config.features, updateConfig]);

  // Contrôles
  const resetConfig = useCallback(() => {
    setConfig(originalConfig);
    applyTheme(originalConfig);
  }, [originalConfig, applyTheme]);

  const togglePreviewMode = useCallback((enabled: boolean) => {
    setIsPreviewMode(enabled);
    if (enabled) {
      applyTheme(config);
    } else {
      applyTheme(originalConfig);
    }
  }, [config, originalConfig, applyTheme]);

  // Utilitaires
  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  const importConfig = useCallback((configJson: string): boolean => {
    try {
      const importedConfig = JSON.parse(configJson);
      const validation = validateBrandingConfig(importedConfig);
      
      if (validation.valid) {
        setConfig(importedConfig);
        return true;
      } else {
        console.error('Configuration invalide:', validation.errors);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      return false;
    }
  }, []);

  // Upload d'asset
  const uploadAsset = useCallback(async (assetType: string, file: File): Promise<string> => {
    if (!organizationId) {
      throw new Error('ID d\'organisation manquant');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', assetType);

    const response = await fetch(`/api/branding/${organizationId}/assets`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'upload');
    }

    const data = await response.json();
    
    // Mettre à jour la configuration locale
    updateAssets({ [assetType]: data.url });
    
    return data.url;
  }, [organizationId, updateAssets]);

  // Suppression d'asset
  const removeAsset = useCallback(async (assetType: string): Promise<boolean> => {
    if (!organizationId) {
      throw new Error('ID d\'organisation manquant');
    }

    const response = await fetch(`/api/branding/${organizationId}/assets?type=${assetType}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression');
    }

    // Mettre à jour la configuration locale
    const newAssets = { ...config.assets };
    delete newAssets[assetType as keyof typeof newAssets];
    updateAssets(newAssets);
    
    return true;
  }, [organizationId, config.assets, updateAssets]);

  // Charger la configuration au montage
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return {
    config,
    isLoading,
    isSaving,
    isDirty,
    isPreviewMode,
    errors: validation.errors,
    warnings: validation.warnings,
    
    // Actions
    updateConfig,
    updateColors,
    updateTypography,
    updateLayout,
    updateAssets,
    updateFeatures,
    uploadAsset,
    removeAsset,
    
    // Contrôles
    saveConfig,
    resetConfig,
    setPreviewMode: togglePreviewMode,
    applyTheme,
    
    // Utilitaires
    exportConfig,
    importConfig
  };
}

// Utilitaires
function getBorderRadiusValue(borderRadius: string): string {
  const values = {
    none: '0',
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem'
  };
  return values[borderRadius as keyof typeof values] || values.medium;
}