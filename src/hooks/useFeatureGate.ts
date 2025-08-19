import React, { useContext, useMemo } from 'react';
import { TenantContext } from '@/contexts/TenantContext';
import { SUBSCRIPTION_FEATURES } from '@/types/saas';

export function useFeatureGate() {
  const { organization } = useContext(TenantContext);
  
  const features = useMemo(() => {
    if (!organization) return null;
    
    const planFeatures = SUBSCRIPTION_FEATURES[organization.subscriptionPlan];
    return {
      ...planFeatures,
      organization: organization
    };
  }, [organization]);

  const hasFeature = (feature: string): boolean => {
    if (!features) return false;
    return features.features?.[feature] === true;
  };

  const checkLimit = (limitType: 'maxMembers' | 'storageLimit', currentValue: number): boolean => {
    if (!features) return false;
    const limit = features[limitType];
    if (limit === -1) return true; // Illimité
    return currentValue < limit;
  };

  const getUsage = () => {
    if (!features || !organization) return null;
    
    return {
      members: {
        current: organization.memberCount || 0,
        limit: features.maxMembers,
        percentage: features.maxMembers === -1 ? 0 : (organization.memberCount || 0) / features.maxMembers * 100
      },
      storage: {
        current: organization.storageUsed || 0,
        limit: features.storageLimit,
        percentage: features.storageLimit === -1 ? 0 : (organization.storageUsed || 0) / features.storageLimit * 100
      }
    };
  };

  const getUpgradeMessage = (feature: string): string | null => {
    if (!features || hasFeature(feature)) return null;

    const requiredPlans = {
      recordings: 'STARTER',
      sequences: 'STARTER',
      analytics: 'PROFESSIONAL',
      streaming: 'PROFESSIONAL',
      merchandise: 'ENTERPRISE'
    };

    const requiredPlan = requiredPlans[feature as keyof typeof requiredPlans];
    if (!requiredPlan) return null;

    return `Cette fonctionnalité nécessite un plan ${requiredPlan} ou supérieur`;
  };

  return {
    features,
    hasFeature,
    checkLimit,
    getUsage,
    getUpgradeMessage,
    organization
  };
}

// Composant pour afficher conditionnellement du contenu
export function FeatureGate({ 
  feature, 
  children, 
  fallback 
}: { 
  feature: string; 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}): React.ReactNode {
  const { hasFeature } = useFeatureGate();
  
  if (!hasFeature(feature)) {
    return fallback || null;
  }
  
  return <>{children}</>;
}

// Composant pour afficher un message d'upgrade
export function UpgradePrompt({ 
  feature, 
  children 
}: { 
  feature: string; 
  children: React.ReactNode;
}): React.ReactNode {
  const { hasFeature, getUpgradeMessage } = useFeatureGate();
  
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  const message = getUpgradeMessage(feature);
  
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">
            Fonctionnalité Premium
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {message}
          </p>
        </div>
        <div className="flex-shrink-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Mettre à niveau
          </button>
        </div>
      </div>
    </div>
  );
}
