'use client';

import React, { useState, useMemo } from 'react';
import { FeatureConfiguration, ModuleConfiguration, HierarchyLevel } from './OrganizationConfigurator';

interface FeatureConfiguratorProps {
  features: FeatureConfiguration[];
  modules: ModuleConfiguration[];
  hierarchyLevels: HierarchyLevel[];
  onChange: (features: FeatureConfiguration[], modules: ModuleConfiguration[]) => void;
}

export function FeatureConfigurator({ 
  features, 
  modules, 
  hierarchyLevels, 
  onChange 
}: FeatureConfiguratorProps) {
  const [activeTab, setActiveTab] = useState<'features' | 'modules'>('features');

  const availableFeatures = useMemo(() => [
    {
      category: 'Core',
      icon: '🏗️',
      items: [
        {
          id: 'repertoire',
          name: 'Répertoire Musical',
          description: 'Gestion des chansons et partitions',
          required: true
        },
        {
          id: 'members',
          name: 'Gestion des Membres',
          description: 'Invitations, rôles et profils',
          required: true
        },
        {
          id: 'events',
          name: 'Planification d\'Événements',
          description: 'Calendrier et organisation',
          required: true
        }
      ]
    },
    {
      category: 'Contenu',
      icon: '🎵',
      items: [
        {
          id: 'recordings',
          name: 'Enregistrements',
          description: 'Upload et lecture de fichiers audio'
        },
        {
          id: 'sequences',
          name: 'Partitions',
          description: 'Gestion des partitions et tablatures'
        },
        {
          id: 'multimedia',
          name: 'Galerie Multimédia',
          description: 'Photos, vidéos et documents'
        },
        {
          id: 'lyrics',
          name: 'Paroles',
          description: 'Gestion des paroles et accords'
        }
      ]
    },
    {
      category: 'Communication',
      icon: '💬',
      items: [
        {
          id: 'messaging',
          name: 'Messagerie Interne',
          description: 'Chat et messages entre membres'
        },
        {
          id: 'notifications',
          name: 'Notifications Avancées',
          description: 'Notifications push et email personnalisées'
        },
        {
          id: 'announcements',
          name: 'Annonces',
          description: 'Système d\'annonces globales'
        }
      ]
    },
    {
      category: 'Analyse',
      icon: '📊',
      items: [
        {
          id: 'analytics',
          name: 'Analyses & Statistiques',
          description: 'Rapports d\'activité et métriques'
        },
        {
          id: 'reporting',
          name: 'Rapports Personnalisés',
          description: 'Génération de rapports sur mesure'
        },
        {
          id: 'insights',
          name: 'Insights Prédictifs',
          description: 'Analyses prédictives et recommandations'
        }
      ]
    },
    {
      category: 'Intégrations',
      icon: '🔗',
      items: [
        {
          id: 'streaming',
          name: 'Diffusion Live',
          description: 'Streaming en direct des événements'
        },
        {
          id: 'calendar_sync',
          name: 'Synchronisation Calendrier',
          description: 'Sync avec Google Calendar, Outlook, etc.'
        },
        {
          id: 'api_access',
          name: 'Accès API',
          description: 'API REST pour intégrations tierces'
        },
        {
          id: 'webhooks',
          name: 'Webhooks',
          description: 'Notifications en temps réel vers services externes'
        }
      ]
    },
    {
      category: 'Spécialisé',
      icon: '🎯',
      items: [
        {
          id: 'worship',
          name: 'Outils de Louange',
          description: 'Fonctionnalités spécifiques aux églises'
        },
        {
          id: 'education',
          name: 'Outils Éducatifs',
          description: 'Fonctionnalités pour l\'enseignement musical'
        },
        {
          id: 'commercial',
          name: 'Outils Commerciaux',
          description: 'Booking, merchandising, ventes'
        },
        {
          id: 'donations',
          name: 'Gestion des Dons',
          description: 'Collecte et suivi des dons en ligne'
        }
      ]
    }
  ], []);

  const availableModules = useMemo(() => [
    {
      category: 'Workflow',
      icon: '⚙️',
      items: [
        {
          id: 'approval_chains',
          name: 'Chaînes d\'Approbation',
          description: 'Processus de validation hiérarchique',
          config: {
            maxLevels: 5,
            autoEscalation: true,
            timeoutDays: 7
          }
        },
        {
          id: 'auto_assignment',
          name: 'Attribution Automatique',
          description: 'Assignation automatique selon les règles',
          config: {
            rules: [],
            fallbackRole: 'admin'
          }
        }
      ]
    },
    {
      category: 'Sécurité',
      icon: '🛡️',
      items: [
        {
          id: 'two_factor',
          name: 'Authentification 2FA',
          description: 'Sécurité renforcée par double authentification',
          config: {
            mandatory: false,
            methods: ['sms', 'email', 'app']
          }
        },
        {
          id: 'audit_trail',
          name: 'Piste d\'Audit',
          description: 'Traçabilité complète des actions',
          config: {
            retention: 365,
            detailLevel: 'full'
          }
        }
      ]
    }
  ], []);

  const getFeatureConfig = (featureId: string): FeatureConfiguration | undefined => {
    return features.find(f => f.id === featureId);
  };

  const getModuleConfig = (moduleId: string): ModuleConfiguration | undefined => {
    return modules.find(m => m.id === moduleId);
  };

  const toggleFeature = (featureId: string, enabled: boolean) => {
    const existingIndex = features.findIndex(f => f.id === featureId);
    const updatedFeatures = [...features];

    if (existingIndex >= 0) {
      updatedFeatures[existingIndex] = { ...updatedFeatures[existingIndex], enabled };
    } else {
      updatedFeatures.push({
        id: featureId,
        name: featureId,
        enabled,
        levels: hierarchyLevels.map(l => l.id)
      });
    }

    onChange(updatedFeatures, modules);
  };

  const updateFeatureLevels = (featureId: string, levels: string[]) => {
    const existingIndex = features.findIndex(f => f.id === featureId);
    const updatedFeatures = [...features];

    if (existingIndex >= 0) {
      updatedFeatures[existingIndex] = { ...updatedFeatures[existingIndex], levels };
    }

    onChange(updatedFeatures, modules);
  };

  const toggleModule = (moduleId: string, enabled: boolean) => {
    const existingIndex = modules.findIndex(m => m.id === moduleId);
    const updatedModules = [...modules];

    if (existingIndex >= 0) {
      updatedModules[existingIndex] = { ...updatedModules[existingIndex], enabled };
    } else {
      const moduleInfo = availableModules
        .flatMap((cat: any) => cat.items)
        .find((item: any) => item.id === moduleId);
      
      if (moduleInfo) {
        updatedModules.push({
          id: moduleId,
          name: (moduleInfo as any).name,
          enabled,
          config: (moduleInfo as any).config || {}
        });
      }
    }

    onChange(features, updatedModules);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fonctionnalités & Modules</h2>
          <p className="text-gray-600 mt-1">
            Activez et configurez les fonctionnalités selon vos besoins
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'features', label: 'Fonctionnalités', icon: '🔧' },
            { id: 'modules', label: 'Modules', icon: '📦' }
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

      {/* Features tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {availableFeatures.map((category) => (
            <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{category.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((feature) => {
                  const config = getFeatureConfig(feature.id);
                  const isEnabled = config?.enabled || false;
                  const isRequired = (feature as any).required || false;
                  
                  return (
                    <div
                      key={feature.id}
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        isEnabled
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white'
                      } ${isRequired ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          {isRequired && (
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              Requis
                            </span>
                          )}
                        </div>
                        
                        <label className="flex items-center ml-4">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            disabled={isRequired}
                            onChange={(e) => toggleFeature(feature.id, e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                          />
                        </label>
                      </div>
                      
                      {isEnabled && !isRequired && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Niveaux autorisés:
                          </h5>
                          <div className="space-y-1">
                            {hierarchyLevels.map((level) => (
                              <label key={level.id} className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  checked={config?.levels.includes(level.id) || false}
                                  onChange={(e) => {
                                    const currentLevels = config?.levels || [];
                                    const newLevels = e.target.checked
                                      ? [...currentLevels, level.id]
                                      : currentLevels.filter(l => l !== level.id);
                                    updateFeatureLevels(feature.id, newLevels);
                                  }}
                                  className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                                />
                                <span className="mr-2">{level.icon}</span>
                                {level.displayName}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modules tab */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {availableModules.map((category) => (
            <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{category.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
              </div>
              
              <div className="space-y-4">
                {category.items.map((module) => {
                  const config = getModuleConfig(module.id);
                  const isEnabled = config?.enabled || false;
                  
                  return (
                    <div
                      key={module.id}
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        isEnabled
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-medium text-gray-900">{module.name}</h4>
                            <label className="flex items-center ml-4">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => toggleModule(module.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                          </div>
                          <p className="text-sm text-gray-600">{module.description}</p>
                          
                          {isEnabled && module.config && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Configuration:
                              </h5>
                              <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                {JSON.stringify(module.config, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Résumé de Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Fonctionnalités activées:</span>
            <span className="ml-2 font-medium text-blue-900">
              {features.filter(f => f.enabled).length}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Modules activés:</span>
            <span className="ml-2 font-medium text-blue-900">
              {modules.filter(m => m.enabled).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}