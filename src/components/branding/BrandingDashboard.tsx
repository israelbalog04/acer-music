'use client';

import { useState } from 'react';
import { useBranding } from '@/hooks/useBranding';
import { BrandingTab } from '@/types/branding';
import { ColorPaletteEditor } from './ColorPicker';
import { BrandingAssetsEditor } from './AssetUploader';
import { 
  PaintBrushIcon,
  PhotoIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  CogIcon,
  CodeBracketIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface BrandingDashboardProps {
  organizationId: string;
}

export function BrandingDashboard({ organizationId }: BrandingDashboardProps) {
  const [activeTab, setActiveTab] = useState<BrandingTab>('colors');
  
  const {
    config,
    isLoading,
    isSaving,
    isDirty,
    isPreviewMode,
    errors,
    warnings,
    updateColors,
    updateTypography,
    updateLayout,
    updateAssets,
    updateFeatures,
    uploadAsset,
    removeAsset,
    saveConfig,
    resetConfig,
    setPreviewMode,
    exportConfig,
    importConfig
  } = useBranding({ 
    organizationId,
    enablePreview: true,
    autoSave: false
  });

  const tabs = [
    { id: 'colors' as BrandingTab, label: 'Couleurs', icon: PaintBrushIcon },
    { id: 'typography' as BrandingTab, label: 'Typographie', icon: DocumentTextIcon },
    { id: 'assets' as BrandingTab, label: 'Logo & Assets', icon: PhotoIcon },
    { id: 'layout' as BrandingTab, label: 'Layout', icon: Squares2X2Icon },
    { id: 'features' as BrandingTab, label: 'Fonctionnalités', icon: CogIcon },
    { id: 'advanced' as BrandingTab, label: 'CSS Avancé', icon: CodeBracketIcon },
    { id: 'presets' as BrandingTab, label: 'Templates', icon: SparklesIcon }
  ];

  const handleSave = async () => {
    const success = await saveConfig();
    if (success) {
      // Afficher un toast de succès
      console.log('Configuration sauvegardée avec succès!');
    } else {
      // Afficher un toast d'erreur
      console.error('Erreur lors de la sauvegarde');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const success = importConfig(content);
          if (!success) {
            alert('Erreur lors de l\'import du fichier');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const configJson = exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branding-config-${organizationId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Chargement de la configuration...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Personnalisation</h2>
          <p className="text-sm text-gray-600 mt-1">Configurez l'apparence de votre plateforme</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        
        {/* Actions Footer */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div className="space-y-2">
            <button
              onClick={() => setPreviewMode(!isPreviewMode)}
              className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isPreviewMode
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreviewMode ? <EyeSlashIcon className="h-4 w-4 mr-2" /> : <EyeIcon className="h-4 w-4 mr-2" />}
              {isPreviewMode ? 'Désactiver Preview' : 'Activer Preview'}
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleImport}
                className="flex-1 flex items-center justify-center px-2 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center px-2 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              {errors.length > 0 && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.length} erreur(s) détectée(s)
                </div>
              )}
              {warnings.length > 0 && (
                <div className="mt-1 text-sm text-yellow-600">
                  {warnings.length} avertissement(s)
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {isDirty && (
                <span className="text-sm text-orange-600 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Modifications non sauvegardées
                </span>
              )}
              
              <button
                onClick={resetConfig}
                disabled={!isDirty}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1 inline" />
                Reset
              </button>
              
              <button
                onClick={handleSave}
                disabled={!isDirty || errors.length > 0 || isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'colors' && (
            <div className="max-w-2xl">
              <ColorPaletteEditor
                colors={config.theme.colors}
                onChange={updateColors}
                disabled={isSaving}
              />
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Police des titres
                </label>
                <select
                  value={config.theme.typography.headingFont}
                  onChange={(e) => updateTypography({ headingFont: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Police du corps de texte
                </label>
                <select
                  value={config.theme.typography.bodyFont}
                  onChange={(e) => updateTypography({ bodyFont: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de police
                </label>
                <div className="flex space-x-4">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="radio"
                        name="fontSize"
                        value={size}
                        checked={config.theme.typography.fontSize === size}
                        onChange={(e) => updateTypography({ fontSize: e.target.value as any })}
                        className="mr-2"
                      />
                      <span className="capitalize">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position de la sidebar
                </label>
                <div className="flex space-x-4">
                  {(['left', 'right', 'top'] as const).map((position) => (
                    <label key={position} className="flex items-center">
                      <input
                        type="radio"
                        name="sidebarPosition"
                        value={position}
                        checked={config.layout.sidebarPosition === position}
                        onChange={(e) => updateLayout({ sidebarPosition: e.target.value as any })}
                        className="mr-2"
                      />
                      <span className="capitalize">{position}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style des cartes
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(['rounded', 'sharp', 'soft', 'elevated'] as const).map((style) => (
                    <label key={style} className="flex items-center">
                      <input
                        type="radio"
                        name="cardStyle"
                        value={style}
                        checked={config.layout.cardStyle === style}
                        onChange={(e) => updateLayout({ cardStyle: e.target.value as any })}
                        className="mr-2"
                      />
                      <span className="capitalize">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Densité de l'interface
                </label>
                <div className="flex space-x-4">
                  {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                    <label key={density} className="flex items-center">
                      <input
                        type="radio"
                        name="density"
                        value={density}
                        checked={config.theme.spacing.density === density}
                        onChange={(e) => updateLayout({ 
                          // Cette logique devrait être dans updateSpacing mais on simplifie
                        })}
                        className="mr-2"
                      />
                      <span className="capitalize">{density}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="max-w-4xl">
              <BrandingAssetsEditor
                assets={config.assets}
                onAssetUpdate={(key, url) => {
                  updateAssets({ [key]: url });
                }}
                onAssetRemove={async (key) => {
                  try {
                    await removeAsset(key);
                  } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                  }
                }}
                onUpload={uploadAsset}
                disabled={isSaving}
              />
            </div>
          )}

          {/* Autres onglets... */}
          {activeTab !== 'colors' && activeTab !== 'typography' && activeTab !== 'layout' && activeTab !== 'assets' && (
            <div className="text-center py-12">
              <p className="text-gray-600">Fonctionnalité en cours de développement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}