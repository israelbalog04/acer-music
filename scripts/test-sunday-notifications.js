const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour envoyer une notification à tous les musiciens
async function notifyAllMusicians(churchId, createdById, notificationData) {
  try {
    const musicians = await prisma.user.findMany({
      where: {
        churchId: churchId,
        role: 'MUSICIEN'
      },
      select: { id: true, firstName: true, lastName: true }
    });

    if (musicians.length === 0) {
      console.log('Aucun musicien trouvé pour les notifications');
      return { success: true, count: 0 };
    }

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

    console.log(`✅ ${notifications.length} notifications envoyées aux musiciens:`, 
      musicians.map(m => `${m.firstName} ${m.lastName}`).join(', '));
    return { success: true, count: notifications.length };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    return { success: false, error: error.message };
  }
}

async function testSundayNotifications() {
  console.log('🧪 Test des notifications de création de dimanches');
  
  try {
    // 1. Récupérer un admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.log('❌ Aucun admin trouvé');
      return;
    }
    
    // 2. Template de notification comme dans l'API
    const sundayCount = 3;
    const adminName = `${admin.firstName} ${admin.lastName}`;
    
    const creationNotification = {
      title: `${sundayCount} nouveaux dimanches créés`,
      message: `${adminName} a créé ${sundayCount} nouveaux événements dominicaux. Consultez le planning et remplissez vos disponibilités.`,
      type: 'INFO',
      priority: 'HIGH',
      actionType: 'sunday_creation',
      actionUrl: '/app/team/planning'
    };
    
    const availabilityNotification = {
      title: 'Remplissez vos disponibilités',
      message: `Il y a ${sundayCount} événement(s) pour lesquels vos disponibilités sont requises. Merci de les remplir rapidement.`,
      type: 'ACTION',
      priority: 'HIGH',
      actionType: 'availability_request',
      actionUrl: '/app/availability'
    };
    
    // 3. Envoyer les notifications
    console.log('📧 Envoi de la notification de création...');
    const result1 = await notifyAllMusicians(admin.churchId, admin.id, creationNotification);
    
    console.log('📧 Envoi de la demande de disponibilités...');
    const result2 = await notifyAllMusicians(admin.churchId, admin.id, availabilityNotification);
    
    // 4. Vérifier les notifications créées
    const totalNotifications = await prisma.notification.count({
      where: {
        churchId: admin.churchId,
        createdById: admin.id,
        actionType: { in: ['sunday_creation', 'availability_request'] }
      }
    });
    
    console.log(`✅ ${totalNotifications} notifications créées au total`);
    
    // 5. Nettoyer les notifications de test
    const deleted = await prisma.notification.deleteMany({
      where: {
        churchId: admin.churchId,
        createdById: admin.id,
        actionType: { in: ['sunday_creation', 'availability_request'] }
      }
    });
    
    console.log(`🧹 ${deleted.count} notifications de test supprimées`);
    
    console.log('\n✅ Test des notifications de création de dimanches terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSundayNotifications();