import React, { useMemo } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { SUBSCRIPTION_FEATURES } from '@/types/saas';

export function useFeatureGate() {
  const { organization } = useTenant();
  
  const features = useMemo(() => {
    if (!organization) return null;
    
    // Récupère les features depuis l'organisation
    return organization.features || {};
  }, [organization]);

  const hasFeature = (feature: string): boolean => {
    if (!features) return false;
    return features[feature] === true;
  };

  const getRequiredPlan = (feature: string): string => {
    const featurePlans: Record<string, string> = {
      recordings: 'STARTER',
      sequences: 'STARTER', 
      multimedia: 'STARTER',
      analytics: 'PROFESSIONAL',
      messaging: 'STARTER',
      streaming: 'PROFESSIONAL',
      booking: 'PROFESSIONAL',
      merchandise: 'ENTERPRISE',
      api_access: 'ENTERPRISE',
      webhooks: 'ENTERPRISE'
    };
    
    return featurePlans[feature] || 'FREE';
  };

  const getUpgradeMessage = (feature: string): string => {
    const requiredPlan = getRequiredPlan(feature);
    return `Cette fonctionnalité nécessite le plan ${requiredPlan}. Mettez à niveau votre abonnement pour y accéder.`;
  };

  const checkLimit = (resource: string, current: number): { 
    allowed: boolean; 
    limit: number; 
    percentage: number 
  } => {
    const limits: Record<string, number> = {
      members: 25,
      storage: 5000, // MB
      events: 50
    };
    
    const limit = limits[resource] || 0;
    const percentage = limit > 0 ? (current / limit) * 100 : 0;
    
    return {
      allowed: current < limit,
      limit,
      percentage: Math.min(percentage, 100)
    };
  };

  return {
    hasFeature,
    getRequiredPlan,
    getUpgradeMessage,
    checkLimit,
    features,
    organization
  };
}

// Composant pour afficher conditionnellement du contenu
interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasFeature } = useFeatureGate();
  
  if (!hasFeature(feature)) {
    return fallback || null;
  }
  
  return children;
}

// Composant pour afficher un message d'upgrade
interface UpgradePromptProps {
  feature: string;
  children: React.ReactNode;
}

export function UpgradePrompt({ feature, children }: UpgradePromptProps) {
  const { hasFeature, getUpgradeMessage } = useFeatureGate();
  
  if (hasFeature(feature)) {
    return children;
  }
  
  const message = getUpgradeMessage(feature);
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            type="button"
            className="bg-yellow-50 rounded-md p-1.5 text-yellow-400 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600"
          >
            <span className="sr-only">Mettre à niveau</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}