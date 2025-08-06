'use client';

import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  MusicalNoteIcon,
  UsersIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Section {
  name: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
}

export function SectionIndicator() {
  const pathname = usePathname();

  const getSectionInfo = (): Section | null => {
    if (pathname === '/app') {
      return {
        name: 'Dashboard',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: <HomeIcon className="h-5 w-5" />,
        description: 'Vue d\'ensemble de votre activité'
      };
    } else if (pathname.startsWith('/app/music/')) {
      return {
        name: 'Musique',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: <MusicalNoteIcon className="h-5 w-5" />,
        description: 'Gestion des enregistrements et répertoire'
      };
    } else if (pathname.startsWith('/app/team/')) {
      return {
        name: 'Équipe',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <UsersIcon className="h-5 w-5" />,
        description: 'Organisation et planning des musiciens'
      };
    } else if (pathname.startsWith('/app/account/')) {
      return {
        name: 'Mon Compte',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: <UserIcon className="h-5 w-5" />,
        description: 'Paramètres personnels et notifications'
      };
    }

    return null;
  };

  const section = getSectionInfo();

  if (!section) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3 mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className={`p-2 rounded-lg ${section.bgColor}`}>
        <div className={section.color}>
          {section.icon}
        </div>
      </div>
      <div>
        <h2 className={`font-semibold ${section.color}`}>
          Section {section.name}
        </h2>
        <p className="text-sm text-gray-600">
          {section.description}
        </p>
      </div>
    </div>
  );
}