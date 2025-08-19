'use client';

import React, { useState } from 'react';
import { HierarchyLevel } from './OrganizationConfigurator';

interface ExtendedBrandingConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customizableElements: UICustomization[];
  conditionalStyling: ConditionalStyle[];
}

interface UICustomization {
  element: string;
  properties: Record<string, string>;
  conditions?: string[];
}

interface ConditionalStyle {
  condition: string;
  styles: Record<string, string>;
}

interface UIElementConfiguration {
  element: string;
  visible: boolean;
  customization?: Record<string, any>;
}

interface BrandingConfiguratorProps {
  branding: ExtendedBrandingConfig;
  uiElements: UIElementConfiguration[];
  terminology: Record<string, string>;
  onChange: (branding: ExtendedBrandingConfig, uiElements: UIElementConfiguration[]) => void;
}

export function BrandingConfigurator({ 
  branding, 
  uiElements, 
  terminology, 
  onChange 
}: BrandingConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'elements' | 'layout' | 'preview'>('colors');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const updateBranding = (updates: Partial<ExtendedBrandingConfig>) => {
    onChange({ ...branding, ...updates }, uiElements);
  };

  const updateUIElements = (updates: UIElementConfiguration[]) => {
    onChange(branding, updates);
  };

  const colorPresets = [
    {
      name: 'Église Moderne',
      colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' }
    },
    {
      name: 'Conservatoire Classique',
      colors: { primary: '#059669', secondary: '#0891b2', accent: '#7c3aed' }
    },
    {
      name: 'Groupe Rock',
      colors: { primary: '#dc2626', secondary: '#ea580c', accent: '#ca8a04' }
    },
    {
      name: 'Orchestre Élégant',
      colors: { primary: '#1f2937', secondary: '#374151', accent: '#6b7280' }
    },
    {
      name: 'Chorale Spirituelle',
      colors: { primary: '#7c3aed', secondary: '#a855f7', accent: '#ec4899' }
    }
  ];

  const availableElements = [
    {
      category: 'Navigation',
      items: [
        { id: 'sidebar', name: 'Barre latérale', description: 'Menu principal de navigation' },
        { id: 'topbar', name: 'Barre supérieure', description: 'Navigation horizontale' },
        { id: 'breadcrumb', name: 'Fil d\'Ariane', description: 'Navigation contextuelle' },
        { id: 'user_menu', name: 'Menu utilisateur', description: 'Menu profil et paramètres' }
      ]
    },
    {
      category: 'Contenu',
      items: [
        { id: 'dashboard_widgets', name: 'Widgets tableau de bord', description: 'Cartes d\'information' },
        { id: 'recent_activity', name: 'Activité récente', description: 'Feed des dernières actions' },
        { id: 'quick_actions', name: 'Actions rapides', description: 'Boutons d\'action fréquente' },
        { id: 'statistics', name: 'Statistiques', description: 'Métriques et graphiques' }
      ]
    },
    {
      category: 'Communication',
      items: [
        { id: 'notifications_panel', name: 'Panneau notifications', description: 'Centre de notifications' },
        { id: 'chat_widget', name: 'Widget chat', description: 'Chat intégré' },
        { id: 'announcements', name: 'Bannière annonces', description: 'Annonces importantes' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Interface & Branding</h2>
          <p className="text-gray-600 mt-1">
            Personnalisez l'apparence et l'expérience utilisateur
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'colors', label: 'Couleurs', icon: '🎨' },
            { id: 'elements', label: 'Éléments UI', icon: '🧩' },
            { id: 'layout', label: 'Mise en page', icon: '📐' },
            { id: 'preview', label: 'Aperçu', icon: '👁️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Colors tab */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* Color pickers */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Palette de Couleurs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur Principale
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={branding.colors.primary}
                    onChange={(e) => updateBranding({
                      colors: { ...branding.colors, primary: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.colors.primary}
                    onChange={(e) => updateBranding({
                      colors: { ...branding.colors, primary: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Utilisée pour les boutons principaux, liens</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur Secondaire
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={branding.colors.secondary}
                    onChange={(e) => updateBranding({
                      colors: { ...branding.colors, secondary: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.colors.secondary}
                    onChange={(e) => updateBranding({
                      colors: { ...branding.colors, secondary: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Utilisée pour les éléments d'accent</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur d'Accent
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={branding.colors.accent}
                    onChange={(e) => updateBranding({
                      colors: { ...branding.colors, accent: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.colors.accent}
                    onChange={(e) => updateBranding({
                      colors: { ...branding.colors, accent: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Utilisée pour les notifications, badges</p>
              </div>
            </div>
          </div>

          {/* Color presets */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Palettes Prédéfinies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateBranding({ colors: preset.colors })}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 text-left transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex space-x-1">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: preset.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu en Direct</h3>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                <button 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: branding.colors.primary }}
                >
                  Bouton Principal
                </button>
                
                <button 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: branding.colors.secondary }}
                >
                  Bouton Secondaire
                </button>
                
                <div 
                  className="px-3 py-2 rounded text-white text-sm inline-block"
                  style={{ backgroundColor: branding.colors.accent }}
                >
                  Badge d'accent
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Elements tab */}
      {activeTab === 'elements' && (
        <div className="space-y-6">
          {availableElements.map((category) => (
            <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
              
              <div className="space-y-3">
                {category.items.map((element) => {
                  const config = uiElements.find(e => e.element === element.id);
                  const isVisible = config?.visible !== false;
                  
                  return (
                    <div key={element.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{element.name}</h4>
                        <p className="text-sm text-gray-600">{element.description}</p>
                      </div>
                      
                      <label className="flex items-center ml-4">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) => {
                            const updatedElements = [...uiElements];
                            const existingIndex = updatedElements.findIndex(el => el.element === element.id);
                            
                            if (existingIndex >= 0) {
                              updatedElements[existingIndex].visible = e.target.checked;
                            } else {
                              updatedElements.push({
                                element: element.id,
                                visible: e.target.checked
                              });
                            }
                            
                            updateUIElements(updatedElements);
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {isVisible ? 'Visible' : 'Masqué'}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Layout tab */}
      {activeTab === 'layout' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mise en Page</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Configuration Avancée
                </h4>
                <p className="text-sm text-blue-700">
                  Les options de mise en page avancées (grilles, espacements, responsive) 
                  seront disponibles dans une version ultérieure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Device selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Aperçu:</span>
            {[
              { id: 'desktop', label: 'Bureau', icon: '🖥️' },
              { id: 'tablet', label: 'Tablette', icon: '📱' },
              { id: 'mobile', label: 'Mobile', icon: '📱' }
            ].map((device) => (
              <button
                key={device.id}
                onClick={() => setPreviewMode(device.id as any)}
                className={`px-3 py-2 rounded-lg border font-medium text-sm ${
                  previewMode === device.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {device.icon} {device.label}
              </button>
            ))}
          </div>

          {/* Preview frame */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div 
              className={`mx-auto border border-gray-300 rounded-lg overflow-hidden ${
                previewMode === 'desktop' ? 'w-full h-96' :
                previewMode === 'tablet' ? 'w-2/3 h-80' :
                'w-80 h-96'
              }`}
              style={{
                background: `linear-gradient(135deg, ${branding.colors.primary}08, ${branding.colors.secondary}08)`
              }}
            >
              <div 
                className="h-12 flex items-center px-4"
                style={{ backgroundColor: branding.colors.primary }}
              >
                <div className="text-white font-medium">
                  {terminology.platform || 'Plateforme Musicale'}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tableau de bord {terminology.organization || 'Organisation'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900">
                      {terminology.member_plural || 'Membres'}
                    </h3>
                    <div 
                      className="text-2xl font-bold mt-2"
                      style={{ color: branding.colors.primary }}
                    >
                      24
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900">
                      {terminology.event_plural || 'Événements'}
                    </h3>
                    <div 
                      className="text-2xl font-bold mt-2"
                      style={{ color: branding.colors.secondary }}
                    >
                      8
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900">
                      {terminology.song_plural || 'Chansons'}
                    </h3>
                    <div 
                      className="text-2xl font-bold mt-2"
                      style={{ color: branding.colors.accent }}
                    >
                      156
                    </div>
                  </div>
                </div>
                
                <button 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: branding.colors.primary }}
                >
                  Nouveau {terminology.event || 'Événement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}