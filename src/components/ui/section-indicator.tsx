'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  MusicalNoteIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BellIcon,
  HomeIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface SectionInfo {
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
}

export function SectionIndicator() {
  const pathname = usePathname();
  const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);

  useEffect(() => {
    const info = getSectionInfo(pathname);
    setSectionInfo(info);
  }, [pathname]);

  const getSectionInfo = (path: string): SectionInfo | null => {
    // Dashboard
    if (path === '/app') {
      return {
        title: 'Tableau de bord',
        description: 'Vue d\'ensemble de votre activité musicale',
        icon: <HomeIcon className="h-5 w-5" />,
        color: 'text-primary-600'
      };
    }

    // Music section
    if (path.includes('/music')) {
      if (path.includes('/upload')) {
        return {
          title: 'Upload Musical',
          description: 'Enregistrer et partager vos performances',
          icon: <CloudArrowUpIcon className="h-5 w-5" />,
          color: 'text-success-600'
        };
      }
      if (path.includes('/repertoire')) {
        return {
          title: 'Répertoire',
          description: 'Explorer la collection de chants',
          icon: <MusicalNoteIcon className="h-5 w-5" />,
          color: 'text-purple-600'
        };
      }
      if (path.includes('/songs')) {
        return {
          title: 'Gestion des Chants',
          description: 'Ajouter et modifier les chants',
          icon: <MusicalNoteIcon className="h-5 w-5" />,
          color: 'text-purple-600'
        };
      }
      if (path.includes('/recordings')) {
        return {
          title: 'Enregistrements',
          description: 'Vos performances enregistrées',
          icon: <CloudArrowUpIcon className="h-5 w-5" />,
          color: 'text-success-600'
        };
      }
      if (path.includes('/sequences')) {
        return {
          title: 'Séquences',
          description: 'Gérer les partitions et arrangements',
          icon: <MusicalNoteIcon className="h-5 w-5" />,
          color: 'text-purple-600'
        };
      }
      if (path.includes('/photos')) {
        return {
          title: 'Photos',
          description: 'Galerie des photos d\'événements',
          icon: <PhotoIcon className="h-5 w-5" />,
          color: 'text-warning-600'
        };
      }
      return {
        title: 'Musique',
        description: 'Gestion du répertoire et des enregistrements',
        icon: <MusicalNoteIcon className="h-5 w-5" />,
        color: 'text-purple-600'
      };
    }

    // Team section
    if (path.includes('/team')) {
      if (path.includes('/planning')) {
        return {
          title: 'Planning',
          description: 'Organisation des services et événements',
          icon: <CalendarIcon className="h-5 w-5" />,
          color: 'text-primary-600'
        };
      }
      if (path.includes('/members')) {
        return {
          title: 'Membres de l\'Équipe',
          description: 'Gérer les musiciens et leurs rôles',
          icon: <UserGroupIcon className="h-5 w-5" />,
          color: 'text-success-600'
        };
      }
      if (path.includes('/availability')) {
        return {
          title: 'Disponibilités',
          description: 'Gérer les créneaux disponibles',
          icon: <CalendarIcon className="h-5 w-5" />,
          color: 'text-primary-600'
        };
      }
      return {
        title: 'Équipe',
        description: 'Gestion de l\'équipe musicale',
        icon: <UserGroupIcon className="h-5 w-5" />,
        color: 'text-success-600'
      };
    }

    // Admin section
    if (path.includes('/admin')) {
      if (path.includes('/users')) {
        return {
          title: 'Gestion Utilisateurs',
          description: 'Administrer les comptes utilisateurs',
          icon: <UserIcon className="h-5 w-5" />,
          color: 'text-error-600'
        };
      }
      if (path.includes('/analytics')) {
        return {
          title: 'Analytics',
          description: 'Statistiques et analyses',
          icon: <ChartBarIcon className="h-5 w-5" />,
          color: 'text-warning-600'
        };
      }
      if (path.includes('/events')) {
        return {
          title: 'Gestion Événements',
          description: 'Créer et organiser les événements',
          icon: <CalendarIcon className="h-5 w-5" />,
          color: 'text-primary-600'
        };
      }
      return {
        title: 'Administration',
        description: 'Outils de gestion avancés',
        icon: <Cog6ToothIcon className="h-5 w-5" />,
        color: 'text-error-600'
      };
    }

    // Account section
    if (path.includes('/account')) {
      if (path.includes('/profile')) {
        return {
          title: 'Mon Profil',
          description: 'Gérer vos informations personnelles',
          icon: <UserIcon className="h-5 w-5" />,
          color: 'text-primary-600'
        };
      }
      if (path.includes('/settings')) {
        return {
          title: 'Paramètres',
          description: 'Configurer vos préférences',
          icon: <Cog6ToothIcon className="h-5 w-5" />,
          color: 'text-neutral-600'
        };
      }
      if (path.includes('/notifications')) {
        return {
          title: 'Notifications',
          description: 'Gérer vos alertes',
          icon: <BellIcon className="h-5 w-5" />,
          color: 'text-warning-600'
        };
      }
      return {
        title: 'Mon Compte',
        description: 'Gestion de votre compte utilisateur',
        icon: <UserIcon className="h-5 w-5" />,
        color: 'text-primary-600'
      };
    }

    // Notifications
    if (path.includes('/notifications')) {
      return {
        title: 'Notifications',
        description: 'Centre de notifications',
        icon: <BellIcon className="h-5 w-5" />,
        color: 'text-warning-600'
      };
    }

    // Multimedia
    if (path.includes('/multimedia')) {
      return {
        title: 'Multimédia',
        description: 'Gestion des photos et médias',
        icon: <PhotoIcon className="h-5 w-5" />,
        color: 'text-warning-600'
      };
    }

    return null;
  };

  if (!sectionInfo) return null;

  return (
    <div className="flex items-center space-x-3 p-3 bg-white border border-neutral-200 rounded-lg shadow-sm mb-4 animate-fadeInUp">
      <div className={`p-2 rounded-lg bg-neutral-100 ${sectionInfo.color}`}>
        {sectionInfo.icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          {sectionInfo.title}
        </h2>
        <p className="text-sm text-neutral-600">
          {sectionInfo.description}
        </p>
      </div>
    </div>
  );
}