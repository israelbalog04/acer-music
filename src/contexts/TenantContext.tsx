'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TenantContextType } from '@/middleware';
import { OrganizationType, SubscriptionPlan, UserRole } from '@prisma/client';
import { 
  OrganizationSettings, 
  BrandingConfig, 
  CustomTerminology, 
  FeatureFlags 
} from '@/types/saas';

// =============================================================================
// TENANT CONTEXT
// =============================================================================

interface ExtendedTenantContext extends TenantContextType {
  // Actions
  switchOrganization: (slug: string) => Promise<void>;
  updateBranding: (branding: Partial<BrandingConfig>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasFeature: (feature: keyof FeatureFlags) => boolean;
  
  // Organization details
  subscriptionPlan: SubscriptionPlan;
  settings: OrganizationSettings;
  usageStats: {
    membersUsed: number;
    membersLimit: number;
    storageUsed: number;
    storageLimit: number;
  };
}

const TenantContext = createContext<ExtendedTenantContext | null>(null);

// =============================================================================
// TENANT PROVIDER
// =============================================================================

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  // Demo mode - simulate authenticated session
  const session = { user: { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' } };
  const status = 'authenticated';
  const [organization, setOrganization] = useState<ExtendedTenantContext['organization']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('FREE');
  const [settings, setSettings] = useState<OrganizationSettings>({} as OrganizationSettings);
  const [usageStats, setUsageStats] = useState({
    membersUsed: 0,
    membersLimit: 5,
    storageUsed: 0,
    storageLimit: 1024
  });

  // Load organization data
  useEffect(() => {
    async function loadOrganizationData() {
      if (status === 'loading') return;
      
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get organization from headers set by middleware
        const orgId = getOrganizationIdFromHeaders();
        
        if (!orgId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/organizations/${orgId}`);
        if (response.ok) {
          const data = await response.json();
          
          setOrganization({
            id: data.id,
            name: data.name,
            slug: data.slug,
            type: data.type,
            branding: data.branding || getDefaultBranding(data.type),
            features: data.features || getDefaultFeatures(data.subscriptionPlan),
            terminology: data.terminology || getDefaultTerminology(data.type)
          });
          
          setSubscriptionPlan(data.subscriptionPlan);
          setSettings(data.settings);
          setUsageStats({
            membersUsed: data.stats.membersUsed,
            membersLimit: data.maxMembers,
            storageUsed: data.stats.storageUsed,
            storageLimit: data.storageLimit
          });
        }
      } catch (error) {
        console.error('Error loading organization data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrganizationData();
  }, [session, status]);

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const switchOrganization = async (slug: string) => {
    try {
      const response = await fetch(`/api/organizations/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });

      if (response.ok) {
        // Redirect to new organization
        window.location.href = `/${slug}`;
      }
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };

  const updateBranding = async (branding: Partial<BrandingConfig>) => {
    if (!organization) return;

    try {
      const response = await fetch(`/api/organizations/${organization.id}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding)
      });

      if (response.ok) {
        setOrganization(prev => prev ? {
          ...prev,
          branding: { ...prev.branding, ...branding }
        } : null);
      }
    } catch (error) {
      console.error('Error updating branding:', error);
    }
  };

  // =============================================================================
  // PERMISSION & FEATURE CHECKS
  // =============================================================================

  const hasPermission = (permission: string): boolean => {
    if (!session?.user?.role) return false;
    
    const rolePermissions = getRolePermissions(session.user.role as UserRole, organization?.type as OrganizationType);
    return rolePermissions.includes(permission) || rolePermissions.includes('*');
  };

  const hasFeature = (feature: keyof FeatureFlags): boolean => {
    return organization?.features[feature] || false;
  };

  // =============================================================================
  // CONTEXT VALUE
  // =============================================================================

  const contextValue: ExtendedTenantContext = {
    organization,
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name!,
      role: session.user.role || 'MEMBER',
      permissions: session?.user?.role ? getRolePermissions(session.user.role as UserRole, organization?.type as OrganizationType) : []
    } : null,
    isLoading,
    subscriptionPlan,
    settings,
    usageStats,
    
    // Actions
    switchOrganization,
    updateBranding,
    hasPermission,
    hasFeature
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useOrganization() {
  const { organization, isLoading } = useTenant();
  return { organization, isLoading };
}

export function usePermissions() {
  const { hasPermission, user } = useTenant();
  return { hasPermission, userRole: user?.role as UserRole };
}

export function useFeatures() {
  const { hasFeature, organization, subscriptionPlan } = useTenant();
  return { hasFeature, features: organization?.features, subscriptionPlan };
}

export function useBranding() {
  const { organization, updateBranding } = useTenant();
  return { 
    branding: organization?.branding, 
    updateBranding,
    terminology: organization?.terminology 
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getOrganizationIdFromHeaders(): string | null {
  // In a real implementation, this would read from request headers
  // For now, we'll use a different approach
  if (typeof window !== 'undefined') {
    // Try to get from current URL or other client-side method
    const pathMatch = window.location.pathname.match(/^\/org\/([^\/]+)/);
    if (pathMatch) {
      return pathMatch[1]; // This would need to be converted to actual ID
    }
  }
  return null;
}

function getDefaultBranding(orgType: OrganizationType): BrandingConfig {
  // Return default branding based on organization type
  const defaults: Record<OrganizationType, Partial<BrandingConfig>> = {
    CHURCH: {
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
    CONSERVATORY: {
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
    // Add other defaults...
  } as any;
  
  return {
    colors: defaults[orgType]?.colors || defaults.CHURCH.colors,
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: 'medium'
    },
    layout: {
      sidebarPosition: 'left',
      cardStyle: 'rounded',
      density: 'comfortable'
    }
  } as BrandingConfig;
}

function getDefaultFeatures(plan: SubscriptionPlan): FeatureFlags {
  const planFeatures = {
    FREE: {
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
    // Add other plan features...
  } as any;
  
  return planFeatures[plan] || planFeatures.FREE;
}

function getDefaultTerminology(orgType: OrganizationType): CustomTerminology {
  const terminologies: Record<OrganizationType, CustomTerminology> = {
    CHURCH: {
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
    // Add other terminologies...
  } as any;
  
  return terminologies[orgType] || terminologies.CHURCH;
}

function getRolePermissions(role: UserRole, orgType?: OrganizationType): string[] {
  const permissions: Record<UserRole, string[]> = {
    SUPER_ADMIN: ['*'],
    ORG_ADMIN: ['manage_organization', 'manage_users', 'manage_events', 'manage_content'],
    DIRECTOR: ['manage_events', 'manage_content', 'view_analytics'],
    MEMBER: ['view_content', 'upload_recordings'],
    GUEST: ['view_public_content']
  };
  
  return permissions[role] || [];
}