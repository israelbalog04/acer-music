'use client';

import React, { useState, useCallback } from 'react';
import { OrganizationType, OrganizationLevel, MusicIndustry, OrganizationSize, SubscriptionPlan } from '@prisma/client';
import { OnboardingData } from '@/types/saas';
import { OrganizationLevelSelector } from './OrganizationLevelSelector';
import { ParentOrganizationSelector } from './ParentOrganizationSelector';
import { OrganizationTypeSelector } from './OrganizationTypeSelector';
import { OrganizationBasicInfo } from './OrganizationBasicInfo';
import { BrandingCustomization } from './BrandingCustomization';
import { PlanSelection } from './PlanSelection';
import { AdminUserSetup } from './AdminUserSetup';
import { OnboardingSuccess } from './OnboardingSuccess';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onCancel: () => void;
}

export function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getSteps = () => {
    const baseSteps = [
      { id: 1, title: 'Structure', component: 'level' },
      { id: 2, title: 'Type d\'organisation', component: 'type' },
      { id: 3, title: 'Informations de base', component: 'basic' },
      { id: 4, title: 'Personnalisation', component: 'branding' },
      { id: 5, title: 'Plan d\'abonnement', component: 'plan' },
      { id: 6, title: 'Administrateur', component: 'admin' },
      { id: 7, title: 'Finalisation', component: 'success' }
    ];

    // If user chose CHILD level, insert parent selection step
    if (data.organizationLevel === 'CHILD') {
      return baseSteps.slice(0, 2).concat([
        { id: 2.5, title: 'Organisation mère', component: 'parent' }
      ]).concat(
        baseSteps.slice(2).map(step => ({ ...step, id: step.id + 1 }))
      );
    }

    return baseSteps;
  };

  const steps = getSteps();

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    if (!isDataComplete(data)) {
      console.error('Données incomplètes:', data);
      return;
    }

    setIsLoading(true);
    try {
      await onComplete(data as OnboardingData);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      setIsLoading(false);
    }
  }, [data, onComplete]);

  const canProceed = useCallback((step: number): boolean => {
    const currentStepComponent = steps.find(s => s.id === step)?.component;
    
    switch (currentStepComponent) {
      case 'level': return !!data.organizationLevel;
      case 'parent': return data.organizationLevel !== 'CHILD' || !!data.parentOrganizationId;
      case 'type': return !!data.organizationType;
      case 'basic': return !!(data.organizationName && data.slug && data.country);
      case 'branding': return true; // Branding est optionnel
      case 'plan': return !!data.subscriptionPlan;
      case 'admin': return !!(data.adminUser?.email && data.adminUser?.password);
      default: return true;
    }
  }, [data, steps]);

  const renderStepContent = () => {
    const currentStepComponent = steps.find(s => s.id === currentStep)?.component;
    
    switch (currentStepComponent) {
      case 'level':
        return (
          <OrganizationLevelSelector
            selectedLevel={data.organizationLevel}
            onSelect={(level) => updateData({ organizationLevel: level })}
          />
        );
      case 'parent':
        return (
          <ParentOrganizationSelector
            selectedParentId={data.parentOrganizationId}
            organizationType={data.organizationType}
            onSelect={(parentId) => updateData({ parentOrganizationId: parentId })}
          />
        );
      case 'type':
        return (
          <OrganizationTypeSelector
            selectedType={data.organizationType}
            onSelect={(type) => updateData({ organizationType: type })}
          />
        );
      case 'basic':
        return (
          <OrganizationBasicInfo
            data={data}
            onChange={updateData}
          />
        );
      case 'branding':
        return (
          <BrandingCustomization
            organizationType={data.organizationType}
            data={data}
            onChange={updateData}
          />
        );
      case 'plan':
        return (
          <PlanSelection
            selectedPlan={data.subscriptionPlan}
            billingCycle={data.billingCycle || 'monthly'}
            onSelect={(plan, cycle) => updateData({ 
              subscriptionPlan: plan, 
              billingCycle: cycle 
            })}
          />
        );
      case 'admin':
        return (
          <AdminUserSetup
            data={data.adminUser}
            onChange={(adminUser) => updateData({ adminUser })}
          />
        );
      case 'success':
        return (
          <OnboardingSuccess
            organizationName={data.organizationName || ''}
            onFinish={handleComplete}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créez votre organisation musicale
          </h1>
          <p className="text-gray-600">
            Configurons votre plateforme en quelques étapes simples
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold
                  ${currentStep >= step.id 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-gray-400 border-gray-300'
                  }
                `}>
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <div className="h-1 bg-gray-200 rounded-full">
              <div 
                className="h-1 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="min-h-96">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={currentStep === 1 ? onCancel : prevStep}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={isLoading}
            >
              {currentStep === 1 ? 'Annuler' : 'Précédent'}
            </button>

            <div className="text-sm text-gray-500">
              Étape {currentStep} sur {steps.length}
            </div>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!canProceed(currentStep) || isLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed(currentStep) || isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Création...
                  </>
                ) : (
                  'Créer mon organisation'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function isDataComplete(data: Partial<OnboardingData>): data is OnboardingData {
  return !!(
    data.organizationType &&
    data.organizationName &&
    data.slug &&
    data.country &&
    data.subscriptionPlan &&
    data.adminUser?.email &&
    data.adminUser?.password
  );
}