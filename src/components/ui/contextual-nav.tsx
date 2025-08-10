'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';
import {
  ClockIcon,
  CalendarIcon,
  MusicalNoteIcon,
  CloudArrowUpIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ContextualAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactElement;
  priority: 'high' | 'medium' | 'low';
  badge?: string;
}

export function ContextualNav() {
  const pathname = usePathname();
  const { userRole } = useUserData();
  const [suggestions, setSuggestions] = useState<ContextualAction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateContextualSuggestions = useCallback(() => {
    const actions: ContextualAction[] = [];

    // Suggestions basées sur la page actuelle
    if (pathname.includes('/dashboard') || pathname === '/app') {
      actions.push(
        {
          title: 'Nouveau Upload',
          description: 'Enregistrer une nouvelle version',
          href: '/app/music/upload',
          icon: <CloudArrowUpIcon className="h-4 w-4" />,
          priority: 'high'
        },
        {
          title: 'Voir le Planning',
          description: 'Consulter les prochains services',
          href: '/app/team/planning',
          icon: <CalendarIcon className="h-4 w-4" />,
          priority: 'medium'
        }
      );
    }

    if (pathname.includes('/music')) {
      actions.push(
        {
          title: 'Ajouter un Chant',
          description: 'Créer une nouvelle entrée',
          href: '/app/music/songs/add',
          icon: <MusicalNoteIcon className="h-4 w-4" />,
          priority: 'high'
        },
        {
          title: 'Mes Enregistrements',
          description: 'Voir tous mes uploads',
          href: '/app/music/my-recordings',
          icon: <CloudArrowUpIcon className="h-4 w-4" />,
          priority: 'medium'
        }
      );
    }

    if (pathname.includes('/team')) {
      actions.push(
        {
          title: 'Ma Disponibilité',
          description: 'Gérer mes créneaux',
          href: '/app/team/my-availability',
          icon: <ClockIcon className="h-4 w-4" />,
          priority: 'high'
        },
        {
          title: 'Membres de l\'Équipe',
          description: 'Voir tous les musiciens',
          href: '/app/team/members',
          icon: <UserIcon className="h-4 w-4" />,
          priority: 'medium'
        }
      );
    }

    if (pathname.includes('/notifications')) {
      actions.push(
        {
          title: 'Paramètres',
          description: 'Configurer les notifications',
          href: '/app/account/settings',
          icon: <Cog6ToothIcon className="h-4 w-4" />,
          priority: 'medium'
        }
      );
    }

    // Suggestions basées sur le rôle
    if (userRole === 'MULTIMEDIA') {
      actions.push(
        {
          title: 'Upload Photos',
          description: 'Déposer de nouvelles photos',
          href: '/app/multimedia/upload',
          icon: <CloudArrowUpIcon className="h-4 w-4" />,
          priority: 'high',
          badge: 'Nouveau'
        }
      );
    }

    if (userRole === 'ADMIN') {
      actions.push(
        {
          title: 'Gestion Utilisateurs',
          description: 'Administrer les comptes',
          href: '/app/admin/users',
          icon: <UserIcon className="h-4 w-4" />,
          priority: 'high'
        },
        {
          title: 'Analytics',
          description: 'Voir les statistiques',
          href: '/app/admin/analytics',
          icon: <SparklesIcon className="h-4 w-4" />,
          priority: 'medium'
        }
      );
    }

    // Suggestions générales
    actions.push(
      {
        title: 'Notifications',
        description: 'Voir les dernières notifications',
        href: '/app/notifications',
        icon: <BellIcon className="h-4 w-4" />,
        priority: 'low'
      },
      {
        title: 'Mon Profil',
        description: 'Modifier mes informations',
        href: '/app/account/profile',
        icon: <UserIcon className="h-4 w-4" />,
        priority: 'low'
      }
    );

    // Trier par priorité et limiter à 4 suggestions
    const sortedActions = actions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 4);

    setSuggestions(sortedActions);
  }, [pathname, userRole]);

  useEffect(() => {
    generateContextualSuggestions();
  }, [pathname, userRole, generateContextualSuggestions]);

  if (suggestions.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-medium text-neutral-700">Suggestions</span>
        </div>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
        >
          {showSuggestions ? 'Masquer' : 'Voir tout'}
        </button>
      </div>

      <div className={`mt-3 transition-all duration-300 ${showSuggestions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestions.map((action, index) => (
            <Link
              key={action.title}
              href={action.href}
              className="group block"
            >
              <div 
                className="p-3 bg-white border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group-hover:bg-gradient-to-br group-hover:from-primary-50 group-hover:to-white"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-neutral-900 group-hover:text-primary-700 transition-colors">
                        {action.title}
                      </h4>
                      {action.badge && (
                        <span className="px-1.5 py-0.5 text-xs bg-success-100 text-success-800 rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}