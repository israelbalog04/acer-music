'use client';

import React, { useState, useMemo } from 'react';
import { OrganizationType } from '@prisma/client';
import { HierarchyLevel } from './OrganizationConfigurator';

interface TerminologyEditorProps {
  terminology: Record<string, string>;
  pluralRules: Record<string, string>;
  organizationType: OrganizationType;
  hierarchyLevels: HierarchyLevel[];
  onChange: (terminology: Record<string, string>, pluralRules: Record<string, string>) => void;
}

interface TerminologyCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  terms: TerminologyTerm[];
}

interface TerminologyTerm {
  key: string;
  label: string;
  description: string;
  examples: string[];
  context: string[];
  hasPlural: boolean;
}

export function TerminologyEditor({ 
  terminology, 
  pluralRules, 
  organizationType, 
  hierarchyLevels, 
  onChange 
}: TerminologyEditorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('hierarchy');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = useMemo(() => generateCategories(organizationType, hierarchyLevels), [organizationType, hierarchyLevels]);

  const filteredTerms = useMemo(() => {
    if (!searchQuery) return categories;
    
    return categories.map(category => ({
      ...category,
      terms: category.terms.filter(term =>
        term.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.terms.length > 0);
  }, [categories, searchQuery]);

  const updateTerm = (key: string, value: string) => {
    onChange(
      { ...terminology, [key]: value },
      pluralRules
    );
  };

  const updatePlural = (key: string, plural: string) => {
    onChange(
      terminology,
      { ...pluralRules, [key]: plural }
    );
  };

  const resetToDefaults = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const defaults = getDefaultTerminology(organizationType);
    const updatedTerminology = { ...terminology };
    const updatedPlurals = { ...pluralRules };

    category.terms.forEach(term => {
      if (defaults[term.key]) {
        updatedTerminology[term.key] = defaults[term.key];
      }
      if (term.hasPlural && defaults[`${term.key}_plural`]) {
        updatedPlurals[term.key] = defaults[`${term.key}_plural`];
      }
    });

    onChange(updatedTerminology, updatedPlurals);
  };

  const exportTerminology = () => {
    const exportData = {
      terminology,
      pluralRules,
      organizationType,
      hierarchyLevels: hierarchyLevels.map(level => ({
        id: level.id,
        name: level.name,
        displayName: level.displayName
      })),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminologie-${organizationType.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTerminology = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.terminology && importData.pluralRules) {
          onChange(importData.terminology, importData.pluralRules);
        }
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Terminologie Personnalisée</h2>
          <p className="text-gray-600 mt-1">
            Adaptez tous les termes utilisés dans l'interface selon votre contexte
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-lg border font-medium transition-colors ${
              showAdvanced
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {showAdvanced ? '📋 Simple' : '⚙️ Avancé'}
          </button>
          
          <button
            onClick={exportTerminology}
            className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 font-medium"
          >
            📤 Exporter
          </button>
          
          <label className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 font-medium cursor-pointer">
            📥 Importer
            <input
              type="file"
              accept=".json"
              onChange={importTerminology}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un terme..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Catégories</h3>
            
            <div className="space-y-2">
              {filteredTerms.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{category.icon}</span>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className={`text-xs ${
                        activeCategory === category.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {category.terms.length} termes
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terms editor */}
        <div className="lg:col-span-3">
          {(() => {
            const category = filteredTerms.find(c => c.id === activeCategory);
            if (!category) return null;

            return (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => resetToDefaults(category.id)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    🔄 Réinitialiser
                  </button>
                </div>

                <div className="space-y-4">
                  {category.terms.map((term) => (
                    <TermEditor
                      key={term.key}
                      term={term}
                      value={terminology[term.key] || ''}
                      pluralValue={pluralRules[term.key] || ''}
                      showAdvanced={showAdvanced}
                      onUpdate={(value) => updateTerm(term.key, value)}
                      onUpdatePlural={(plural) => updatePlural(term.key, plural)}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu en Contexte</h3>
        <TerminologyPreview terminology={terminology} pluralRules={pluralRules} />
      </div>
    </div>
  );
}

interface TermEditorProps {
  term: TerminologyTerm;
  value: string;
  pluralValue: string;
  showAdvanced: boolean;
  onUpdate: (value: string) => void;
  onUpdatePlural: (plural: string) => void;
}

function TermEditor({ 
  term, 
  value, 
  pluralValue, 
  showAdvanced, 
  onUpdate, 
  onUpdatePlural 
}: TermEditorProps) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">{term.label}</h4>
            {showAdvanced && (
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                {term.key}
              </code>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{term.description}</p>
          
          {showAdvanced && term.context.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500">Utilisé dans:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {term.context.map((ctx, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {ctx}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {term.examples.length > 0 && (
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Singulier
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder={term.examples[0] || term.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        {term.hasPlural && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pluriel
            </label>
            <input
              type="text"
              value={pluralValue}
              onChange={(e) => onUpdatePlural(e.target.value)}
              placeholder={term.examples[1] || `${term.label}s`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
      </div>

      {showExamples && (
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Exemples:</div>
          <div className="space-y-1">
            {term.examples.map((example, index) => (
              <div key={index} className="text-sm text-gray-600">• {example}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TerminologyPreview({ 
  terminology, 
  pluralRules 
}: { 
  terminology: Record<string, string>; 
  pluralRules: Record<string, string>; 
}) {
  const sampleSentences = [
    `Gérer les ${pluralRules.member || 'membres'} de votre ${terminology.organization || 'organisation'}`,
    `Planifier un ${terminology.event || 'événement'} pour votre ${terminology.department || 'département'}`,
    `Le ${terminology.director || 'directeur'} peut approuver les ${pluralRules.recording || 'enregistrements'}`,
    `Ajouter une ${terminology.song || 'chanson'} au ${terminology.repertoire || 'répertoire'}`,
    `Inviter des ${pluralRules.user || 'utilisateurs'} à rejoindre la ${terminology.platform || 'plateforme'}`
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">Exemples d'utilisation:</div>
      {sampleSentences.map((sentence, index) => (
        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-primary">
          "{sentence}"
        </div>
      ))}
    </div>
  );
}

// Helper functions
function generateCategories(organizationType: OrganizationType, hierarchyLevels: HierarchyLevel[]): TerminologyCategory[] {
  const baseCategories: TerminologyCategory[] = [
    {
      id: 'hierarchy',
      name: 'Hiérarchie',
      description: 'Niveaux organisationnels et structure',
      icon: '🏗️',
      terms: hierarchyLevels.map(level => ({
        key: level.name,
        label: level.displayName,
        description: `Nom du niveau "${level.displayName}"`,
        examples: [level.displayName, `${level.displayName}s`],
        context: ['Navigation', 'Formulaires', 'Tableaux de bord'],
        hasPlural: true
      }))
    },
    {
      id: 'roles',
      name: 'Rôles & Personnes',
      description: 'Rôles, utilisateurs et responsabilités',
      icon: '👥',
      terms: [
        {
          key: 'user',
          label: 'Utilisateur',
          description: 'Personne utilisant la plateforme',
          examples: ['Utilisateur', 'Utilisateurs'],
          context: ['Gestion des comptes', 'Invitations'],
          hasPlural: true
        },
        {
          key: 'member',
          label: 'Membre',
          description: 'Membre actif de l\'organisation',
          examples: ['Musicien', 'Musiciens', 'Étudiant', 'Étudiants'],
          context: ['Listes de membres', 'Invitations'],
          hasPlural: true
        },
        {
          key: 'director',
          label: 'Directeur',
          description: 'Responsable principal',
          examples: ['Chef de Louange', 'Professeur', 'Chef d\'orchestre'],
          context: ['Assignation de rôles', 'Approbations'],
          hasPlural: true
        }
      ]
    },
    {
      id: 'content',
      name: 'Contenu Musical',
      description: 'Chansons, partitions et enregistrements',
      icon: '🎵',
      terms: [
        {
          key: 'song',
          label: 'Chanson',
          description: 'Morceau musical dans le répertoire',
          examples: ['Chanson', 'Chansons', 'Cantique', 'Cantiques'],
          context: ['Répertoire', 'Planification événements'],
          hasPlural: true
        },
        {
          key: 'repertoire',
          label: 'Répertoire',
          description: 'Collection de morceaux musicaux',
          examples: ['Répertoire', 'Songbook', 'Catalogue'],
          context: ['Navigation', 'Recherche'],
          hasPlural: false
        },
        {
          key: 'recording',
          label: 'Enregistrement',
          description: 'Fichier audio enregistré',
          examples: ['Enregistrement', 'Enregistrements', 'Démo', 'Démos'],
          context: ['Upload de fichiers', 'Lecture'],
          hasPlural: true
        },
        {
          key: 'sequence',
          label: 'Partition',
          description: 'Notation musicale',
          examples: ['Partition', 'Partitions', 'Tablature', 'Tablatures'],
          context: ['Documents', 'Téléchargements'],
          hasPlural: true
        }
      ]
    },
    {
      id: 'events',
      name: 'Événements',
      description: 'Activités et planification',
      icon: '📅',
      terms: [
        {
          key: 'event',
          label: 'Événement',
          description: 'Activité planifiée',
          examples: ['Service', 'Répétition', 'Concert', 'Cours'],
          context: ['Calendrier', 'Planification'],
          hasPlural: true
        },
        {
          key: 'rehearsal',
          label: 'Répétition',
          description: 'Session de pratique',
          examples: ['Répétition', 'Répétitions', 'Practice', 'Practices'],
          context: ['Planification', 'Notifications'],
          hasPlural: true
        },
        {
          key: 'performance',
          label: 'Représentation',
          description: 'Performance publique',
          examples: ['Service', 'Concert', 'Récital', 'Spectacle'],
          context: ['Événements publics', 'Calendrier'],
          hasPlural: true
        }
      ]
    },
    {
      id: 'system',
      name: 'Système',
      description: 'Termes techniques et interface',
      icon: '⚙️',
      terms: [
        {
          key: 'platform',
          label: 'Plateforme',
          description: 'Le système/application',
          examples: ['Plateforme', 'Application', 'Système'],
          context: ['Messages système', 'Documentation'],
          hasPlural: false
        },
        {
          key: 'dashboard',
          label: 'Tableau de bord',
          description: 'Page d\'accueil principale',
          examples: ['Tableau de bord', 'Dashboard', 'Accueil'],
          context: ['Navigation', 'Menu'],
          hasPlural: false
        },
        {
          key: 'notification',
          label: 'Notification',
          description: 'Message d\'alerte ou d\'information',
          examples: ['Notification', 'Notifications', 'Alerte', 'Alertes'],
          context: ['Messages système', 'Paramètres'],
          hasPlural: true
        }
      ]
    }
  ];

  return baseCategories;
}

function getDefaultTerminology(organizationType: OrganizationType): Record<string, string> {
  const defaults = {
    CHURCH: {
      organization: 'Église',
      member: 'Musicien',
      member_plural: 'Musiciens',
      director: 'Chef de Louange',
      event: 'Service',
      event_plural: 'Services',
      rehearsal: 'Répétition',
      performance: 'Service',
      song: 'Cantique',
      song_plural: 'Cantiques',
      repertoire: 'Répertoire'
    },
    CONSERVATORY: {
      organization: 'Conservatoire',
      member: 'Étudiant',
      member_plural: 'Étudiants',
      director: 'Professeur',
      event: 'Cours',
      event_plural: 'Cours',
      rehearsal: 'Répétition',
      performance: 'Récital',
      song: 'Morceau',
      song_plural: 'Morceaux',
      repertoire: 'Catalogue'
    }
  };

  return (defaults as any)[organizationType] || defaults.CHURCH;
}