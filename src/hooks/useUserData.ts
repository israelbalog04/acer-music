import { useSession } from 'next-auth/react';

export function useUserData() {
  const { data: session, status } = useSession();

  // Fonction pour obtenir les initiales de l'utilisateur
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map(n => n.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  // Fonction pour parser les instruments JSON
  const getInstruments = (instruments?: string) => {
    if (!instruments) return [];
    try {
      return JSON.parse(instruments);
    } catch {
      return [];
    }
  };

  // Fonction pour obtenir le prénom
  const getFirstName = (name?: string) => {
    if (!name) return 'Utilisateur';
    return name.split(' ')[0];
  };

  // Fonction pour obtenir le nom de famille
  const getLastName = (name?: string) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  };

  return {
    // Session data
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    
    // User info
    user: session?.user,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    userName: session?.user?.name,
    userRole: session?.user?.role,
    userInstruments: session?.user?.instruments ? (typeof session.user.instruments === 'string' ? getInstruments(session.user.instruments) : session.user.instruments) : [],
    userAvatar: session?.user?.avatar,
    
    // Church info
    churchId: session?.user?.churchId,
    churchName: session?.user?.churchName,
    churchCity: session?.user?.churchCity,
    
    // Computed values
    initials: getInitials(session?.user?.name || undefined),
    firstName: getFirstName(session?.user?.name || undefined),
    lastName: getLastName(session?.user?.name || undefined),
    primaryInstrument: session?.user?.instruments ? (typeof session.user.instruments === 'string' ? getInstruments(session.user.instruments)[0] : session.user.instruments[0]) || 'Musicien' : 'Musicien',
    
    // Utility functions
    getInitials,
    getInstruments,
    getFirstName,
    getLastName,
  };
}