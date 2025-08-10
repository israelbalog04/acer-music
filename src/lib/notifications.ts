import { prisma } from '@/lib/prisma';

interface NotificationData {
  title: string;
  message: string;
  type?: 'INFO' | 'ACTION' | 'WARNING' | 'SUCCESS';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  actionType?: string;
  actionId?: string;
  actionUrl?: string;
}

/**
 * Envoie une notification à tous les musiciens d'une église
 */
export async function notifyAllMusicians(
  churchId: string,
  createdById: string,
  notificationData: NotificationData
) {
  try {
    // Récupérer tous les musiciens de l'église
    const musicians = await prisma.user.findMany({
      where: {
        churchId: churchId,
        role: 'MUSICIEN'
      },
      select: { id: true }
    });

    if (musicians.length === 0) {
      console.log('Aucun musicien trouvé pour les notifications');
      return { success: true, count: 0 };
    }

    // Créer les notifications
    const notifications = await Promise.all(
      musicians.map(musician => 
        prisma.notification.create({
          data: {
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'INFO',
            priority: notificationData.priority || 'MEDIUM',
            userId: musician.id,
            createdById: createdById,
            actionType: notificationData.actionType,
            actionId: notificationData.actionId,
            actionUrl: notificationData.actionUrl,
            churchId: churchId
          }
        })
      )
    );

    console.log(`✅ ${notifications.length} notifications envoyées aux musiciens`);
    return { success: true, count: notifications.length };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie une notification à des utilisateurs spécifiques
 */
export async function notifyUsers(
  churchId: string,
  createdById: string,
  userIds: string[],
  notificationData: NotificationData
) {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => 
        prisma.notification.create({
          data: {
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'INFO',
            priority: notificationData.priority || 'MEDIUM',
            userId: userId,
            createdById: createdById,
            actionType: notificationData.actionType,
            actionId: notificationData.actionId,
            actionUrl: notificationData.actionUrl,
            churchId: churchId
          }
        })
      )
    );

    console.log(`✅ ${notifications.length} notifications envoyées`);
    return { success: true, count: notifications.length };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoie une notification à un utilisateur spécifique
 */
export async function notifyUser(
  churchId: string,
  createdById: string,
  userId: string,
  notificationData: NotificationData
) {
  return notifyUsers(churchId, createdById, [userId], notificationData);
}

/**
 * Marque toutes les notifications d'un utilisateur comme lues
 */
export async function markAllAsRead(userId: string, churchId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        churchId: churchId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error('❌ Erreur lors du marquage des notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Compte les notifications non lues d'un utilisateur
 */
export async function getUnreadCount(userId: string, churchId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        churchId: churchId,
        isRead: false
      }
    });

    return count;
  } catch (error) {
    console.error('❌ Erreur lors du comptage des notifications:', error);
    return 0;
  }
}

// Templates de notifications prédéfinis
export const NotificationTemplates = {
  sundayCreation: (count: number, adminName: string) => ({
    title: `${count} nouveaux dimanches créés`,
    message: `${adminName} a créé ${count} nouveaux événements dominicaux. Consultez le planning et remplissez vos disponibilités.`,
    type: 'INFO' as const,
    priority: 'HIGH' as const,
    actionType: 'sunday_creation',
    actionUrl: '/app/team/planning'
  }),

  availabilityRequest: (eventCount: number) => ({
    title: 'Remplissez vos disponibilités',
    message: `Il y a ${eventCount} événement(s) pour lesquels vos disponibilités sont requises. Merci de les remplir rapidement.`,
    type: 'ACTION' as const,
    priority: 'HIGH' as const,
    actionType: 'availability_request',
    actionUrl: '/app/availability'
  }),

  eventAssignment: (eventTitle: string, role: string) => ({
    title: `Nouvelle assignation : ${eventTitle}`,
    message: `Vous avez été assigné(e) comme ${role} pour l'événement "${eventTitle}". Consultez les détails et le répertoire à préparer.`,
    type: 'INFO' as const,
    priority: 'HIGH' as const,
    actionType: 'event_assignment',
    actionUrl: '/app/musician/events'
  }),

  recordingApproved: (recordingTitle: string) => ({
    title: 'Enregistrement approuvé',
    message: `Votre enregistrement "${recordingTitle}" a été approuvé et est maintenant disponible pour les autres musiciens.`,
    type: 'SUCCESS' as const,
    priority: 'MEDIUM' as const,
    actionType: 'recording_approval'
  }),

  recordingRejected: (recordingTitle: string, reason?: string) => ({
    title: 'Enregistrement refusé',
    message: `Votre enregistrement "${recordingTitle}" a été refusé.${reason ? ' Raison : ' + reason : ''}`,
    type: 'WARNING' as const,
    priority: 'MEDIUM' as const,
    actionType: 'recording_rejection'
  })
};