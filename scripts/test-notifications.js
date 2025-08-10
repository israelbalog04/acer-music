const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotifications() {
  try {
    console.log('🧪 Test du système de notifications...\n');

    // 1. Vérifier les utilisateurs existants
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, churchId: true }
    });

    console.log('👥 Utilisateurs trouvés:');
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    // 2. Créer des notifications de test
    const multimediaUser = users.find(u => u.role === 'MULTIMEDIA');
    const musicianUser = users.find(u => u.role === 'MUSICIEN');

    if (!multimediaUser || !musicianUser) {
      console.log('❌ Utilisateurs MULTIMEDIA ou MUSICIEN non trouvés');
      return;
    }

    console.log('\n📝 Création de notifications de test...');

    // Notification urgente
    const urgentNotification = await prisma.$executeRawUnsafe(`
      INSERT INTO notifications (id, title, message, type, priority, userId, createdById, actionType, actionId, actionUrl, churchId, createdAt, updatedAt)
      VALUES (
        'test_urgent_${Date.now()}',
        'Test Notification Urgente',
        'Ceci est une notification de test urgente pour vérifier le système.',
        'WARNING',
        'URGENT',
        '${musicianUser.id}',
        '${multimediaUser.id}',
        'test',
        'test_id',
        '/app/notifications',
        '${multimediaUser.churchId}',
        datetime('now'),
        datetime('now')
      )
    `);

    // Notification normale
    const normalNotification = await prisma.$executeRawUnsafe(`
      INSERT INTO notifications (id, title, message, type, priority, userId, createdById, actionType, actionId, actionUrl, churchId, createdAt, updatedAt)
      VALUES (
        'test_normal_${Date.now()}',
        'Test Notification Normale',
        'Ceci est une notification de test normale pour vérifier le système.',
        'INFO',
        'MEDIUM',
        '${musicianUser.id}',
        '${multimediaUser.id}',
        'test',
        'test_id',
        '/app/notifications',
        '${multimediaUser.churchId}',
        datetime('now'),
        datetime('now')
      )
    `);

    // Notification de succès
    const successNotification = await prisma.$executeRawUnsafe(`
      INSERT INTO notifications (id, title, message, type, priority, userId, createdById, actionType, actionId, actionUrl, churchId, createdAt, updatedAt)
      VALUES (
        'test_success_${Date.now()}',
        'Test Notification Succès',
        'Ceci est une notification de test de succès pour vérifier le système.',
        'SUCCESS',
        'LOW',
        '${musicianUser.id}',
        '${multimediaUser.id}',
        'test',
        'test_id',
        '/app/notifications',
        '${multimediaUser.churchId}',
        datetime('now'),
        datetime('now')
      )
    `);

    console.log('✅ 3 notifications de test créées');

    // 3. Vérifier les notifications créées
    const notifications = await prisma.$queryRawUnsafe(`
      SELECT 
        n.*,
        u1.firstName as createdByFirstName,
        u1.lastName as createdByLastName
      FROM notifications n
      LEFT JOIN users u1 ON n.createdById = u1.id
      WHERE n.userId = '${musicianUser.id}'
      ORDER BY n.createdAt DESC
      LIMIT 10
    `);

    console.log('\n📋 Notifications récentes:');
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. [${notif.priority}] ${notif.title}`);
      console.log(`     Type: ${notif.type} | Lu: ${notif.isRead ? 'Oui' : 'Non'}`);
      console.log(`     Par: ${notif.createdByFirstName} ${notif.createdByLastName}`);
      console.log(`     Date: ${notif.createdAt}`);
      console.log('');
    });

    // 4. Compter les notifications non lues
    const unreadCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE userId = '${musicianUser.id}' AND isRead = 0
    `);

    console.log(`📊 Notifications non lues: ${unreadCount[0].count}`);

    // 5. Test de l'API
    console.log('\n🌐 Test de l\'API des notifications...');
    console.log('   Pour tester l\'API, connectez-vous en tant que musicien et vérifiez:');
    console.log('   - La page /app/notifications');
    console.log('   - Le badge de notifications dans la sidebar');
    console.log('   - Le dropdown des notifications');

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotifications();