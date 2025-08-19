// =============================================================================
// SAAS MULTI-TENANT TYPES
// =============================================================================

import { 
  OrganizationType, 
  OrganizationLevel,
  MusicIndustry, 
  OrganizationSize, 
  SubscriptionPlan, 
  SubscriptionStatus,
  UserRole,
  SkillLevel,
  VoiceType,
  EventType,
  EventStatus,
  DifficultyLevel,
  SharedContentType
} from '@prisma/client';

// =============================================================================
// ORGANIZATION TYPES
// =============================================================================

// Hiérarchie organisationnelle
export interface OrganizationHierarchy {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  level: OrganizationLevel;
  parentId?: string;
  children: OrganizationHierarchy[];
  
  // Métadonnées
  city?: string;
  region?: string;
  memberCount: number;
  isActive: boolean;
  
  // Permissions inter-sites
  allowCrossSiteAccess: boolean;
  shareBrandingWithChildren: boolean;
  allowChildCustomBranding: boolean;
}

// Gestion multi-sites
export interface MultiSiteManagement {
  parentOrganization: OrganizationHierarchy;
  totalSites: number;
  totalMembers: number;
  totalStorageUsed: number;
  
  // Quotas centralisés
  globalMemberLimit: number;
  globalStorageLimit: number;
  
  // Facturation centralisée
  subscriptionPlan: SubscriptionPlan;
  totalMonthlyCost: number;
  costPerSite: number;
  
  // Statistiques
  activeSites: number;
  lastActivityDate: Date;
}

// Contenu partagé entre sites
export interface SharedContent {
  id: string;
  contentType: SharedContentType;
  resourceId: string;
  title: string;
  description?: string;
  
  // Sites impliqués
  sharedBy: {
    id: string;
    name: string;
    slug: string;
  };
  sharedWith: {
    id: string;
    name: string;
    slug: string;
  };
  
  // Permissions
  canEdit: boolean;
  canDelete: boolean;
  canReshare: boolean;
  
  // État
  isActive: boolean;
  acceptedAt?: Date;
  createdAt: Date;
}

// Accès cross-site pour utilisateurs
export interface CrossSiteAccess {
  id: string;
  userId: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    city?: string;
  };
  role: UserRole;
  permissions?: string[];
  isActive: boolean;
  approvedAt?: Date;
}

export interface OrganizationSettings {
  // Paramètres généraux
  allowPublicRegistration: boolean;
  requireApprovalForMembers: boolean;
  defaultUserRole: UserRole;
  
  // Fonctionnalités activées
  enableRecordings: boolean;
  enableSequences: boolean;
  enableMultimedia: boolean;
  enableAnalytics: boolean;
  enableMessaging: boolean;
  
  // Paramètres de contenu
  allowPublicSongs: boolean;
  allowMemberUploads: boolean;
  autoApproveUploads: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  
  // Paramètres de sécurité
  passwordRequirements: PasswordRequirements;
  sessionTimeout: number; // minutes
  twoFactorRequired: boolean;
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface BrandingConfig {
  // Identité visuelle
  logo?: string;
  logoLight?: string; // Version pour fond sombre
  favicon?: string;
  
  // Couleurs
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Typographie
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  
  // Layout
  layout: {
    sidebarPosition: 'left' | 'right' | 'top';
    cardStyle: 'rounded' | 'sharp' | 'soft' | 'elevated';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  
  // CSS personnalisé
  customCSS?: string;
}

export interface CustomTerminology {
  // Termes généraux
  organization: string;          // "Église", "Conservatoire", "Groupe"
  members: string;              // "Musiciens", "Étudiants", "Membres"
  events: string;               // "Services", "Concerts", "Répétitions"
  director: string;             // "Chef de Louange", "Professeur", "Leader"
  
  // Termes spécifiques
  repertoire: string;           // "Répertoire", "Songbook", "Partitions"
  recordings: string;           // "Enregistrements", "Démos", "Audios"
  sequences: string;            // "Partitions", "Tablatures", "Arrangements"
  multimedia: string;           // "Photos", "Médias", "Galerie"
  
  // Actions
  join: string;                 // "Rejoindre", "S'inscrire", "Participer"
  practice: string;             // "Répéter", "Étudier", "Travailler"
  perform: string;              // "Jouer", "Interpréter", "Présenter"
}

export interface FeatureFlags {
  // Modules core (toujours activés)
  repertoire: boolean;
  scheduling: boolean;
  members: boolean;
  
  // Modules optionnels
  recordings: boolean;
  sequences: boolean;
  multimedia: boolean;
  analytics: boolean;
  messaging: boolean;
  
  // Modules spécialisés
  worship: boolean;             // Spécifique églises
  education: boolean;           // Conservatoires/écoles
  commercial: boolean;          // Groupes professionnels
  events: boolean;              // Concerts/spectacles
  streaming: boolean;           // Diffusion live
  booking: boolean;             // Réservations/booking
  merchandise: boolean;         // Vente de produits
  donations: boolean;           // Dons (églises)
}

// =============================================================================
// SUBSCRIPTION & BILLING
// =============================================================================

export interface SubscriptionFeatures {
  maxMembers: number;
  storageLimit: number;         // en MB
  features: FeatureFlags;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  analyticsRetention: number;   // jours
  backupRetention: number;      // jours
}

export interface BillingInfo {
  customerId?: string;          // Stripe customer ID
  subscriptionId?: string;      // Stripe subscription ID
  paymentMethodId?: string;     // Stripe payment method ID
  
  // Facturation
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: Date;
  
  // Historique
  totalPaid: number;
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
}

// =============================================================================
// TEMPLATES D'ORGANISATION
// =============================================================================

export interface OrganizationTemplate {
  type: OrganizationType;
  name: string;
  description: string;
  icon: string;
  
  // Configuration par défaut
  terminology: CustomTerminology;
  features: FeatureFlags;
  branding: Partial<BrandingConfig>;
  settings: Partial<OrganizationSettings>;
  
  // Contenu de démarrage
  sampleSongs?: SampleSong[];
  sampleEvents?: SampleEvent[];
  rolePermissions: Record<UserRole, string[]>;
}

export interface SampleSong {
  title: string;
  artist?: string;
  genre?: string;
  difficulty: DifficultyLevel;
  tags: string[];
}

export interface SampleEvent {
  title: string;
  type: EventType;
  description: string;
  isRecurring: boolean;
}

// =============================================================================
// USER PREFERENCES
// =============================================================================

export interface UserPreferences {
  // Interface
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  
  // Notifications
  emailNotifications: {
    newEvents: boolean;
    eventReminders: boolean;
    eventUpdates: boolean;
    newSongs: boolean;
    invitations: boolean;
    announcements: boolean;
  };
  
  pushNotifications: {
    enabled: boolean;
    eventReminders: boolean;
    messages: boolean;
    mentions: boolean;
  };
  
  // Calendrier
  calendarView: 'month' | 'week' | 'agenda';
  startWeekOn: 'monday' | 'sunday';
  
  // Musique
  defaultInstrument?: string;
  autoplay: boolean;
  showChords: boolean;
  showLyrics: boolean;
}

// =============================================================================
// ONBOARDING
// =============================================================================

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isOptional: boolean;
  order: number;
}

export interface OnboardingData {
  // Étape 0: Choix du type de création
  organizationLevel: OrganizationLevel; // PARENT, CHILD, INDEPENDENT
  parentOrganizationId?: string; // Si CHILD, ID de l'organisation mère
  
  // Étape 1: Type d'organisation
  organizationType: OrganizationType;
  musicIndustry: MusicIndustry;
  
  // Étape 2: Informations de base
  organizationName: string;
  slug: string;
  description?: string;
  size: OrganizationSize;
  country: string;
  region?: string; // Région/Département
  city?: string;
  timezone: string;
  
  // Étape 3: Branding
  branding: Partial<BrandingConfig>;
  terminology: Partial<CustomTerminology>;
  
  // Étape 4: Configuration
  features: Partial<FeatureFlags>;
  settings: Partial<OrganizationSettings>;
  
  // Étape 5: Plan d'abonnement
  subscriptionPlan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  
  // Étape 6: Premier utilisateur admin
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  
  // Étape 7: Invitations initiales
  invitations: {
    email: string;
    role: UserRole;
    message?: string;
  }[];
}

// =============================================================================
// ANALYTICS & METRICS
// =============================================================================

export interface OrganizationMetrics {
  // Membres
  totalMembers: number;
  activeMembers: number;         // Connectés dans les 30 derniers jours
  newMembersThisMonth: number;
  
  // Contenu
  totalSongs: number;
  totalEvents: number;
  totalRecordings: number;
  totalSequences: number;
  
  // Activité
  eventsThisMonth: number;
  recordingsThisMonth: number;
  uploadsThisMonth: number;
  
  // Stockage
  storageUsed: number;           // en MB
  storageLimit: number;          // en MB
  storagePercentage: number;
  
  // Engagement
  averageSessionDuration: number; // minutes
  loginFrequency: number;        // logins/mois par utilisateur
  featureUsage: Record<string, number>;
}

export interface PlatformMetrics {
  // Organisations
  totalOrganizations: number;
  activeOrganizations: number;
  newOrganizationsThisMonth: number;
  organizationsByType: Record<OrganizationType, number>;
  
  // Utilisateurs
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  
  // Revenus
  mrr: number;                   // Monthly Recurring Revenue
  arr: number;                   // Annual Recurring Revenue
  churnRate: number;
  revenueByPlan: Record<SubscriptionPlan, number>;
  
  // Performance
  averageLoadTime: number;
  uptime: number;
  supportTickets: number;
  customerSatisfaction: number;
}

// =============================================================================
// API RESPONSES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// MIDDLEWARE & CONTEXT
// =============================================================================

export interface TenantContext {
  organizationId: string;
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
    slug: string;
    subdomain: string;
    customDomain?: string;
    features: FeatureFlags;
    settings: OrganizationSettings;
    branding: BrandingConfig;
    terminology: CustomTerminology;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: string[];
  };
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  type: OrganizationType;
  industry: MusicIndustry;
  size: OrganizationSize;
  country: string;
  timezone: string;
  subscriptionPlan: SubscriptionPlan;
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const ORGANIZATION_TEMPLATES: Record<OrganizationType, OrganizationTemplate> = {
  CHURCH: {
    type: 'CHURCH',
    name: 'Église / Louange',
    description: 'Parfait pour les équipes de louange et chœurs d\'église',
    icon: '⛪',
    terminology: {
      organization: 'Église',
      members: 'Musiciens',
      events: 'Services',
      director: 'Chef de Louange',
      repertoire: 'Répertoire',
      recordings: 'Enregistrements',
      sequences: 'Partitions',
      multimedia: 'Photos',
      join: 'Rejoindre l\'équipe',
      practice: 'Répéter',
      perform: 'Servir'
    },
    features: {
      repertoire: true,
      scheduling: true,
      members: true,
      recordings: true,
      sequences: true,
      multimedia: true,
      analytics: false,
      messaging: true,
      worship: true,
      education: false,
      commercial: false,
      events: true,
      streaming: true,
      booking: false,
      merchandise: false,
      donations: true
    },
    branding: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    },
    settings: {
      allowPublicRegistration: false,
      requireApprovalForMembers: true,
      defaultUserRole: 'MEMBER',
      enableRecordings: true,
      enableSequences: true,
      enableMultimedia: true,
      enableAnalytics: false,
      enableMessaging: true,
      allowPublicSongs: false,
      allowMemberUploads: true,
      autoApproveUploads: false,
      emailNotifications: true,
      pushNotifications: true,
      digestFrequency: 'weekly',
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      },
      sessionTimeout: 120,
      twoFactorRequired: false
    },
    rolePermissions: {
      SUPER_ADMIN: ['*'],
      ORG_ADMIN: ['manage_organization', 'manage_users', 'manage_events', 'manage_content'],
      DIRECTOR: ['manage_events', 'manage_content', 'view_analytics'],
      MEMBER: ['view_content', 'upload_recordings'],
      GUEST: ['view_public_content']
    }
  },
  
  CONSERVATORY: {
    type: 'CONSERVATORY',
    name: 'Conservatoire / École',
    description: 'Idéal pour les conservatoires et écoles de musique',
    icon: '🎓',
    terminology: {
      organization: 'Conservatoire',
      members: 'Étudiants',
      events: 'Cours',
      director: 'Professeur',
      repertoire: 'Partitions',
      recordings: 'Enregistrements',
      sequences: 'Exercices',
      multimedia: 'Ressources',
      join: 'S\'inscrire',
      practice: 'Étudier',
      perform: 'Jouer'
    },
    features: {
      repertoire: true,
      scheduling: true,
      members: true,
      recordings: true,
      sequences: true,
      multimedia: true,
      analytics: true,
      messaging: true,
      worship: false,
      education: true,
      commercial: false,
      events: true,
      streaming: false,
      booking: true,
      merchandise: false,
      donations: false
    },
    branding: {
      colors: {
        primary: '#059669',
        secondary: '#0891b2',
        accent: '#7c3aed',
        background: '#ffffff',
        surface: '#f0fdf4',
        text: '#1e293b',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    },
    settings: {
      allowPublicRegistration: true,
      requireApprovalForMembers: true,
      defaultUserRole: 'MEMBER',
      enableRecordings: true,
      enableSequences: true,
      enableMultimedia: true,
      enableAnalytics: true,
      enableMessaging: true,
      allowPublicSongs: true,
      allowMemberUploads: true,
      autoApproveUploads: false,
      emailNotifications: true,
      pushNotifications: true,
      digestFrequency: 'weekly',
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      },
      sessionTimeout: 240,
      twoFactorRequired: false
    },
    rolePermissions: {
      SUPER_ADMIN: ['*'],
      ORG_ADMIN: ['manage_organization', 'manage_users', 'manage_events', 'manage_content'],
      DIRECTOR: ['manage_events', 'manage_content', 'view_analytics', 'grade_students'],
      MEMBER: ['view_content', 'upload_recordings', 'submit_assignments'],
      GUEST: ['view_public_content']
    }
  },
  
  PROFESSIONAL_BAND: {
    type: 'PROFESSIONAL_BAND',
    name: 'Groupe Professionnel',
    description: 'Pour les groupes et bands professionnels',
    icon: '🎸',
    terminology: {
      organization: 'Groupe',
      members: 'Musiciens',
      events: 'Concerts',
      director: 'Leader',
      repertoire: 'Setlist',
      recordings: 'Démos',
      sequences: 'Arrangements',
      multimedia: 'Promo',
      join: 'Rejoindre',
      practice: 'Répéter',
      perform: 'Jouer'
    },
    features: {
      repertoire: true,
      scheduling: true,
      members: true,
      recordings: true,
      sequences: true,
      multimedia: true,
      analytics: true,
      messaging: true,
      worship: false,
      education: false,
      commercial: true,
      events: true,
      streaming: true,
      booking: true,
      merchandise: true,
      donations: false
    },
    branding: {
      colors: {
        primary: '#dc2626',
        secondary: '#ea580c',
        accent: '#ca8a04',
        background: '#ffffff',
        surface: '#fefefe',
        text: '#1e293b',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    },
    settings: {
      allowPublicRegistration: false,
      requireApprovalForMembers: true,
      defaultUserRole: 'MEMBER',
      enableRecordings: true,
      enableSequences: true,
      enableMultimedia: true,
      enableAnalytics: true,
      enableMessaging: true,
      allowPublicSongs: false,
      allowMemberUploads: true,
      autoApproveUploads: true,
      emailNotifications: true,
      pushNotifications: true,
      digestFrequency: 'daily',
      passwordRequirements: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      sessionTimeout: 480,
      twoFactorRequired: true
    },
    rolePermissions: {
      SUPER_ADMIN: ['*'],
      ORG_ADMIN: ['manage_organization', 'manage_users', 'manage_events', 'manage_content', 'manage_finances'],
      DIRECTOR: ['manage_events', 'manage_content', 'view_analytics', 'manage_setlist'],
      MEMBER: ['view_content', 'upload_recordings', 'view_schedule'],
      GUEST: ['view_public_content']
    }
  },
  
  // Ajout d'autres templates...
  AMATEUR_BAND: {} as OrganizationTemplate,
  ORCHESTRA: {} as OrganizationTemplate,
  CHOIR: {} as OrganizationTemplate,
  MUSIC_SCHOOL: {} as OrganizationTemplate,
  STUDIO: {} as OrganizationTemplate,
  ASSOCIATION: {} as OrganizationTemplate,
  OTHER: {} as OrganizationTemplate
};

export const SUBSCRIPTION_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  FREE: {
    maxMembers: 5,
    storageLimit: 1024, // 1GB
    features: {
      repertoire: true,
      scheduling: true,
      members: true,
      recordings: false,
      sequences: false,
      multimedia: false,
      analytics: false,
      messaging: false,
      worship: false,
      education: false,
      commercial: false,
      events: true,
      streaming: false,
      booking: false,
      merchandise: false,
      donations: false
    },
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    analyticsRetention: 30,
    backupRetention: 7
  },
  
  STARTER: {
    maxMembers: 25,
    storageLimit: 10240, // 10GB
    features: {
      repertoire: true,
      scheduling: true,
      members: true,
      recordings: true,
      sequences: true,
      multimedia: true,
      analytics: false,
      messaging: true,
      worship: true,
      education: true,
      commercial: false,
      events: true,
      streaming: false,
      booking: false,
      merchandise: false,
      donations: true
    },
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    analyticsRetention: 90,
    backupRetention: 30
  },
  
  PROFESSIONAL: {
    maxMembers: 100,
    storageLimit: 51200, // 50GB
    features: {
      repertoire: true,
      scheduling: true,
      members: true,
      recordings: true,
      sequences: true,
      multimedia: true,
      analytics: true,
      messaging: true,
      worship: true,
      education: true,
      commercial: true,
      events: true,
      streaming: true,
      booking: true,
      merchandise: false,
      donations: true
    },
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    analyticsRetention: 365,
    backupRetention: 90
  },
  
  ENTERPRISE: {
    maxMembers: -1, // Illimité
    storageLimit: -1, // Illimité
    features: {
      repertoire: true,
      scheduling: true,
      members: true,
      recordings: true,
      sequences: true,
      multimedia: true,
      analytics: true,
      messaging: true,
      worship: true,
      education: true,
      commercial: true,
      events: true,
      streaming: true,
      booking: true,
      merchandise: true,
      donations: true
    },
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    analyticsRetention: -1, // Illimité
    backupRetention: 365
  }
};