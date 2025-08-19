'use client';

import React, { useState } from 'react';
import { SubscriptionPlan } from '@prisma/client';
import { SUBSCRIPTION_FEATURES } from '@/types/saas';

interface PlanSelectionProps {
  selectedPlan?: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  onSelect: (plan: SubscriptionPlan, cycle: 'monthly' | 'yearly') => void;
}

export function PlanSelection({ selectedPlan, billingCycle, onSelect }: PlanSelectionProps) {
  const [currentCycle, setCurrentCycle] = useState<'monthly' | 'yearly'>(billingCycle);

  const plans = [
    {
      id: 'FREE' as SubscriptionPlan,
      name: 'Gratuit',
      description: 'Parfait pour commencer',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: SUBSCRIPTION_FEATURES.FREE
    },
    {
      id: 'STARTER' as SubscriptionPlan,
      name: 'Starter',
      description: 'Pour les petites organisations',
      monthlyPrice: 19,
      yearlyPrice: 190,
      popular: true,
      features: SUBSCRIPTION_FEATURES.STARTER
    },
    {
      id: 'PROFESSIONAL' as SubscriptionPlan,
      name: 'Professionnel',
      description: 'Pour les organisations établies',
      monthlyPrice: 49,
      yearlyPrice: 490,
      popular: false,
      features: SUBSCRIPTION_FEATURES.PROFESSIONAL
    },
    {
      id: 'ENTERPRISE' as SubscriptionPlan,
      name: 'Entreprise',
      description: 'Pour les grandes organisations',
      monthlyPrice: 99,
      yearlyPrice: 990,
      popular: false,
      features: SUBSCRIPTION_FEATURES.ENTERPRISE
    }
  ];

  const handleCycleChange = (cycle: 'monthly' | 'yearly') => {
    setCurrentCycle(cycle);
    if (selectedPlan) {
      onSelect(selectedPlan, cycle);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    onSelect(plan, currentCycle);
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 'Gratuit';
    
    const price = currentCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const period = currentCycle === 'monthly' ? '/mois' : '/an';
    
    return `${price}€${period}`;
  };

  const getFeatureList = (features: typeof SUBSCRIPTION_FEATURES.FREE) => {
    const featureLabels = {
      maxMembers: features.maxMembers === -1 ? 'Membres illimités' : `Jusqu'à ${features.maxMembers} membres`,
      storageLimit: features.storageLimit === -1 ? 'Stockage illimité' : `${Math.round(features.storageLimit / 1024)}GB de stockage`,
      customBranding: features.customBranding ? 'Personnalisation complète' : 'Branding limité',
      apiAccess: features.apiAccess ? 'Accès API complet' : 'Pas d\'accès API',
      prioritySupport: features.prioritySupport ? 'Support prioritaire' : 'Support communautaire',
      analyticsRetention: features.analyticsRetention === -1 ? 'Analyses illimitées' : `${features.analyticsRetention} jours d'analyses`
    };

    const coreFeatures = [
      featureLabels.maxMembers,
      featureLabels.storageLimit
    ];

    const enabledFeatures = Object.entries(features.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => getFeatureDisplayName(feature));

    const additionalFeatures = [
      ...(features.customBranding ? ['Personnalisation complète'] : []),
      ...(features.apiAccess ? ['Accès API'] : []),
      ...(features.prioritySupport ? ['Support prioritaire'] : [])
    ];

    return [...coreFeatures, ...enabledFeatures.slice(0, 3), ...additionalFeatures];
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Choisissez votre plan d'abonnement
        </h3>
        <p className="text-gray-600">
          Vous pourrez modifier votre plan à tout moment
        </p>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleCycleChange('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => handleCycleChange('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annuel
            <span className="ml-1 text-green-600 text-xs">-20%</span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-primary/50'
              } ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {plan.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {plan.description}
                </p>
                <div className="text-3xl font-bold text-gray-900">
                  {getPrice(plan)}
                </div>
                {currentCycle === 'yearly' && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-gray-500">
                    soit {Math.round(plan.yearlyPrice / 12)}€/mois
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3">
                {getFeatureList(plan.features).map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trial notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Période d'essai gratuite
            </h4>
            <p className="text-sm text-blue-700">
              Tous les plans (sauf Gratuit) incluent 14 jours d'essai gratuit. 
              Aucune carte bancaire requise pour commencer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFeatureDisplayName(feature: string): string {
  const displayNames: Record<string, string> = {
    repertoire: 'Répertoire musical',
    scheduling: 'Planification',
    members: 'Gestion des membres',
    recordings: 'Enregistrements',
    sequences: 'Partitions',
    multimedia: 'Galerie multimédia',
    analytics: 'Analyses avancées',
    messaging: 'Messagerie',
    worship: 'Outils de louange',
    education: 'Outils éducatifs',
    commercial: 'Outils commerciaux',
    events: 'Gestion d\'événements',
    streaming: 'Diffusion live',
    booking: 'Réservations',
    merchandise: 'Boutique',
    donations: 'Dons en ligne'
  };
  
  return displayNames[feature] || feature;
}