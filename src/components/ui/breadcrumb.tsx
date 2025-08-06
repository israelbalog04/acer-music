'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Mapping des routes vers des labels lisibles
  const routeLabels: Record<string, string> = {
    'app': 'Dashboard',
    'music': 'Musique',
    'repertoire': 'Répertoire',
    'upload': 'Upload',
    'my-recordings': 'Mes Enregistrements',
    'team': 'Équipe',
    'members': 'Membres',
    'planning': 'Planning',
    'account': 'Mon Compte',
    'profile': 'Profil',
    'notifications': 'Notifications',
    'settings': 'Paramètres',
    'auth': 'Authentification',
    'login': 'Connexion',
    'register': 'Inscription'
  };

  // Générer les éléments du breadcrumb
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const items: BreadcrumbItem[] = [];

    // Toujours commencer par l'accueil
    items.push({
      label: 'Accueil',
      href: '/',
      icon: <HomeIcon className="h-4 w-4" />
    });

    // Construire le chemin progressivement
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment;
      
      // Le dernier élément n'a pas de lien (page actuelle)
      const isLast = index === pathSegments.length - 1;
      
      items.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  // Ne pas afficher si on est sur la page d'accueil
  if (pathname === '/') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center space-x-1 hover:text-[#3244c7] transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-1 text-gray-900 font-medium">
              {item.icon}
              <span>{item.label}</span>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}