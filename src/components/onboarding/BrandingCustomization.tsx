'use client';

import React, { useState } from 'react';
import { OrganizationType } from '@prisma/client';
import { OnboardingData, BrandingConfig, CustomTerminology } from '@/types/saas';
import { ORGANIZATION_TEMPLATES } from '@/types/saas';

interface BrandingCustomizationProps {
  organizationType?: OrganizationType;
  data: Partial<OnboardingData>;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function BrandingCustomization({ organizationType, data, onChange }: BrandingCustomizationProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'terminology'>('colors');

  const template = organizationType ? ORGANIZATION_TEMPLATES[organizationType] : null;
  const defaultBranding = template?.branding || {};
  const defaultTerminology = template?.terminology || {};

  const currentBranding = { ...defaultBranding, ...data.branding };
  const currentTerminology = { ...defaultTerminology, ...data.terminology };

  const handleBrandingChange = (updates: Partial<BrandingConfig>) => {
    onChange({
      branding: { ...currentBranding, ...updates }
    });
  };

  const handleTerminologyChange = (updates: Partial<CustomTerminology>) => {
    onChange({
      terminology: { ...currentTerminology, ...updates }
    });
  };

  const handleColorChange = (colorKey: string, value: string) => {
    const colors = { ...currentBranding.colors, [colorKey]: value };
    handleBrandingChange({ colors: colors as any });
  };

  const colorFields = [
    { key: 'primary', label: 'Couleur principale', description: 'Utilisée pour les boutons et liens' },
    { key: 'secondary', label: 'Couleur secondaire', description: 'Utilisée pour les éléments d\'accent' },
    { key: 'accent', label: 'Couleur d\'accent', description: 'Pour les éléments de mise en évidence' }
  ];

  const terminologyFields = [
    { key: 'organization', label: 'Organisation', placeholder: 'Ex: Église, Groupe, Conservatoire' },
    { key: 'members', label: 'Membres', placeholder: 'Ex: Musiciens, Étudiants, Artistes' },
    { key: 'events', label: 'Événements', placeholder: 'Ex: Services, Concerts, Cours' },
    { key: 'director', label: 'Directeur', placeholder: 'Ex: Chef de Louange, Professeur, Leader' },
    { key: 'repertoire', label: 'Répertoire', placeholder: 'Ex: Répertoire, Songbook, Partitions' },
    { key: 'recordings', label: 'Enregistrements', placeholder: 'Ex: Enregistrements, Démos, Audios' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Personnalisez votre organisation
        </h3>
        <p className="text-gray-600">
          Adaptez l'apparence et le vocabulaire à votre organisation (optionnel)
        </p>
      </div>

      {/* Preview card */}
      <div 
        className="bg-white border-2 rounded-lg p-6 mb-6"
        style={{
          borderColor: currentBranding.colors?.primary || '#6366f1',
          background: `linear-gradient(135deg, ${currentBranding.colors?.primary || '#6366f1'}08, ${currentBranding.colors?.secondary || '#8b5cf6'}08)`
        }}
      >
        <h4 className="text-lg font-semibold mb-2" style={{ color: currentBranding.colors?.primary || '#6366f1' }}>
          {data.organizationName || 'Nom de votre organisation'}
        </h4>
        <p className="text-gray-600 text-sm mb-4">
          Aperçu de votre {currentTerminology.organization?.toLowerCase() || 'organisation'} avec vos couleurs personnalisées
        </p>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: currentBranding.colors?.primary || '#6366f1' }}
          >
            Rejoindre les {currentTerminology.members?.toLowerCase() || 'membres'}
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: currentBranding.colors?.secondary || '#8b5cf6' }}
          >
            Voir les {currentTerminology.events?.toLowerCase() || 'événements'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('colors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'colors'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Couleurs
          </button>
          <button
            onClick={() => setActiveTab('terminology')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'terminology'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vocabulaire
          </button>
        </nav>
      </div>

      {/* Colors tab */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {colorFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <div className="flex space-x-3">
                  <input
                    type="color"
                    value={(currentBranding.colors as any)?.[field.key] || '#6366f1'}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(currentBranding.colors as any)?.[field.key] || '#6366f1'}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">{field.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Couleurs prédéfinies</h5>
            <div className="grid grid-cols-3 gap-3">
              {getPresetColors().map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleBrandingChange({ colors: preset.colors as any })}
                  className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-white transition-colors"
                >
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.primary }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.secondary }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.accent }} />
                  </div>
                  <span className="text-sm text-gray-700">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Terminology tab */}
      {activeTab === 'terminology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {terminologyFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={currentTerminology[field.key as keyof CustomTerminology] || ''}
                  onChange={(e) => handleTerminologyChange({ [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Vocabulaire adaptatif
                </h4>
                <p className="text-sm text-blue-700">
                  Ces termes seront utilisés dans toute l'interface pour correspondre 
                  au vocabulaire de votre organisation. Vous pourrez les modifier à tout moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skip option */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-gray-500">
          Vous pouvez personnaliser ces éléments plus tard dans les paramètres de votre organisation
        </p>
      </div>
    </div>
  );
}

function getPresetColors() {
  return [
    {
      name: 'Indigo',
      colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' }
    },
    {
      name: 'Vert',
      colors: { primary: '#059669', secondary: '#0891b2', accent: '#7c3aed' }
    },
    {
      name: 'Rouge',
      colors: { primary: '#dc2626', secondary: '#ea580c', accent: '#ca8a04' }
    },
    {
      name: 'Rose',
      colors: { primary: '#e11d48', secondary: '#db2777', accent: '#7c2d12' }
    },
    {
      name: 'Orange',
      colors: { primary: '#ea580c', secondary: '#f59e0b', accent: '#dc2626' }
    },
    {
      name: 'Violet',
      colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#06b6d4' }
    }
  ];
}