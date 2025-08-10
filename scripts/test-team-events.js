const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestTeamEvents() {
  console.log('🧪 Création de données de test pour les équipes par événement');
  
  try {
    // 1. Récupérer les utilisateurs existants
    const users = await prisma.user.findMany();
    console.log(`✅ ${users.length} utilisateur(s) trouvé(s)`);
    
    if (users.length < 3) {
      console.log('❌ Pas assez d\'utilisateurs pour créer des équipes de test');
      return;
    }

    const admin = users.find(u => u.role === 'ADMIN');
    const musicians = users.filter(u => u.role === 'MUSICIEN');
    const chefLouange = users.find(u => u.role === 'CHEF_LOUANGE');

    if (!admin) {
      console.log('❌ Aucun admin trouvé');
      return;
    }

    // 2. Créer un événement de test avec équipe
    const testEvent = await prisma.schedule.create({
      data: {
        title: 'Service Dominical Test',
        description: 'Service du dimanche avec équipe complète',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        startTime: '10:00',
        endTime: '12:00',
        type: 'SERVICE',
        status: 'PLANNED',
        location: 'Sanctuaire Principal',
        hasMultipleSessions: true,
        sessionCount: 2,
        churchId: admin.churchId,
        createdById: admin.id,
        notes: 'Service avec louange spéciale'
      }
    });

    console.log(`✅ Événement créé: ${testEvent.title}`);

    // 3. Assigner des directeurs musicaux
    if (chefLouange) {
      await prisma.eventDirector.create({
        data: {
          scheduleId: testEvent.id,
          userId: chefLouange.id,
          churchId: admin.churchId,
          assignedById: admin.id,
          isPrimary: true,
          notes: 'Directeur principal pour ce service'
        }
      });
      console.log(`✅ Directeur musical assigné: ${chefLouange.firstName} ${chefLouange.lastName}`);
    }

    // 4. Assigner des membres d'équipe
    if (musicians.length > 0) {
      for (let i = 0; i < Math.min(3, musicians.length); i++) {
        const musician = musicians[i];
        const roles = ['Piano Principal', 'Guitare Lead', 'Chant Lead', 'Basse', 'Batterie'];
        
        await prisma.eventTeamMember.create({
          data: {
            scheduleId: testEvent.id,
            userId: musician.id,
            churchId: admin.churchId,
            role: roles[i] || 'Musicien',
            assignedById: admin.id,
            notes: `Assigné comme ${roles[i] || 'Musicien'} pour ce service`
          }
        });
        
        console.log(`✅ Membre d'équipe assigné: ${musician.firstName} ${musician.lastName} - ${roles[i] || 'Musicien'}`);
      }
    }

    // 5. Créer des sessions avec leurs équipes
    const session1 = await prisma.eventSession.create({
      data: {
        name: 'Louange du Matin',
        startTime: new Date(testEvent.date.getTime() + 10 * 60 * 60 * 1000), // 10h
        endTime: new Date(testEvent.date.getTime() + 11 * 60 * 60 * 1000), // 11h
        sessionOrder: 1,
        location: 'Sanctuaire Principal',
        scheduleId: testEvent.id,
        churchId: admin.churchId,
        notes: 'Session de louange matinale'
      }
    });

    const session2 = await prisma.eventSession.create({
      data: {
        name: 'Adoration Finale',
        startTime: new Date(testEvent.date.getTime() + 11.5 * 60 * 60 * 1000), // 11h30
        endTime: new Date(testEvent.date.getTime() + 12 * 60 * 60 * 1000), // 12h
        sessionOrder: 2,
        location: 'Sanctuaire Principal',
        scheduleId: testEvent.id,
        churchId: admin.churchId,
        notes: 'Session d\'adoration de clôture'
      }
    });

    console.log(`✅ Sessions créées: ${session1.name} et ${session2.name}`);

    // 6. Assigner des directeurs de session
    if (chefLouange) {
      await prisma.sessionDirector.create({
        data: {
          sessionId: session1.id,
          userId: chefLouange.id,
          assignedById: admin.id,
          isPrimary: true
        }
      });
    }

    // 7. Assigner des membres aux sessions
    if (musicians.length > 0) {
      // Session 1
      for (let i = 0; i < Math.min(2, musicians.length); i++) {
        await prisma.sessionMember.create({
          data: {
            sessionId: session1.id,
            userId: musicians[i].id,
            churchId: admin.churchId,
            role: i === 0 ? 'Pianiste' : 'Chanteur',
            isConfirmed: true
          }
        });
      }

      // Session 2
      for (let i = 0; i < Math.min(2, musicians.length); i++) {
        await prisma.sessionMember.create({
          data: {
            sessionId: session2.id,
            userId: musicians[i].id,
            churchId: admin.churchId,
            role: i === 0 ? 'Guitariste' : 'Choriste',
            isConfirmed: i === 0
          }
        });
      }

      console.log(`✅ Membres assignés aux sessions`);
    }

    // 8. Créer un deuxième événement plus simple
    const simpleEvent = await prisma.schedule.create({
      data: {
        title: 'Répétition Hebdomadaire',
        description: 'Répétition pour préparer le prochain service',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        startTime: '19:00',
        endTime: '21:00',
        type: 'REPETITION',
        status: 'PLANNED',
        location: 'Salle de Répétition',
        hasMultipleSessions: false,
        sessionCount: 1,
        churchId: admin.churchId,
        createdById: admin.id
      }
    });

    // Assigner quelques musiciens à la répétition
    if (musicians.length > 0) {
      for (let i = 0; i < Math.min(2, musicians.length); i++) {
        await prisma.eventTeamMember.create({
          data: {
            scheduleId: simpleEvent.id,
            userId: musicians[i].id,
            churchId: admin.churchId,
            role: i === 0 ? 'Piano' : 'Guitare',
            assignedById: admin.id
          }
        });
      }
    }

    console.log(`✅ Deuxième événement créé: ${simpleEvent.title}`);

    console.log('\n✅ Données de test créées avec succès !');
    console.log('\n📋 Données créées :');
    console.log('   🎵 2 événements de test');
    console.log('   👥 Équipes avec directeurs et membres');
    console.log('   🎭 2 sessions avec leurs équipes');
    console.log('   📝 Rôles et notes d\'assignation');
    console.log('\n🌐 Vous pouvez maintenant tester la page: /app/team/events');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupTestData() {
  console.log('🧹 Nettoyage des données de test...');
  
  try {
    // Supprimer dans l'ordre inverse des dépendances
    await prisma.sessionMember.deleteMany({});
    await prisma.sessionDirector.deleteMany({});
    await prisma.eventSession.deleteMany({});
    await prisma.eventTeamMember.deleteMany({});
    await prisma.eventDirector.deleteMany({});
    
    // Supprimer les événements de test
    const deletedSchedules = await prisma.schedule.deleteMany({
      where: {
        title: {
          in: ['Service Dominical Test', 'Répétition Hebdomadaire']
        }
      }
    });
    
    console.log(`✅ ${deletedSchedules.count} événement(s) de test supprimé(s)`);
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Vérifier l'argument de ligne de commande
const action = process.argv[2];

if (action === 'cleanup') {
  cleanupTestData();
} else {
  createTestTeamEvents();
}