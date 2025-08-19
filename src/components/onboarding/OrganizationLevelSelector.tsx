'use client';

import React, { useState } from 'react';
import { OrganizationLevel } from '@prisma/client';

interface OrganizationLevelSelectorProps {
  selectedLevel?: OrganizationLevel;
  onSelect: (level: OrganizationLevel) => void;
  className?: string;
}

export function OrganizationLevelSelector({ 
  selectedLevel, 
  onSelect, 
  className = '' 
}: OrganizationLevelSelectorProps) {
  const [hoveredLevel, setHoveredLevel] = useState<OrganizationLevel | null>(null);

  const levelOptions = [
    {
      level: 'INDEPENDENT' as OrganizationLevel,
      title: 'Organisation indépendante',
      description: 'Créez une organisation complètement autonome',
      icon: '🏛️',
      examples: 'Parfait pour une organisation unique ou qui débute',
      benefits: [
        'Gestion simplifiée',
        'Contrôle total',
        'Facturation directe',
        'Pas de dépendance'
      ],
      color: 'blue'
    },
    {
      level: 'PARENT' as OrganizationLevel,
      title: 'Organisation mère',
      description: 'Créez une organisation avec plusieurs sites/démembrements',
      icon: '🏢',
      examples: 'Ex: ACER France (avec sites Paris, Lyon, Marseille...)',
      benefits: [
        'Gestion centralisée',
        'Facturation groupée',
        'Branding unifié',
        'Partage de ressources'
      ],
      color: 'green'
    },
    {
      level: 'CHILD' as OrganizationLevel,
      title: 'Site/Démembrement',
      description: 'Rejoignez une organisation existante comme nouveau site',
      icon: '🏪',
      examples: 'Ex: ACER Bordeaux (rattaché à ACER France)',
      benefits: [
        'Coût réduit',
        'Support centralisé',
        'Ressources partagées',
        'Autonomie locale'
      ],
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean, isHovered: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50' : 'border-blue-200 hover:border-blue-400',
        icon: 'text-blue-500',
        accent: 'bg-blue-500'
      },
      green: {
        border: isSelected ? 'border-green-500 ring-2 ring-green-500/20 bg-green-50' : 'border-green-200 hover:border-green-400',
        icon: 'text-green-500',
        accent: 'bg-green-500'
      },
      purple: {
        border: isSelected ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50' : 'border-purple-200 hover:border-purple-400',
        icon: 'text-purple-500',
        accent: 'bg-purple-500'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Quel type d'organisation souhaitez-vous créer ?
        </h3>
        <p className="text-gray-600">
          Choisissez la structure qui convient le mieux à votre situation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {levelOptions.map((option) => {
          const isSelected = selectedLevel === option.level;
          const isHovered = hoveredLevel === option.level;
          const colorClasses = getColorClasses(option.color, isSelected, isHovered);
          
          return (
            <div
              key={option.level}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${colorClasses.border}
                ${isHovered ? 'transform scale-105 shadow-lg' : 'shadow-sm'}
              `}
              onClick={() => onSelect(option.level)}
              onMouseEnter={() => setHoveredLevel(option.level)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              {/* Icon */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{option.icon}</div>
                <div className={`w-12 h-1 mx-auto rounded-full ${colorClasses.accent}`} />
              </div>
              
              {/* Content */}
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {option.description}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {option.examples}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Avantages
                </h5>
                <ul className="space-y-1">
                  {option.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 ${colorClasses.accent} rounded-full flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-gray-400 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Besoin d'aide pour choisir ?
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Organisation indépendante :</strong> Si vous avez un seul site ou préférez une gestion autonome.
              </p>
              <p>
                <strong>Organisation mère :</strong> Si vous prévoyez d'avoir plusieurs sites/démembrements (églises multiples, conservatoire avec antennes, etc.).
              </p>
              <p>
                <strong>Site/Démembrement :</strong> Si votre organisation fait partie d'un réseau existant et que l'organisation mère est déjà créée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}