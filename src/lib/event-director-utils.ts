import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Vérifie si un utilisateur est directeur musical pour un événement donné
 */
export async function isEventDirector(userId: string, eventId: string): Promise<boolean> {
  try {
    const director = await prisma.eventDirector.findFirst({
      where: {
        userId,
        scheduleId: eventId,
        isActive: true
      }
    });

    return !!director;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut DM:', error);
    return false;
  }
}

/**
 * Récupère les événements pour lesquels l'utilisateur connecté est DM
 */
export async function getCurrentUserEventDirectorships(): Promise<string[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    const directorships = await prisma.eventDirector.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        scheduleId: true
      }
    });

    return directorships.map(d => d.scheduleId);
  } catch (error) {
    console.error('Erreur lors de la récupération des DM:', error);
    return [];
  }
}

/**
 * Vérifie si l'utilisateur connecté peut gérer les séquences d'un événement
 */
export async function canManageEventSequences(eventId: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.role) return false;

    // Les admins et chefs de louange peuvent tout gérer
    if (session.user.role === 'ADMIN' || session.user.role === 'CHEF_LOUANGE') {
      return true;
    }

    // Vérifier si l'utilisateur est DM de cet événement
    return await isEventDirector(session.user.id, eventId);
  } catch (error) {
    console.error('Erreur lors de la vérification des permissions:', error);
    return false;
  }
}

/**
 * Récupère les événements avec leur statut DM pour l'utilisateur connecté
 */
export async function getEventsWithDirectorStatus(): Promise<Array<{
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isDirector: boolean;
  directors: Array<{
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.churchId) return [];

    const events = await prisma.schedule.findMany({
      where: {
        churchId: session.user.churchId,
        date: {
          gte: new Date() // Événements futurs uniquement
        }
      },
      include: {
        directors: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return events.map(event => ({
      id: event.id,
      title: event.title,
      startTime: event.startTime ? new Date(`${event.date.toISOString().split('T')[0]}T${event.startTime}`) : event.date,
      endTime: event.endTime ? new Date(`${event.date.toISOString().split('T')[0]}T${event.endTime}`) : event.date,
      isDirector: event.directors.some(d => d.userId === session.user.id),
      directors: event.directors
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return [];
  }
}

/**
 * Assigne un utilisateur comme directeur musical pour un événement
 */
export async function assignEventDirector(
  eventId: string,
  musicianId: string,
  assignedById: string
): Promise<boolean> {
  try {
    // Vérifier que l'événement existe et appartient à la même église
    const event = await prisma.schedule.findFirst({
      where: { id: eventId }
    });

    if (!event) return false;

    // Vérifier que le musicien appartient à la même église
    const musician = await prisma.user.findFirst({
      where: {
        id: musicianId,
        churchId: event.churchId
      }
    });

    if (!musician) return false;

    // Créer l'attribution (ou la réactiver si elle existe)
    await prisma.eventDirector.upsert({
      where: {
        scheduleId_userId: {
          scheduleId: eventId,
          userId: musicianId
        }
      },
      update: {
        isActive: true,
        assignedById,
        assignedAt: new Date()
      },
      create: {
        scheduleId: eventId,
        userId: musicianId,
        churchId: event.churchId,
        assignedById,
        isActive: true
      }
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'assignation du DM:', error);
    return false;
  }
}

/**
 * Révoque le statut de directeur musical pour un événement
 */
export async function revokeEventDirector(eventId: string, musicianId: string): Promise<boolean> {
  try {
    await prisma.eventDirector.updateMany({
      where: {
        scheduleId: eventId,
        userId: musicianId
      },
      data: {
        isActive: false
      }
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de la révocation du DM:', error);
    return false;
  }
}