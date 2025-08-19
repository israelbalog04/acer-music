'use client';

import React, { useState } from 'react';
import { 
  QuestionMarkCircleIcon, 
  XMarkIcon, 
  PlayIcon,
  BookOpenIcon,
  ChatBubbleLeftEllipsisIcon 
} from '@heroicons/react/24/outline';

interface HelpButtonProps {
  title: string;
  description?: string;
  video?: string;
  docs?: string;
  tips?: string[];
}

export function HelpButton({ title, description, video, docs, tips }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bouton d'aide */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-primary/5 transition-colors"
        title="Aide"
      >
        <QuestionMarkCircleIcon className="w-5 h-5" />
      </button>

      {/* Popup d'aide */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Contenu de l'aide */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 pr-2">{title}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              {description && (
                <p className="text-sm text-gray-600 mb-4">{description}</p>
              )}

              {/* Actions d'aide */}
              <div className="space-y-2">
                {video && (
                  <button
                    onClick={() => window.open(video, '_blank')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <PlayIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Voir la vidéo</div>
                      <div className="text-xs text-blue-600">Tutoriel vidéo étape par étape</div>
                    </div>
                  </button>
                )}

                {docs && (
                  <button
                    onClick={() => window.open(docs, '_blank')}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <BookOpenIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-900">Documentation</div>
                      <div className="text-xs text-green-600">Guide détaillé et exemples</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    // Ici on pourrait ouvrir un chat support
                    alert('Fonctionnalité de support à venir !');
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-purple-900">Contacter le support</div>
                    <div className="text-xs text-purple-600">Aide personnalisée par notre équipe</div>
                  </div>
                </button>
              </div>

              {/* Conseils rapides */}
              {tips && tips.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">💡 Conseils rapides</h4>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="text-primary mr-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}