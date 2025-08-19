'use client';

import React from 'react';

interface OnboardingSuccessProps {
  organizationName: string;
  onFinish: () => void;
  isLoading: boolean;
}

export function OnboardingSuccess({ organizationName, onFinish, isLoading }: OnboardingSuccessProps) {
  const nextSteps = [
    {
      icon: '👥',
      title: 'Inviter des membres',
      description: 'Ajoutez vos musiciens et collaborateurs'
    },
    {
      icon: '🎵',
      title: 'Créer votre répertoire',
      description: 'Ajoutez vos chansons et partitions'
    },
    {
      icon: '📅',
      title: 'Planifier des événements',
      description: 'Organisez vos répétitions et concerts'
    },
    {
      icon: '🎤',
      title: 'Partager des enregistrements',
      description: 'Uploadez vos démos et enregistrements'
    }
  ];

  return (
    <div className="text-center space-y-8">
      {/* Success icon */}
      <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Success message */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">
          Félicitations ! 🎉
        </h3>
        <p className="text-lg text-gray-600">
          <strong>{organizationName}</strong> est prêt à être lancé !
        </p>
        <p className="text-gray-500">
          Votre organisation a été configurée avec succès. 
          Vous allez maintenant pouvoir accéder à votre tableau de bord.
        </p>
      </div>

      {/* What's next */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Prochaines étapes recommandées
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextSteps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">
                    {step.title}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-left">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Période d'essai activée
            </h4>
            <p className="text-sm text-blue-700">
              Votre période d'essai de 14 jours a commencé. Explorez toutes les fonctionnalités 
              sans limitation. Vous recevrez un rappel avant la fin de votre période d'essai.
            </p>
          </div>
        </div>
      </div>

      {/* Launch button */}
      <div className="pt-4">
        <button
          onClick={onFinish}
          disabled={isLoading}
          className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Finalisation en cours...
            </>
          ) : (
            <>
              Accéder à mon organisation
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Help */}
      <div className="text-sm text-gray-500 space-y-2">
        <p>
          Besoin d'aide ? Consultez notre{' '}
          <a href="/docs" className="text-primary hover:underline">
            documentation
          </a>{' '}
          ou{' '}
          <a href="/support" className="text-primary hover:underline">
            contactez notre support
          </a>
        </p>
      </div>
    </div>
  );
}