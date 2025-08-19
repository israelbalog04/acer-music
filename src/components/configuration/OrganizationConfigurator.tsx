'use client';

import React, { useState, useCallback } from 'react';
import { OrganizationType } from '@prisma/client';
import { HierarchyLevelEditor } from './HierarchyLevelEditor';
import { TerminologyEditor } from './TerminologyEditor';
import { RolePermissionEditor } from './RolePermissionEditor';
import { WorkflowEditor } from './WorkflowEditor';
import { BrandingConfigurator } from './BrandingConfigurator';
import { FeatureConfigurator } from './FeatureConfigurator';
import { HelpButton } from '@/components/ui/HelpButton';

export interface OrganizationConfig {
  // Structure hiérarchique
  hierarchyLevels: HierarchyLevel[];
  allowedTransitions: HierarchyTransition[];
  
  // Terminologie personnalisée
  terminology: Record<string, string>;
  pluralRules: Record<string, string>;
  
  // Rôles et permissions
  customRoles: CustomRole[];
  roleHierarchy: RoleHierarchy[];
  permissions: CustomPermission[];
  
  // Workflows
  workflows: OrganizationWorkflow[];
  approvalChains: ApprovalChain[];
  
  // Features et modules
  features: FeatureConfiguration[];
  modules: ModuleConfiguration[];
  
  // Branding et interface
  branding: ExtendedBrandingConfig;
  uiElements: UIElementConfiguration[];
}

export interface HierarchyLevel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  canHaveChildren: boolean;
  canHaveParent: boolean;
  maxChildren?: number;
  requiredFields: string[];
  optionalFields: string[];
  inheritanceRules: InheritanceRule[];
}

export interface HierarchyTransition {
  from: string;
  to: string;
  allowedBy: string[];
  requiresApproval: boolean;
  approvalChain?: string;
}

export interface CustomRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  permissions: string[];
  applicableLevels: string[];
  inheritFrom?: string;
}

export interface CustomPermission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  scope: 'organization' | 'hierarchy' | 'global';
  dependencies?: string[];
}

export interface OrganizationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
}

interface OrganizationConfiguratorProps {
  initialConfig?: Partial<OrganizationConfig>;
  organizationType: OrganizationType;
  onConfigChange: (config: OrganizationConfig) => void;
  onSave: (config: OrganizationConfig) => void;
}

export function OrganizationConfigurator({
  initialConfig,
  organizationType,
  onConfigChange,
  onSave
}: OrganizationConfiguratorProps) {
  const [config, setConfig] = useState<OrganizationConfig>(() => 
    getDefaultConfig(organizationType, initialConfig)
  );
  
  const [activeTab, setActiveTab] = useState<ConfigTab>('hierarchy');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tabs: ConfigTabInfo[] = [
    {
      id: 'hierarchy',
      title: 'Structure',
      description: 'Niveaux hiérarchiques et transitions',
      icon: '🏗️'
    },
    {
      id: 'terminology',
      title: 'Terminologie',
      description: 'Vocabulaire et termes personnalisés',
      icon: '📝'
    },
    {
      id: 'roles',
      title: 'Rôles & Permissions',
      description: 'Gestion des accès et permissions',
      icon: '👥'
    },
    {
      id: 'workflows',
      title: 'Processus',
      description: 'Workflows et chaînes d\'approbation',
      icon: '⚙️'
    },
    {
      id: 'features',
      title: 'Fonctionnalités',
      description: 'Modules et fonctionnalités activées',
      icon: '🔧'
    },
    {
      id: 'branding',
      title: 'Interface',
      description: 'Branding et éléments d\'interface',
      icon: '🎨'
    }
  ];

  const updateConfig = useCallback((updates: Partial<OrganizationConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      onConfigChange(newConfig);
      return newConfig;
    });
  }, [onConfigChange]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(config);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getHelpInfo = (tabId: ConfigTab) => {
    const helpInfo = {
      hierarchy: {
        title: 'Configuration de la structure hiérarchique',
        description: 'Créez et organisez les niveaux de votre organisation (ex: Église → Région → Site)',
        video: '/help/hierarchy.mp4',
        docs: '/docs/hierarchy',
        tips: [
          'Commencez par le niveau le plus haut (ex: Organisation)',
          'Ajoutez les niveaux intermédiaires si nécessaire',
          'Configurez les transitions possibles entre niveaux'
        ]
      },
      terminology: {
        title: 'Personnalisation de la terminologie',
        description: 'Adaptez le vocabulaire de l\'interface à votre contexte (ex: "membre" → "musicien")',
        video: '/help/terminology.mp4',
        docs: '/docs/terminology',
        tips: [
          'Pensez aux termes que votre équipe utilise quotidiennement',
          'N\'oubliez pas les formes singulier/pluriel',
          'Vous pouvez prévisualiser les changements en temps réel'
        ]
      },
      roles: {
        title: 'Gestion des rôles et permissions',
        description: 'Créez des rôles personnalisés avec des permissions granulaires',
        video: '/help/roles.mp4',
        docs: '/docs/roles',
        tips: [
          'Commencez par les rôles principaux (Admin, Responsable, Membre)',
          'Utilisez la matrice pour voir tous les accès d\'un coup d\'œil',
          'Testez les permissions avant de finaliser'
        ]
      },
      workflows: {
        title: 'Configuration des processus métier',
        description: 'Automatisez vos processus avec des workflows personnalisés',
        video: '/help/workflows.mp4',
        docs: '/docs/workflows',
        tips: [
          'Cette fonctionnalité sera disponible prochainement',
          'Elle permettra d\'automatiser les validations',
          'Vous pourrez créer des chaînes d\'approbation'
        ]
      },
      features: {
        title: 'Activation des fonctionnalités',
        description: 'Choisissez les modules actifs selon vos besoins et votre plan',
        video: '/help/features.mp4',
        docs: '/docs/features',
        tips: [
          'Activez seulement ce dont vous avez besoin',
          'Certaines fonctionnalités nécessitent un plan supérieur',
          'Vous pouvez configurer par niveau hiérarchique'
        ]
      },
      branding: {
        title: 'Personnalisation de l\'interface',
        description: 'Adaptez les couleurs et l\'apparence à votre identité visuelle',
        video: '/help/branding.mp4',
        docs: '/docs/branding',
        tips: [
          'Utilisez vos couleurs de marque comme base',
          'Testez sur différents appareils avec l\'aperçu',
          'Pensez au contraste pour l\'accessibilité'
        ]
      }
    };
    return helpInfo[tabId];
  };

  const renderTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const helpInfo = getHelpInfo(activeTab);
    
    const tabHeader = (
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <span className="text-3xl mr-3">{currentTab?.icon}</span>
            {currentTab?.title}
          </h2>
          <p className="text-gray-600 mt-1">{currentTab?.description}</p>
        </div>
        <HelpButton 
          title={helpInfo.title}
          description={helpInfo.description}
          video={helpInfo.video}
          docs={helpInfo.docs}
          tips={helpInfo.tips}
        />
      </div>
    );

    switch (activeTab) {
      case 'hierarchy':
        return (
          <div>
            {tabHeader}
            <HierarchyLevelEditor
              levels={config.hierarchyLevels}
              transitions={config.allowedTransitions}
              onChange={(hierarchyLevels, allowedTransitions) => 
                updateConfig({ hierarchyLevels, allowedTransitions })
              }
            />
          </div>
        );
      
      case 'terminology':
        return (
          <TerminologyEditor
            terminology={config.terminology}
            pluralRules={config.pluralRules}
            organizationType={organizationType}
            hierarchyLevels={config.hierarchyLevels}
            onChange={(terminology, pluralRules) => 
              updateConfig({ terminology, pluralRules })
            }
          />
        );
      
      case 'roles':
        return (
          <RolePermissionEditor
            roles={config.customRoles}
            permissions={config.permissions}
            hierarchy={config.roleHierarchy}
            hierarchyLevels={config.hierarchyLevels}
            onChange={(customRoles, permissions, roleHierarchy) => 
              updateConfig({ customRoles, permissions, roleHierarchy })
            }
          />
        );
      
      case 'workflows':
        return (
          <WorkflowEditor
            workflows={config.workflows}
            approvalChains={config.approvalChains}
            roles={config.customRoles}
            hierarchyLevels={config.hierarchyLevels}
            onChange={(workflows, approvalChains) => 
              updateConfig({ workflows, approvalChains })
            }
          />
        );
      
      case 'features':
        return (
          <FeatureConfigurator
            features={config.features}
            modules={config.modules}
            hierarchyLevels={config.hierarchyLevels}
            onChange={(features, modules) => 
              updateConfig({ features, modules })
            }
          />
        );
      
      case 'branding':
        return (
          <BrandingConfigurator
            branding={config.branding}
            uiElements={config.uiElements}
            terminology={config.terminology}
            hierarchyLevels={config.hierarchyLevels}
            onChange={(branding, uiElements) => 
              updateConfig({ branding, uiElements })
            }
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configuration Organisationnelle
            </h1>
            <p className="text-gray-600 mt-1">
              Personnalisez complètement votre structure et workflows
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isPreviewMode ? '📋 Configuration' : '👁️ Aperçu'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{tab.icon}</span>
                    <div>
                      <div className="font-medium">{tab.title}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {isPreviewMode ? (
            <OrganizationPreview config={config} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Types
type ConfigTab = 'hierarchy' | 'terminology' | 'roles' | 'workflows' | 'features' | 'branding';

interface ConfigTabInfo {
  id: ConfigTab;
  title: string;
  description: string;
  icon: string;
}

// Helper functions
function getDefaultConfig(
  organizationType: OrganizationType, 
  initialConfig?: Partial<OrganizationConfig>
): OrganizationConfig {
  const baseConfig: OrganizationConfig = {
    hierarchyLevels: getDefaultHierarchyLevels(organizationType),
    allowedTransitions: [],
    terminology: {},
    pluralRules: {},
    customRoles: getDefaultRoles(organizationType),
    roleHierarchy: [],
    permissions: getDefaultPermissions(),
    workflows: [],
    approvalChains: [],
    features: [],
    modules: [],
    branding: getDefaultBranding(),
    uiElements: []
  };

  return { ...baseConfig, ...initialConfig };
}

function getDefaultHierarchyLevels(organizationType: OrganizationType): HierarchyLevel[] {
  // Default hierarchy levels based on organization type
  const defaults = {
    CHURCH: [
      {
        id: 'federation',
        name: 'federation',
        displayName: 'Fédération',
        description: 'Niveau fédération/réseau national',
        icon: '🏛️',
        color: '#1f2937',
        canHaveChildren: true,
        canHaveParent: false,
        requiredFields: ['name', 'country'],
        optionalFields: ['website', 'description'],
        inheritanceRules: []
      },
      {
        id: 'region',
        name: 'region',
        displayName: 'Région',
        description: 'Niveau régional',
        icon: '🗺️',
        color: '#374151',
        canHaveChildren: true,
        canHaveParent: true,
        requiredFields: ['name', 'region'],
        optionalFields: ['address'],
        inheritanceRules: []
      },
      {
        id: 'church',
        name: 'church',
        displayName: 'Église',
        description: 'Église locale',
        icon: '⛪',
        color: '#6366f1',
        canHaveChildren: true,
        canHaveParent: true,
        requiredFields: ['name', 'city'],
        optionalFields: ['address', 'phone'],
        inheritanceRules: []
      },
      {
        id: 'department',
        name: 'department',
        displayName: 'Département',
        description: 'Département musical (louange, chorale, etc.)',
        icon: '🎵',
        color: '#8b5cf6',
        canHaveChildren: false,
        canHaveParent: true,
        requiredFields: ['name', 'type'],
        optionalFields: ['description'],
        inheritanceRules: []
      }
    ]
  };

  return defaults[organizationType] || defaults.CHURCH;
}

function getDefaultRoles(organizationType: OrganizationType): CustomRole[] {
  return [
    {
      id: 'super_admin',
      name: 'super_admin',
      displayName: 'Super Administrateur',
      description: 'Accès complet à tout le système',
      icon: '👑',
      color: '#dc2626',
      permissions: ['*'],
      applicableLevels: ['federation', 'region']
    },
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrateur',
      description: 'Gestion complète de l\'organisation',
      icon: '⚙️',
      color: '#f59e0b',
      permissions: ['manage_organization', 'manage_users', 'manage_content'],
      applicableLevels: ['church', 'region']
    }
  ];
}

function getDefaultPermissions(): CustomPermission[] {
  return [
    {
      id: 'manage_organization',
      name: 'manage_organization',
      displayName: 'Gérer l\'organisation',
      description: 'Modifier les paramètres de l\'organisation',
      category: 'Administration',
      scope: 'organization'
    }
  ];
}

function getDefaultBranding(): ExtendedBrandingConfig {
  return {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4'
    },
    customizableElements: [],
    conditionalStyling: []
  };
}

// Preview component
function OrganizationPreview({ config }: { config: OrganizationConfig }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Aperçu de la Configuration
      </h2>
      
      {/* Hierarchy preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Structure Hiérarchique</h3>
        <div className="space-y-2">
          {config.hierarchyLevels.map((level, index) => (
            <div key={level.id} className="flex items-center">
              <div className="w-6 text-center">
                {index > 0 && '└─'}
              </div>
              <span className="text-lg mr-2">{level.icon}</span>
              <span className="font-medium">{level.displayName}</span>
              <span className="text-gray-500 ml-2">({level.description})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminology preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Terminologie</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(config.terminology).slice(0, 6).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="text-gray-500">{key}:</span>
              <span className="ml-2 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Roles preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Rôles Personnalisés</h3>
        <div className="space-y-2">
          {config.customRoles.slice(0, 4).map((role) => (
            <div key={role.id} className="flex items-center">
              <span className="text-lg mr-2">{role.icon}</span>
              <span className="font-medium">{role.displayName}</span>
              <span className="text-gray-500 ml-2">
                ({role.permissions.length} permissions)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Additional types for extended configuration
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

interface InheritanceRule {
  property: string;
  strategy: 'inherit' | 'override' | 'merge';
  conditions?: string[];
}

interface RoleHierarchy {
  parentRole: string;
  childRole: string;
  inheritPermissions: boolean;
}

interface WorkflowTrigger {
  event: string;
  conditions?: string[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action';
  config: Record<string, any>;
}

interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}

interface ApprovalChain {
  id: string;
  name: string;
  steps: ApprovalStep[];
}

interface ApprovalStep {
  role: string;
  level?: string;
  required: boolean;
  order: number;
}

interface FeatureConfiguration {
  id: string;
  name: string;
  enabled: boolean;
  levels: string[];
  conditions?: string[];
}

interface ModuleConfiguration {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

interface UIElementConfiguration {
  element: string;
  visible: boolean;
  customization?: Record<string, any>;
}