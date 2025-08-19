'use client';

import React, { useState } from 'react';
import { OrganizationType } from '@prisma/client';
import { ORGANIZATION_TEMPLATES } from '@/types/saas';

interface OrganizationTypeSelectorProps {
  selectedType?: OrganizationType;
  onSelect: (type: OrganizationType) => void;
  className?: string;
}

export function OrganizationTypeSelector({ 
  selectedType, 
  onSelect, 
  className = '' 
}: OrganizationTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<OrganizationType | null>(null);

  const organizationTypes = Object.values(ORGANIZATION_TEMPLATES).filter(
    template => template.type && template.name
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {organizationTypes.map((template) => {
        const isSelected = selectedType === template.type;
        const isHovered = hoveredType === template.type;
        
        return (
          <div
            key={template.type}
            className={`
              relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }
              ${isHovered ? 'transform scale-105' : ''}
            `}
            onClick={() => onSelect(template.type)}
            onMouseEnter={() => setHoveredType(template.type)}
            onMouseLeave={() => setHoveredType(null)}
          >
            {/* Icon */}
            <div className="text-4xl mb-3 text-center">
              {template.icon}
            </div>
            
            {/* Name */}
            <h3 className="text-lg font-semibold text-center mb-2">
              {template.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 text-center mb-4">
              {template.description}
            </p>
            
            {/* Features preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Fonctionnalités incluses
              </h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(template.features)
                  .filter(([_, enabled]) => enabled)
                  .slice(0, 4)
                  .map(([feature, _]) => (
                    <span 
                      key={feature}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {getFeatureDisplayName(feature)}
                    </span>
                  ))
                }
                {Object.values(template.features).filter(Boolean).length > 4 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{Object.values(template.features).filter(Boolean).length - 4} autres
                  </span>
                )}
              </div>
            </div>
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getFeatureDisplayName(feature: string): string {
  const displayNames: Record<string, string> = {
    repertoire: 'Répertoire',
    scheduling: 'Planning',
    members: 'Membres',
    recordings: 'Enregistrements',
    sequences: 'Partitions',
    multimedia: 'Multimédia',
    analytics: 'Analyses',
    messaging: 'Messages',
    worship: 'Louange',
    education: 'Éducation',
    commercial: 'Commercial',
    events: 'Événements',
    streaming: 'Streaming',
    booking: 'Réservations',
    merchandise: 'Merchandising',
    donations: 'Dons'
  };
  
  return displayNames[feature] || feature;
}