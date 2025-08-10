const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCompleteTeam() {
  console.log('🧪 Ajout d\'une équipe complète pour comparaison');
  
  try {
    const users = await prisma.user.findMany();
    const admin = users.find(u => u.role === 'ADMIN');
    const musicians = users.filter(u => u.role === 'MUSICIEN');

    if (!admin || musicians.length < 2) {
      console.log('❌ Pas assez d\'utilisateurs');
      return;
    }

    // Créer un événement SERVICE avec équipe COMPLÈTE
    const completeServiceEvent = await prisma.schedule.create({
      data: {
        title: 'Test Service Complet',
        description: 'Service avec équipe complète et bien organisée',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        startTime: '10:30',
        endTime: '12:30',
        type: 'SERVICE',
        status: 'PLANNED',
        location: 'Sanctuaire Principal',
        churchId: admin.churchId,
        createdById: admin.id
      }
    });

    // Assigner tous les rôles requis
    const roles = [
      { role: 'Piano Principal', instrument: 'Piano' },
      { role: 'Guitare Lead', instrument: 'Guitare' },
      { role: 'Chant Lead', instrument: 'Chant' },
      { role: 'Basse', instrument: 'Basse' },
      { role: 'Batterie', instrument: 'Batterie' }
    ];

    // Utiliser les musiciens disponibles (même si c'est les mêmes)
    for (let i = 0; i < Math.min(roles.length, musicians.length); i++) {
      await prisma.eventTeamMember.create({
        data: {
          scheduleId: completeServiceEvent.id,
          userId: musicians[i % musicians.length].id, // Réutiliser les musiciens si nécessaire
          churchId: admin.churchId,
          role: roles[i].role,
          assignedById: admin.id,
          notes: `Assigné comme ${roles[i].role} - équipe complète`
        }
      });
    }

    // Si on a plus de musiciens, ajouter des rôles optionnels
    if (musicians.length > roles.length) {
      const optionalRoles = ['Choriste', 'Violon'];
      for (let i = roles.length; i < Math.min(roles.length + optionalRoles.length, musicians.length); i++) {
        await prisma.eventTeamMember.create({
          data: {
            scheduleId: completeServiceEvent.id,
            userId: musicians[i].id,
            churchId: admin.churchId,
            role: optionalRoles[i - roles.length],
            assignedById: admin.id,
            notes: 'Rôle optionnel pour enrichir la louange'
          }
        });
      }
    }

    console.log('✅ Événement SERVICE complet créé');
    console.log(`   • ${Math.min(roles.length, musicians.length)} membres assignés`);
    console.log('   • Tous les rôles critiques couverts');
    console.log('   • Statut attendu: Équipe complète ✅');

    console.log('\n🌐 Vous avez maintenant 4 types d\'événements pour tester:');
    console.log('   🔴 Service Incomplet (besoins critiques)');
    console.log('   🟠 Répétition Partielle (besoins importants)'); 
    console.log('   🟡 Concert Sous-dimensionné (besoins critiques multiples)');
    console.log('   🟢 Service Complet (équipe satisfaisante)');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCompleteTeam();