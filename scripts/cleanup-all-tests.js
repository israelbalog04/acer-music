const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupAllTests() {
  console.log('🧹 Nettoyage de toutes les données de test...');
  
  try {
    // Supprimer dans l'ordre inverse des dépendances
    const deleted1 = await prisma.sessionMember.deleteMany({});
    const deleted2 = await prisma.sessionDirector.deleteMany({});
    const deleted3 = await prisma.eventSession.deleteMany({});
    const deleted4 = await prisma.eventTeamMember.deleteMany({});
    const deleted5 = await prisma.eventDirector.deleteMany({});
    
    // Supprimer tous les événements de test
    const deletedSchedules = await prisma.schedule.deleteMany({
      where: {
        OR: [
          { title: { startsWith: 'Service Dominical Test' } },
          { title: { startsWith: 'Répétition Hebdomadaire' } },
          { title: { startsWith: 'Test ' } }
        ]
      }
    });
    
    console.log(`✅ Données supprimées:`);
    console.log(`   - ${deleted1.count} membres de session`);
    console.log(`   - ${deleted2.count} directeurs de session`);
    console.log(`   - ${deleted3.count} sessions d'événements`);
    console.log(`   - ${deleted4.count} membres d'équipe d'événements`);
    console.log(`   - ${deleted5.count} directeurs d'événements`);
    console.log(`   - ${deletedSchedules.count} événements de test`);
    
    console.log('\n✅ Nettoyage terminé - Base de données propre');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllTests();