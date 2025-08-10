const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTeamNeeds() {
  console.log('🧪 Test du système de détection des besoins d\'équipe');
  
  try {
    // 1. Nettoyer les données de test précédentes
    await prisma.sessionMember.deleteMany({});
    await prisma.sessionDirector.deleteMany({});
    await prisma.eventSession.deleteMany({});
    await prisma.eventTeamMember.deleteMany({});
    await prisma.eventDirector.deleteMany({});
    await prisma.schedule.deleteMany({
      where: { title: { startsWith: 'Test ' } }
    });

    // 2. Récupérer les utilisateurs
    const users = await prisma.user.findMany();
    const admin = users.find(u => u.role === 'ADMIN');
    const musicians = users.filter(u => u.role === 'MUSICIEN');

    if (!admin || musicians.length < 2) {
      console.log('❌ Pas assez d\'utilisateurs pour le test');
      return;
    }

    // 3. Créer un événement SERVICE avec équipe INCOMPLETE (manque des instruments critiques)
    const incompleteServiceEvent = await prisma.schedule.create({
      data: {
        title: 'Test Service Incomplet',
        description: 'Service avec équipe incomplète pour tester la détection',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '12:00',
        type: 'SERVICE',
        status: 'PLANNED',
        location: 'Sanctuaire',
        churchId: admin.churchId,
        createdById: admin.id
      }
    });

    // Assigner seulement UN pianiste (manque guitare, chant, basse, batterie)
    if (musicians[0]) {
      await prisma.eventTeamMember.create({
        data: {
          scheduleId: incompleteServiceEvent.id,
          userId: musicians[0].id,
          churchId: admin.churchId,
          role: 'Piano Principal',
          assignedById: admin.id
        }
      });
    }

    console.log('✅ Événement SERVICE incomplet créé (seulement piano)');

    // 4. Créer un événement REPETITION avec équipe PARTIELLEMENT COMPLETE
    const partialRepetitionEvent = await prisma.schedule.create({
      data: {
        title: 'Test Répétition Partielle',
        description: 'Répétition avec équipe partiellement complète',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        startTime: '19:00',
        endTime: '21:00',
        type: 'REPETITION',
        status: 'PLANNED',
        location: 'Salle de répétition',
        churchId: admin.churchId,
        createdById: admin.id
      }
    });

    // Assigner piano et guitare (manque chant pour une répétition)
    if (musicians[0]) {
      await prisma.eventTeamMember.create({
        data: {
          scheduleId: partialRepetitionEvent.id,
          userId: musicians[0].id,
          churchId: admin.churchId,
          role: 'Pianiste',
          assignedById: admin.id
        }
      });
    }

    if (musicians[1]) {
      await prisma.eventTeamMember.create({
        data: {
          scheduleId: partialRepetitionEvent.id,
          userId: musicians[1].id,
          churchId: admin.churchId,
          role: 'Guitariste',
          assignedById: admin.id
        }
      });
    }

    console.log('✅ Événement REPETITION partiel créé (piano + guitare, manque chant)');

    // 5. Créer un événement CONCERT avec équipe SOUS-DIMENSIONNÉE
    const concertEvent = await prisma.schedule.create({
      data: {
        title: 'Test Concert Sous-dimensionné',
        description: 'Concert avec trop peu de musiciens',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '20:00',
        endTime: '22:00',
        type: 'CONCERT',
        status: 'PLANNED',
        location: 'Auditorium',
        churchId: admin.churchId,
        createdById: admin.id
      }
    });

    // Assigner seulement 2 personnes pour un concert (besoins minimums non remplis)
    if (musicians[0]) {
      await prisma.eventTeamMember.create({
        data: {
          scheduleId: concertEvent.id,
          userId: musicians[0].id,
          churchId: admin.churchId,
          role: 'Piano Principal',
          assignedById: admin.id
        }
      });
    }

    if (musicians[1]) {
      await prisma.eventTeamMember.create({
        data: {
          scheduleId: concertEvent.id,
          userId: musicians[1].id,
          churchId: admin.churchId,
          role: 'Chant Lead',
          assignedById: admin.id
        }
      });
    }

    console.log('✅ Événement CONCERT sous-dimensionné créé (piano + chant seulement)');

    // 6. Simuler l'analyse des besoins
    console.log('\n📋 Analyse des besoins (simulée):');
    
    console.log('\n🔴 Service Incomplet:');
    console.log('   • CRITIQUES: Guitare (1 manquant), Chant (1 manquant), Basse (1 manquant), Batterie (1 manquant)');
    console.log('   • Statut: Équipe incomplète');
    console.log('   • Membres: 1/4 minimum requis');

    console.log('\n🟠 Répétition Partielle:');
    console.log('   • IMPORTANTS: Chant (1 manquant)');
    console.log('   • Statut: À compléter');
    console.log('   • Membres: 2/3 minimum requis');

    console.log('\n🟡 Concert Sous-dimensionné:');
    console.log('   • CRITIQUES: Guitare (1 manquant), Basse (1 manquant), Batterie (1 manquant), Violon (1 manquant)');
    console.log('   • Statut: Équipe incomplète');
    console.log('   • Membres: 2/6 minimum requis');

    console.log('\n✅ Données de test créées pour la détection des besoins !');
    console.log('\n🌐 Testez maintenant la page: /app/team/events');
    console.log('   - Vous devriez voir les badges de statut colorés');
    console.log('   - Les détails des instruments manquants apparaîtront');
    console.log('   - Les indicateurs critiques/importants/optionnels');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTeamNeeds();