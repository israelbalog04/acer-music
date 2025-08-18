// Types pour la configuration de branding et thèmes

export interface BrandingConfig {
  organizationId: string
  theme: ThemeConfig
  assets: AssetConfig
  features: FeatureConfig
  layout: LayoutConfig
  lastUpdated: string
  version: string
}

export interface ThemeConfig {
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
}

export interface ColorPalette {
  // Couleurs principales
  primary: string
  secondary: string
  accent: string
  
  // Couleurs système
  background: string
  surface: string
  text: string
  textSecondary: string
  
  // Couleurs d'état
  success: string
  warning: string
  error: string
  info: string
  
  // Mode sombre (optionnel)
  dark?: {
    background: string
    surface: string
    text: string
    textSecondary: string
  }
}

export interface TypographyConfig {
  // Polices
  headingFont: string
  bodyFont: string
  monoFont?: string
  
  // Tailles
  fontSize: 'small' | 'medium' | 'large'
  
  // Échelles
  fontScale: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  
  // Propriétés
  letterSpacing: number
  lineHeight: number
}

export interface SpacingConfig {
  density: 'compact' | 'comfortable' | 'spacious'
  scale: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
}

export interface AssetConfig {
  // Logos
  logo?: string
  logoLight?: string // Version pour fond sombre
  logoDark?: string  // Version pour fond clair
  favicon?: string
  
  // Images
  backgroundImage?: string
  patternOverlay?: string
  
  // CSS personnalisé
  customCSS?: string
  
  // Métadonnées
  uploadedAssets: {
    [key: string]: {
      url: string
      uploadedAt: string
      size: number
      type: string
    }
  }
}

export interface LayoutConfig {
  // Structure
  sidebarPosition: 'left' | 'right' | 'top'
  sidebarWidth: 'narrow' | 'normal' | 'wide'
  sidebarCollapsible: boolean
  
  // Composants
  cardStyle: 'rounded' | 'sharp' | 'soft' | 'elevated'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  
  // Navigation
  navigationStyle: 'modern' | 'classic' | 'minimal'
  breadcrumbsEnabled: boolean
}

export interface FeatureConfig {
  // Modes
  darkModeEnabled: boolean
  darkModeDefault: boolean
  
  // Animations
  animationsEnabled: boolean
  reducedMotion: boolean
  
  // Fonctionnalités
  customDomainEnabled: boolean
  customCSSEnabled: boolean
  
  // Limites
  maxFileSize: number // en MB
  allowedFileTypes: string[]
}

// Types pour les presets et templates
export interface ThemePreset {
  id: string
  name: string
  description: string
  category: 'church' | 'band' | 'school' | 'studio' | 'generic'
  preview: string
  config: Partial<BrandingConfig>
  isPremium: boolean
  price?: number
}

export interface BrandingValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Types pour le dashboard
export interface BrandingDashboardState {
  currentConfig: BrandingConfig
  isPreviewMode: boolean
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  activeTab: BrandingTab
}

export type BrandingTab = 
  | 'colors' 
  | 'typography' 
  | 'assets' 
  | 'layout' 
  | 'features' 
  | 'advanced' 
  | 'presets'

// Couleurs prédéfinies pour le picker
export const COLOR_PRESETS = {
  gospel: ['#8B4513', '#FFD700', '#FFFFFF', '#2F4F4F'],
  modern: ['#3244c7', '#e11d48', '#059669', '#7c3aed'],
  rock: ['#1a1a1a', '#ff6b35', '#f7f7f7', '#fbbf24'],
  classical: ['#2c3e50', '#e8dcc0', '#ffffff', '#34495e'],
  pop: ['#ff69b4', '#00bcd4', '#ffeb3b', '#9c27b0']
} as const

// Configuration par défaut
export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  organizationId: '',
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  theme: {
    colors: {
      primary: '#3244c7',
      secondary: '#6366f1',
      accent: '#a855f7',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: 'medium',
      fontScale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      letterSpacing: 0,
      lineHeight: 1.6
    },
    spacing: {
      density: 'comfortable',
      scale: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem'
      }
    }
  },
  assets: {
    uploadedAssets: {}
  },
  layout: {
    sidebarPosition: 'left',
    sidebarWidth: 'normal',
    sidebarCollapsible: true,
    cardStyle: 'rounded',
    borderRadius: 'medium',
    navigationStyle: 'modern',
    breadcrumbsEnabled: true
  },
  features: {
    darkModeEnabled: true,
    darkModeDefault: false,
    animationsEnabled: true,
    reducedMotion: false,
    customDomainEnabled: false,
    customCSSEnabled: false,
    maxFileSize: 10, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
  }
}

// Utilitaires de validation
export function validateBrandingConfig(config: Partial<BrandingConfig>): BrandingValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Validation des couleurs
  if (config.theme?.colors) {
    const { colors } = config.theme
    const colorFields = ['primary', 'secondary', 'background', 'text'] as const
    
    colorFields.forEach(field => {
      const color = colors[field]
      if (color && !isValidHexColor(color)) {
        errors.push(`Couleur ${field} invalide: ${color}`)
      }
    })

    // Vérifier le contraste
    if (colors.text && colors.background) {
      const contrast = calculateContrast(colors.text, colors.background)
      if (contrast < 4.5) {
        warnings.push(`Contraste insuffisant entre le texte et l'arrière-plan (${contrast.toFixed(2)})`)
      }
    }
  }

  // Validation des assets
  if (config.assets?.customCSS) {
    if (config.assets.customCSS.length > 50000) {
      errors.push('CSS personnalisé trop long (max 50KB)')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Utilitaires
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

function calculateContrast(color1: string, color2: string): number {
  // Implémentation simplifiée du calcul de contraste WCAG
  // Dans une vraie implementation, utiliser une librairie comme 'color'
  return 7 // Placeholder
}

// Types pour les événements du dashboard
export interface BrandingEvent {
  type: 'color_change' | 'asset_upload' | 'layout_change' | 'config_save' | 'config_reset'
  timestamp: string
  data: any
  userId: string
}