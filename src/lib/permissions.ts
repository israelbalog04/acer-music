import { UserRole } from '@prisma/client';

// Définition des permissions par rôle
export const PERMISSIONS = {
  // Permissions Super Admin (accès total à toutes les églises)
  SUPER_ADMIN: [
    'users.read.all',
    'users.create', 
    'users.update.all',
    'users.delete.all',
    'recordings.read.all',
    'recordings.create',
    'recordings.update.all', 
    'recordings.delete.all',
    'recordings.approve.all',
    'songs.read.all',
    'songs.create',
    'songs.update.all',
    'songs.delete.all',
    'schedules.read.all',
    'schedules.create',
    'schedules.update.all',
    'schedules.delete.all',
    'teams.read.all',
    'teams.create',
    'teams.update.all',
    'teams.delete.all',
    'availabilities.read.all',
    'availabilities.create',
    'availabilities.update.all',
    'availabilities.delete.all',
    'analytics.read.all',
    'settings.read.all',
    'settings.update.all',
    'sequences.read.all',
    'sequences.create',
    'sequences.update.all',
    'sequences.delete.all',
    'sequences.download.all',
    'multimedia.images.read.all',
    'churches.read.all',
    'churches.create',
    'churches.update.all',
    'churches.delete.all'
  ],

  // Permissions Admin (accès total à son église)
  ADMIN: [
    'users.read',
    'users.create', 
    'users.update',
    'users.delete',
    'recordings.read',
    'recordings.create',
    'recordings.update', 
    'recordings.delete',
    'recordings.approve',
    'songs.read',
    'songs.create',
    'songs.update',
    'songs.delete',
    'schedules.read',
    'schedules.create',
    'schedules.update',
    'schedules.delete',
    'teams.read',
    'teams.create',
    'teams.update',
    'teams.delete',
    'availabilities.read',
    'availabilities.create',
    'availabilities.update',
    'availabilities.delete',
    'analytics.read',
    'settings.read',
    'settings.update',
    'sequences.read',
    'sequences.create',
    'sequences.update',
    'sequences.delete',
    'sequences.download',
    'multimedia.images.read'         // Voir les photos des musiciens
  ],

  // Permissions Chef de Louange
  CHEF_LOUANGE: [
    'users.read',                    // Voir les musiciens
    'recordings.read',               // Voir tous les enregistrements
    'recordings.approve',            // Approuver/refuser
    'songs.read',
    'songs.create',                  // Ajouter chansons au répertoire
    'songs.update',
    'songs.delete',
    'schedules.read',
    'schedules.create',              // Créer des événements
    'schedules.update',
    'schedules.delete',
    'teams.read',
    'teams.update',                  // Assigner les musiciens
    'availabilities.read',           // Consulter les dispos
    'sequences.read',                // Consulter les séquences
    'sequences.download',            // Télécharger les séquences
    'multimedia.images.read',        // Voir les photos des musiciens
  ],


  // Permissions Musicien (utilisateurs de base)
  MUSICIEN: [
    'recordings.read.own',           // Voir ses propres enregistrements
    'recordings.create',             // Upload ses enregistrements
    'recordings.update.own',         // Modifier ses enregistrements
    'recordings.delete.own',
    'songs.read',                    // Consulter le répertoire
    'schedules.read',                // Consulter le planning
    'availabilities.create',         // Donner ses disponibilités
    'availabilities.update.own',
    'availabilities.delete.own',
    'sequences.read',                // Consulter les séquences
    'sequences.download',            // Télécharger les séquences
    'multimedia.images.read',        // Voir les photos des musiciens
    'profile.update.own'             // Modifier son profil
  ],

  // Technicien (même niveau que musicien pour l'instant)
  TECHNICIEN: [
    'recordings.read.own',
    'recordings.create',
    'recordings.update.own',
    'recordings.delete.own',
    'songs.read',
    'schedules.read',
    'availabilities.create',
    'availabilities.update.own',
    'availabilities.delete.own',
    'sequences.read',                // Consulter les séquences
    'sequences.download',            // Télécharger les séquences
    'multimedia.images.read',        // Voir les photos des musiciens
    'profile.update.own'
  ],

  // Permissions Multimédia (accès limité)
  MULTIMEDIA: [
    'multimedia.images.create',      // Uploader des images uniquement
    'profile.update.own'             // Modifier son profil
  ]
};

// Fonction pour vérifier les permissions
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions = PERMISSIONS[userRole];
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

// Permissions spéciales pour les DM d'un événement
export const EVENT_DIRECTOR_PERMISSIONS = [
  'sequences.create',              // Créer des séquences pour cet événement
  'sequences.update',              // Modifier les séquences de cet événement
  'sequences.delete',              // Supprimer les séquences de cet événement
  'sequences.analytics',           // Voir les stats de téléchargement
  'event.manage'                   // Gérer l'événement
];

// Fonction pour vérifier si un utilisateur est DM d'un événement
export async function isEventDirector(userId: string, eventId: string): Promise<boolean> {
  // Cette fonction sera implémentée côté serveur avec Prisma
  // Pour l'instant, on retourne false
  return false;
}

// Fonction pour vérifier les permissions contextuelles (incluant DM d'événement)
export async function hasContextualPermission(
  userRole: UserRole,
  userId: string,
  permission: string,
  context?: {
    eventId?: string;
    resourceUserId?: string;
  }
): Promise<boolean> {
  // Permissions de base selon le rôle
  const basePermission = hasPermission(userRole, permission);
  if (basePermission) return true;

  // Vérifier les permissions de DM pour cet événement
  if (context?.eventId && EVENT_DIRECTOR_PERMISSIONS.includes(permission)) {
    return await isEventDirector(userId, context.eventId);
  }

  // Permissions sur ressource propre
  if (context?.resourceUserId && permission.endsWith('.own')) {
    const basePermissionName = permission.replace('.own', '');
    return hasPermission(userRole, basePermissionName) && userId === context.resourceUserId;
  }

  return false;
}

// Fonction pour vérifier les permissions sur une ressource propre
export function hasOwnPermission(
  userRole: UserRole, 
  permission: string, 
  resourceUserId: string, 
  currentUserId: string
): boolean {
  // Si c'est un admin ou chef de louange, accès total
  if (userRole === UserRole.ADMIN || userRole === UserRole.CHEF_LOUANGE) {
    return hasPermission(userRole, permission.replace('.own', ''));
  }
  
  // Sinon, vérifier que c'est bien la ressource de l'utilisateur
  if (resourceUserId === currentUserId) {
    return hasPermission(userRole, permission);
  }
  
  return false;
}

// Navigation basée sur le rôle
export const getNavigationForRole = (role: UserRole) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/app', icon: 'HomeIcon', section: 'main' }
  ];

  switch (role) {
    case UserRole.SUPER_ADMIN:
      return [
        ...baseNavigation,
        // Gestion Globale
        { name: 'Toutes les Églises', href: '/app/super-admin/churches', icon: 'BuildingOfficeIcon', section: 'super-admin' },
        { name: 'Tous les Utilisateurs', href: '/app/super-admin/users', icon: 'UsersIcon', section: 'super-admin' },
        { name: 'Statistiques Globales', href: '/app/super-admin/analytics', icon: 'ChartBarIcon', section: 'super-admin' },
        { name: 'Gestion des Églises', href: '/app/super-admin/church-management', icon: 'Cog6ToothIcon', section: 'super-admin' },
        // Compte
        { name: 'Mon Profil', href: '/app/account/profile', icon: 'UserIcon', section: 'account' },
        { name: 'Notifications', href: '/app/notifications', icon: 'BellIcon', section: 'account' },
        { name: 'Paramètres', href: '/app/account/settings', icon: 'Cog6ToothIcon', section: 'account' }
      ];

    case UserRole.ADMIN:
      return [
        ...baseNavigation,
        // Gestion Utilisateurs
        { name: 'Utilisateurs', href: '/app/admin/users', icon: 'UsersIcon', section: 'admin' },
        { name: 'Personnalisation', href: '/app/admin/branding', icon: 'PaintBrushIcon', section: 'admin' },
        { name: 'Gestion des Événements', href: '/app/admin/events', icon: 'CalendarIcon', section: 'admin' },
        { name: 'Validation Enregistrements', href: '/app/admin/recordings', icon: 'MicrophoneIcon', section: 'admin' },
        { name: 'Statistiques', href: '/app/admin/analytics', icon: 'ChartBarIcon', section: 'admin' },
        // Musique
        { name: 'Répertoire', href: '/app/music/repertoire', icon: 'MusicalNoteIcon', section: 'music' },
        { name: 'Séquences', href: '/app/music/sequences', icon: 'RectangleStackIcon', section: 'music' },
        { name: 'Enregistrements', href: '/app/music/recordings-manage', icon: 'RectangleStackIcon', section: 'music' },
        { name: 'Upload', href: '/app/music/upload', icon: 'CloudArrowUpIcon', section: 'music' },
        { name: 'Photos des Musiciens', href: '/app/music/photos', icon: 'PhotoIcon', section: 'music' },
        // Planning & Équipe
        { name: 'Planning', href: '/app/team/planning', icon: 'CalendarIcon', section: 'team' },
        { name: 'Directeurs Musicaux', href: '/app/planning/directors', icon: 'StarIcon', section: 'team' },
        { name: 'Équipes par Événement', href: '/app/team/events', icon: 'UserGroupIcon', section: 'team' },
        { name: 'Membres', href: '/app/team/members', icon: 'UsersIcon', section: 'team' },
        { name: 'Disponibilités Équipe', href: '/app/planning/availability', icon: 'ClockIcon', section: 'team' },
        { name: 'Affectation Équipes', href: '/app/admin/teams/assign', icon: 'UsersIcon', section: 'admin' },
        // Compte
        { name: 'Mon Profil', href: '/app/account/profile', icon: 'UserIcon', section: 'account' },
        { name: 'Notifications', href: '/app/notifications', icon: 'BellIcon', section: 'account' },
        { name: 'Paramètres', href: '/app/account/settings', icon: 'Cog6ToothIcon', section: 'account' }
      ];

    case UserRole.CHEF_LOUANGE:
      return [
        ...baseNavigation,
        // Administration
        { name: 'Gestion des Événements', href: '/app/admin/events', icon: 'CalendarIcon', section: 'admin' },
        { name: 'Validation Enregistrements', href: '/app/admin/recordings', icon: 'MicrophoneIcon', section: 'admin' },
        // Musique
        { name: 'Répertoire', href: '/app/music/repertoire', icon: 'MusicalNoteIcon', section: 'music' },
        { name: 'Séquences', href: '/app/music/sequences', icon: 'RectangleStackIcon', section: 'music' },
        { name: 'Enregistrements', href: '/app/music/recordings-manage', icon: 'RectangleStackIcon', section: 'music' },
        { name: 'Upload', href: '/app/music/upload', icon: 'CloudArrowUpIcon', section: 'music' },
        { name: 'Photos des Musiciens', href: '/app/music/photos', icon: 'PhotoIcon', section: 'music' },
        // Planning (gestion complète)
        { name: 'Gestion Planning', href: '/app/planning/manage', icon: 'CalendarIcon', section: 'planning' },
        { name: 'Créer Événement', href: '/app/planning/create', icon: 'PlusIcon', section: 'planning' },
        { name: 'Directeurs Musicaux', href: '/app/planning/directors', icon: 'StarIcon', section: 'planning' },
        { name: 'Disponibilités Équipe', href: '/app/planning/availability', icon: 'ClockIcon', section: 'planning' },
        // Équipe
        { name: 'Équipes par Événement', href: '/app/team/events', icon: 'UserGroupIcon', section: 'team' },
        { name: 'Membres', href: '/app/team/members', icon: 'UsersIcon', section: 'team' },
        // Compte
        { name: 'Mon Profil', href: '/app/account/profile', icon: 'UserIcon', section: 'account' },
        { name: 'Notifications', href: '/app/notifications', icon: 'BellIcon', section: 'account' },
        { name: 'Paramètres', href: '/app/account/settings', icon: 'Cog6ToothIcon', section: 'account' }
      ];


    case UserRole.MULTIMEDIA:
      return [
        // Pas de dashboard pour MULTIMEDIA, directement la page de dépôt
        { name: 'Déposer des Photos', href: '/app/multimedia/upload', icon: 'CloudArrowUpIcon', section: 'multimedia' },
        // Compte
        { name: 'Mon Profil', href: '/app/account/profile', icon: 'UserIcon', section: 'account' },
        { name: 'Paramètres', href: '/app/account/settings', icon: 'Cog6ToothIcon', section: 'account' }
      ];

    case UserRole.MUSICIEN:
    case UserRole.TECHNICIEN:
    default:
      return [
        ...baseNavigation,
        // Musique (consultation et upload personnel)
        { name: 'Répertoire', href: '/app/music/repertoire', icon: 'MusicalNoteIcon', section: 'music' },
        { name: 'Séquences', href: '/app/music/sequences', icon: 'RectangleStackIcon', section: 'music' },
        { name: 'Enregistrements', href: '/app/music/recordings-manage', icon: 'RectangleStackIcon', section: 'music' },
        { name: 'Upload', href: '/app/music/upload', icon: 'CloudArrowUpIcon', section: 'music' },
        { name: 'Photos des Musiciens', href: '/app/music/photos', icon: 'PhotoIcon', section: 'music' },
        // Planning (consultation seulement)
        { name: 'Planning', href: '/app/team/planning', icon: 'CalendarIcon', section: 'team' },
        { name: 'Mes Disponibilités', href: '/app/availability', icon: 'ClockIcon', section: 'team' },
        { name: 'Mes Affectations', href: '/app/teams/my-assignments', icon: 'UsersIcon', section: 'team' },
        // Équipe (consultation)
        { name: 'Équipes par Événement', href: '/app/team/events', icon: 'UserGroupIcon', section: 'team' },
        { name: 'Membres', href: '/app/team/members', icon: 'UsersIcon', section: 'team' },
        // Compte
        { name: 'Mon Profil', href: '/app/account/profile', icon: 'UserIcon', section: 'account' },
        { name: 'Notifications', href: '/app/notifications', icon: 'BellIcon', section: 'account' },
        { name: 'Paramètres', href: '/app/account/settings', icon: 'Cog6ToothIcon', section: 'account' }
      ];
  }
};