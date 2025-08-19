'use client';

import React, { useState } from 'react';
import { HierarchyLevel, HierarchyTransition } from './OrganizationConfigurator';

interface HierarchyLevelEditorProps {
  levels: HierarchyLevel[];
  transitions: HierarchyTransition[];
  onChange: (levels: HierarchyLevel[], transitions: HierarchyTransition[]) => void;
}

export function HierarchyLevelEditor({ levels, transitions, onChange }: HierarchyLevelEditorProps) {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [draggedLevel, setDraggedLevel] = useState<string | null>(null);

  const addNewLevel = () => {
    const newLevel: HierarchyLevel = {
      id: `level_${Date.now()}`,
      name: '',
      displayName: 'Nouveau Niveau',
      description: '',
      icon: '📁',
      color: '#6366f1',
      canHaveChildren: true,
      canHaveParent: true,
      requiredFields: ['name'],
      optionalFields: [],
      inheritanceRules: []
    };

    onChange([...levels, newLevel], transitions);
    setActiveLevel(newLevel.id);
    setIsAddingLevel(false);
  };

  const updateLevel = (levelId: string, updates: Partial<HierarchyLevel>) => {
    const updatedLevels = levels.map(level =>
      level.id === levelId ? { ...level, ...updates } : level
    );
    onChange(updatedLevels, transitions);
  };

  const deleteLevel = (levelId: string) => {
    const updatedLevels = levels.filter(level => level.id !== levelId);
    const updatedTransitions = transitions.filter(
      transition => transition.from !== levelId && transition.to !== levelId
    );
    onChange(updatedLevels, updatedTransitions);
    setActiveLevel(null);
  };

  const reorderLevels = (startIndex: number, endIndex: number) => {
    const reorderedLevels = [...levels];
    const [removed] = reorderedLevels.splice(startIndex, 1);
    reorderedLevels.splice(endIndex, 0, removed);
    onChange(reorderedLevels, transitions);
  };

  const addTransition = (fromId: string, toId: string) => {
    const newTransition: HierarchyTransition = {
      from: fromId,
      to: toId,
      allowedBy: [],
      requiresApproval: false
    };

    onChange(levels, [...transitions, newTransition]);
  };

  const iconOptions = ['📁', '🏛️', '🗺️', '⛪', '🏢', '🏪', '🎵', '👥', '🎯', '⚙️', '📊', '🎨'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Structure Hiérarchique</h2>
          <p className="text-gray-600 mt-1">
            Définissez les niveaux organisationnels et leurs relations
          </p>
        </div>
        
        <button
          onClick={() => setIsAddingLevel(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
        >
          + Ajouter un niveau
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levels list */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Niveaux Hiérarchiques</h3>
            
            <div className="space-y-2">
              {levels.map((level, index) => (
                <div
                  key={level.id}
                  draggable
                  onDragStart={() => setDraggedLevel(level.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedLevel) {
                      const draggedIndex = levels.findIndex(l => l.id === draggedLevel);
                      reorderLevels(draggedIndex, index);
                      setDraggedLevel(null);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    activeLevel === level.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setActiveLevel(level.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{level.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {level.displayName || 'Sans nom'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Niveau {index + 1}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLevel(level.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 002 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v1a1 1 0 100 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a1 1 0 000-2V5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {isAddingLevel && (
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <button
                      onClick={addNewLevel}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      ✓ Créer le niveau
                    </button>
                    <button
                      onClick={() => setIsAddingLevel(false)}
                      className="ml-3 text-gray-500 hover:text-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Level editor */}
        <div className="lg:col-span-2">
          {activeLevel ? (
            <LevelEditor
              level={levels.find(l => l.id === activeLevel)!}
              allLevels={levels}
              transitions={transitions}
              onUpdate={(updates) => updateLevel(activeLevel, updates)}
              onAddTransition={addTransition}
              iconOptions={iconOptions}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez un niveau à configurer
              </h3>
              <p className="text-gray-600">
                Cliquez sur un niveau dans la liste pour modifier ses paramètres
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hierarchy visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4">Aperçu de la Hiérarchie</h3>
        <HierarchyVisualization levels={levels} transitions={transitions} />
      </div>
    </div>
  );
}

interface LevelEditorProps {
  level: HierarchyLevel;
  allLevels: HierarchyLevel[];
  transitions: HierarchyTransition[];
  onUpdate: (updates: Partial<HierarchyLevel>) => void;
  onAddTransition: (fromId: string, toId: string) => void;
  iconOptions: string[];
}

function LevelEditor({ 
  level, 
  allLevels, 
  transitions, 
  onUpdate, 
  onAddTransition, 
  iconOptions 
}: LevelEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const availableFields = [
    'name', 'description', 'address', 'city', 'region', 'country',
    'phone', 'email', 'website', 'logo', 'coordinates'
  ];

  const addRequiredField = (field: string) => {
    if (!level.requiredFields.includes(field)) {
      onUpdate({
        requiredFields: [...level.requiredFields, field],
        optionalFields: level.optionalFields.filter(f => f !== field)
      });
    }
  };

  const addOptionalField = (field: string) => {
    if (!level.optionalFields.includes(field)) {
      onUpdate({
        optionalFields: [...level.optionalFields, field],
        requiredFields: level.requiredFields.filter(f => f !== field)
      });
    }
  };

  const removeField = (field: string, type: 'required' | 'optional') => {
    if (type === 'required') {
      onUpdate({
        requiredFields: level.requiredFields.filter(f => f !== field)
      });
    } else {
      onUpdate({
        optionalFields: level.optionalFields.filter(f => f !== field)
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Basic information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de Base</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom technique
            </label>
            <input
              type="text"
              value={level.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="ex: church, region, department"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={level.displayName}
              onChange={(e) => onUpdate({ displayName: e.target.value })}
              placeholder="ex: Église, Région, Département"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={level.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Description de ce niveau hiérarchique..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Visual customization */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Apparence</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icône
            </label>
            <div className="relative">
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center"
              >
                <span className="text-lg mr-2">{level.icon}</span>
                <span>Choisir une icône</span>
              </button>
              
              {showIconPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => {
                        onUpdate({ icon });
                        setShowIconPicker(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded text-lg"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={level.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={level.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy rules */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Règles Hiérarchiques</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={level.canHaveChildren}
                onChange={(e) => onUpdate({ canHaveChildren: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Peut avoir des enfants</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={level.canHaveParent}
                onChange={(e) => onUpdate({ canHaveParent: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Peut avoir un parent</span>
            </label>
          </div>
          
          {level.canHaveChildren && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum d'enfants (optionnel)
              </label>
              <input
                type="number"
                value={level.maxChildren || ''}
                onChange={(e) => onUpdate({ maxChildren: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Illimité"
                min="1"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Required fields */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Champs Requis</h3>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {level.requiredFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {field}
                <button
                  onClick={() => removeField(field, 'required')}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          <select
            onChange={(e) => {
              if (e.target.value) {
                addRequiredField(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">+ Ajouter un champ requis</option>
            {availableFields
              .filter(field => !level.requiredFields.includes(field) && !level.optionalFields.includes(field))
              .map((field) => (
                <option key={field} value={field}>{field}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Optional fields */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Champs Optionnels</h3>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {level.optionalFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {field}
                <button
                  onClick={() => removeField(field, 'optional')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          <select
            onChange={(e) => {
              if (e.target.value) {
                addOptionalField(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">+ Ajouter un champ optionnel</option>
            {availableFields
              .filter(field => !level.requiredFields.includes(field) && !level.optionalFields.includes(field))
              .map((field) => (
                <option key={field} value={field}>{field}</option>
              ))
            }
          </select>
        </div>
      </div>
    </div>
  );
}

function HierarchyVisualization({ 
  levels, 
  transitions 
}: { 
  levels: HierarchyLevel[]; 
  transitions: HierarchyTransition[]; 
}) {
  return (
    <div className="flex flex-col space-y-4">
      {levels.map((level, index) => (
        <div key={level.id} className="flex items-center">
          <div className="w-8 text-center text-gray-400">
            {index > 0 && '↓'}
          </div>
          <div 
            className="flex items-center px-4 py-2 rounded-lg border-2"
            style={{ borderColor: level.color }}
          >
            <span className="text-lg mr-3">{level.icon}</span>
            <div>
              <div className="font-medium">{level.displayName}</div>
              <div className="text-sm text-gray-500">
                {level.canHaveChildren ? 'Peut avoir des enfants' : 'Feuille'} • 
                {level.canHaveParent ? ' Peut avoir un parent' : ' Racine'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}