'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactElement;
}

export function Breadcrumb() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Accueil',
        href: '/app',
        icon: <HomeIcon className="h-4 w-4" />
      }
    ];

    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip the first segment (app)
      if (index === 0) return;
      
      const label = getSegmentLabel(segment, segments.slice(0, index + 1));
      breadcrumbs.push({
        label,
        href: currentPath
      });
    });

    return breadcrumbs;
  };

  const getSegmentLabel = (segment: string, allSegments: string[]): string => {
    // Mapping des segments vers des labels lisibles
    const segmentMap: Record<string, string> = {
      'music': 'Musique',
      'team': 'Équipe',
      'admin': 'Administration',
      'account': 'Mon Compte',
      'notifications': 'Notifications',
      'upload': 'Upload',
      'repertoire': 'Répertoire',
      'songs': 'Chants',
      'add': 'Ajouter',
      'planning': 'Planning',
      'members': 'Membres',
      'profile': 'Profil',
      'settings': 'Paramètres',
      'users': 'Utilisateurs',
      'analytics': 'Analytics',
      'events': 'Événements',
      'recordings': 'Enregistrements',
      'sequences': 'Séquences',
      'multimedia': 'Multimédia',
      'photos': 'Photos',
      'availability': 'Disponibilité',
      'my-availability': 'Ma Disponibilité',
      'my-recordings': 'Mes Enregistrements',
      'my-assignments': 'Mes Affectations',
      'event-availability': 'Disponibilité Événement',
      'sunday-availability': 'Disponibilité Dimanche',
      'weekend-availability': 'Disponibilité Weekend',
      'weekly-availability': 'Disponibilité Hebdomadaire',
      'assign': 'Assigner',
      'generate-sundays': 'Générer Dimanches',
      'recent-uploads': 'Uploads Récents',
      'activity': 'Activité',
      'stats': 'Statistiques',
      'upcoming-services': 'Services à Venir'
    };

    // Gestion spéciale pour les IDs (segments qui ressemblent à des IDs)
    if (segment.match(/^[a-f0-9-]+$/i) && segment.length > 10) {
      return 'Détails';
    }

    // Gestion spéciale pour les segments avec des tirets
    if (segment.includes('-')) {
      const key = segment;
      if (segmentMap[key]) {
        return segmentMap[key];
      }
      // Fallback: capitaliser chaque mot
      return segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }

    return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs();

  // Ne pas afficher le breadcrumb sur la page d'accueil
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-neutral-600 mb-4">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 mx-2 text-neutral-400" />
            )}
            
            {isLast ? (
              <span className="font-medium text-neutral-900 flex items-center space-x-1">
                {item.icon && <span className="text-primary-600">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-primary-600 transition-colors duration-200 flex items-center space-x-1 group"
              >
                {item.icon && (
                  <span className="text-neutral-400 group-hover:text-primary-600 transition-colors">
                    {item.icon}
                  </span>
                )}
                <span className="group-hover:text-primary-600 transition-colors">
                  {item.label}
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}