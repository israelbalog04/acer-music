'use client';

import React, { useState } from 'react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// Templates prédéfinis pour différents types d'organisations
const ORGANIZATION_TEMPLATES = {
  CHURCH: {
    name: 'Église / Communauté',
    description: 'Configuration optimisée pour les communautés religieuses',
    icon: '⛪',
    setupTime: '2 minutes',
    features: ['Gestion des cultes', 'Équipes de louange', 'Planning des services'],
    defaultConfig: {
      terminology: {
        member: 'fidèle',
        event: 'culte',
        team: 'équipe de louange'
      },
      colors: { primary: '#7c3aed', secondary: '#a855f7', accent: '#ec4899' },
      hierarchy: ['Église', 'Département', 'Équipe']
    }
  },
  SCHOOL: {
    name: 'École de Musique',
    description: 'Idéal pour conservatoires et écoles',
    icon: '🎓',
    setupTime: '2 minutes',
    features: ['Gestion des cours', 'Élèves et professeurs', 'Concerts scolaires'],
    defaultConfig: {
      terminology: {
        member: 'élève',
        event: 'cours',
        team: 'classe'
      },
      colors: { primary: '#059669', secondary: '#0891b2', accent: '#7c3aed' },
      hierarchy: ['École', 'Département', 'Classe']
    }
  },
  BAND: {
    name: 'Groupe / Artiste',
    description: 'Pour groupes de musique et artistes indépendants',
    icon: '🎸',
    setupTime: '1 minute',
    features: ['Répétitions', 'Concerts', 'Enregistrements'],
    defaultConfig: {
      terminology: {
        member: 'musicien',
        event: 'concert',
        team: 'groupe'
      },
      colors: { primary: '#dc2626', secondary: '#ea580c', accent: '#ca8a04' },
      hierarchy: ['Groupe', 'Section']
    }
  },
  ORCHESTRA: {
    name: 'Orchestre / Ensemble',
    description: 'Configuration pour orchestres et grands ensembles',
    icon: '🎼',
    setupTime: '3 minutes',
    features: ['Sections orchestrales', 'Répertoire classique', 'Saisons musicales'],
    defaultConfig: {
      terminology: {
        member: 'musicien',
        event: 'concert',
        team: 'section'
      },
      colors: { primary: '#1f2937', secondary: '#374151', accent: '#6b7280' },
      hierarchy: ['Orchestre', 'Section', 'Pupitre']
    }
  },
  CHOIR: {
    name: 'Chorale',
    description: 'Spécialement conçu pour les chorales',
    icon: '🎤',
    setupTime: '2 minutes',
    features: ['Tessiture vocale', 'Répertoire choral', 'Concerts'],
    defaultConfig: {
      terminology: {
        member: 'choriste',
        event: 'concert',
        team: 'pupitre'
      },
      colors: { primary: '#0ea5e9', secondary: '#3b82f6', accent: '#8b5cf6' },
      hierarchy: ['Chorale', 'Pupitre']
    }
  }
};

interface QuickSetupWizardProps {
  onComplete: (config: any) => void;
}

export function QuickSetupWizard({ onComplete }: QuickSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof ORGANIZATION_TEMPLATES | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [customBranding, setCustomBranding] = useState({
    logo: '',
    primaryColor: '#6366f1'
  });

  const steps = [
    'Type d\'organisation',
    'Nom et branding',
    'Confirmation'
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (selectedTemplate) {
      const template = ORGANIZATION_TEMPLATES[selectedTemplate];
      const config = {
        name: organizationName,
        type: selectedTemplate,
        ...template.defaultConfig,
        branding: {
          ...template.defaultConfig.colors,
          logo: customBranding.logo,
          primary: customBranding.primaryColor
        }
      };
      onComplete(config);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header avec progression */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration Rapide ⚡
          </h1>
          <p className="text-gray-600 mb-6">
            Configurez votre organisation musicale en quelques clics
          </p>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  index <= currentStep 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu des étapes */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Étape 1: Sélection du type */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Quel type d'organisation êtes-vous ?
              </h2>
              <p className="text-gray-600 mb-6">
                Sélectionnez le template qui correspond le mieux à votre organisation
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ORGANIZATION_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key as keyof typeof ORGANIZATION_TEMPLATES)}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                      selectedTemplate === key
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        ⚡ {template.setupTime}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {template.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-500">
                          <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 2: Nom et branding */}
          {currentStep === 1 && selectedTemplate && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Personnalisez votre {ORGANIZATION_TEMPLATES[selectedTemplate].name}
              </h2>
              <p className="text-gray-600 mb-6">
                Donnez un nom à votre organisation et personnalisez son apparence
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulaire */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de votre organisation
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder={`Ex: Chorale Sainte-Marie, École de Musique Mozart...`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur principale
                    </label>
                    <div className="flex space-x-3">
                      {[
                        ORGANIZATION_TEMPLATES[selectedTemplate].defaultConfig.colors.primary,
                        '#dc2626', '#059669', '#7c3aed', '#0ea5e9', '#ea580c'
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomBranding(prev => ({ ...prev, primaryColor: color }))}
                          className={`w-10 h-10 rounded-lg border-4 ${
                            customBranding.primaryColor === color ? 'border-gray-800' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Aperçu */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Aperçu</h3>
                  <div className="bg-white rounded-lg p-4 border">
                    <div 
                      className="h-3 rounded-t-lg mb-4"
                      style={{ backgroundColor: customBranding.primaryColor }}
                    />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">
                        {organizationName || 'Votre Organisation'}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{ORGANIZATION_TEMPLATES[selectedTemplate].icon}</span>
                        <span className="text-sm text-gray-600">
                          {ORGANIZATION_TEMPLATES[selectedTemplate].name}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['Membres', 'Événements', 'Répertoire'].map((item) => (
                          <div key={item} className="bg-gray-100 p-2 rounded text-xs text-center">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Confirmation */}
          {currentStep === 2 && selectedTemplate && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Parfait ! Votre organisation est prête
              </h2>
              <p className="text-gray-600 mb-8">
                Nous avons configuré <strong>{organizationName}</strong> avec les paramètres optimaux pour {ORGANIZATION_TEMPLATES[selectedTemplate].name.toLowerCase()}
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Ce qui a été configuré :</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    Structure hiérarchique adaptée
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    Terminologie personnalisée
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    Couleurs et branding
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    Fonctionnalités essentielles
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  💡 <strong>Astuce :</strong> Vous pourrez toujours modifier ces paramètres plus tard dans les Paramètres Avancés
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>
            
            <div className="flex space-x-3">
              {currentStep < 2 ? (
                <button
                  onClick={nextStep}
                  disabled={currentStep === 0 && !selectedTemplate}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Continuer
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!organizationName.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  🚀 Créer mon organisation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}