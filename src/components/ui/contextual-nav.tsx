'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CloudArrowUpIcon,
  MusicalNoteIcon,
  CalendarIcon,
  UsersIcon,
  RectangleStackIcon,
  UserIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface ContextualAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  priority: number;
}

export function ContextualNav() {
  const pathname = usePathname();

  // Define contextual actions based on current page
  const getContextualActions = (): ContextualAction[] => {
    const actions: ContextualAction[] = [];

    // Music domain actions
    if (pathname.startsWith('/app/music/')) {
      if (pathname === '/app/music/repertoire') {
        actions.push({
          label: 'Nouveau Upload',
          href: '/app/music/upload',
          icon: <CloudArrowUpIcon className="h-4 w-4" />,
          variant: 'primary',
          priority: 1
        });
        actions.push({
          label: 'Mes Enregistrements',
          href: '/app/music/my-recordings',
          icon: <RectangleStackIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 2
        });
      } else if (pathname === '/app/music/upload') {
        actions.push({
          label: 'Voir Répertoire',
          href: '/app/music/repertoire',
          icon: <MusicalNoteIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 1
        });
        actions.push({
          label: 'Mes Uploads',
          href: '/app/music/my-recordings',
          icon: <RectangleStackIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 2
        });
      } else if (pathname === '/app/music/my-recordings') {
        actions.push({
          label: 'Nouveau Upload',
          href: '/app/music/upload',
          icon: <CloudArrowUpIcon className="h-4 w-4" />,
          variant: 'primary',
          priority: 1
        });
        actions.push({
          label: 'Répertoire',
          href: '/app/music/repertoire',
          icon: <MusicalNoteIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 2
        });
      }
    }

    // Team domain actions
    else if (pathname.startsWith('/app/team/')) {
      if (pathname === '/app/team/planning') {
        actions.push({
          label: 'Voir Équipe',
          href: '/app/team/members',
          icon: <UsersIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 1
        });
        actions.push({
          label: 'Mon Profil',
          href: '/app/account/profile',
          icon: <UserIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 2
        });
      } else if (pathname === '/app/team/members') {
        actions.push({
          label: 'Planning',
          href: '/app/team/planning',
          icon: <CalendarIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 1
        });
      }
    }

    // Account domain actions
    else if (pathname.startsWith('/app/account/')) {
      if (pathname === '/app/account/profile') {
        actions.push({
          label: 'Notifications',
          href: '/app/account/notifications',
          icon: <BellIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 1
        });
        actions.push({
          label: 'Paramètres',
          href: '/app/account/settings',
          icon: <Cog6ToothIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 2
        });
      } else if (pathname === '/app/account/notifications') {
        actions.push({
          label: 'Paramètres',
          href: '/app/account/settings',
          icon: <Cog6ToothIcon className="h-4 w-4" />,
          variant: 'outline',
          priority: 1
        });
      }
    }

    // Dashboard actions
    else if (pathname === '/app') {
      actions.push({
        label: 'Nouveau Upload',
        href: '/app/music/upload',
        icon: <CloudArrowUpIcon className="h-4 w-4" />,
        variant: 'primary',
        priority: 1
      });
      actions.push({
        label: 'Répertoire',
        href: '/app/music/repertoire',
        icon: <MusicalNoteIcon className="h-4 w-4" />,
        variant: 'outline',
        priority: 2
      });
      actions.push({
        label: 'Planning',
        href: '/app/team/planning',
        icon: <CalendarIcon className="h-4 w-4" />,
        variant: 'outline',
        priority: 3
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  };

  const actions = getContextualActions();

  // Don't render if no contextual actions
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mb-6">
      <div className="text-xs text-gray-500 font-medium mr-2 uppercase tracking-wider">
        Actions rapides :
      </div>
      {actions.map((action, index) => (
        <Link key={index} href={action.href}>
          <Button 
            size="sm" 
            variant={action.variant || 'outline'}
            className="text-xs"
          >
            {action.icon}
            {action.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}