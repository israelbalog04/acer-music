const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function finalCleanup() {
  try {
    console.log('🧹 NETTOYAGE FINAL DE TOUTES LES DONNÉES DE TEST\n');

    // 1. Supprimer tous les utilisateurs qui ne sont pas les 3 comptes officiels ACER Paris
    const officialEmails = [
      'admin@acerparis.fr',
      'responsable@acerparis.fr', 
      'musicien@acerparis.fr'
    ];

    console.log('👥 Suppression des utilisateurs de test...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          notIn: officialEmails
        }
      }
    });
    console.log(`   ✅ ${deletedUsers.count} utilisateur(s) de test supprimé(s)\n`);

    // 2. Supprimer toutes les chansons de test
    console.log('🎵 Suppression des chansons de test...');
    const deletedSongs = await prisma.song.deleteMany({});
    console.log(`   ✅ ${deletedSongs.count} chanson(s) de test supprimée(s)\n`);

    // 3. Supprimer tous les événements/horaires de test
    console.log('📅 Suppression des événements de test...');
    const deletedSchedules = await prisma.schedule.deleteMany({});
    console.log(`   ✅ ${deletedSchedules.count} événement(s) de test supprimé(s)\n`);

    // 4. Supprimer toutes les disponibilités de test
    console.log('✅ Suppression des disponibilités de test...');
    const deletedAvailabilities = await prisma.availability.deleteMany({});
    console.log(`   ✅ ${deletedAvailabilities.count} disponibilité(s) de test supprimée(s)\n`);

    // 5. Supprimer toutes les séquences de test
    console.log('🎼 Suppression des séquences de test...');
    const deletedSequences = await prisma.sequence.deleteMany({});
    console.log(`   ✅ ${deletedSequences.count} séquence(s) de test supprimée(s)\n`);

    // 6. Supprimer tous les enregistrements de test
    console.log('🎙️  Suppression des enregistrements de test...');
    const deletedRecordings = await prisma.recording.deleteMany({});
    console.log(`   ✅ ${deletedRecordings.count} enregistrement(s) de test supprimé(s)\n`);

    // 7. Supprimer toutes les équipes de test
    console.log('👥 Suppression des équipes de test...');
    const deletedTeams = await prisma.team.deleteMany({});
    console.log(`   ✅ ${deletedTeams.count} équipe(s) de test supprimée(s)\n`);

    // 8. Supprimer tous les directeurs d'événements de test
    console.log('⭐ Suppression des directeurs d\'événements de test...');
    const deletedDirectors = await prisma.eventDirector.deleteMany({});
    console.log(`   ✅ ${deletedDirectors.count} directeur(s) d'événement supprimé(s)\n`);

    // 9. Supprimer tous les téléchargements de séquences de test
    console.log('⬇️  Suppression des téléchargements de test...');
    const deletedDownloads = await prisma.sequenceDownload.deleteMany({});
    console.log(`   ✅ ${deletedDownloads.count} téléchargement(s) supprimé(s)\n`);

    // 10. Nettoyer les églises qui ne sont pas ACER Paris
    console.log('🏛️  Suppression des églises de test...');
    const deletedChurches = await prisma.church.deleteMany({
      where: {
        name: {
          not: 'ACER Paris'
        }
      }
    });
    console.log(`   ✅ ${deletedChurches.count} église(s) de test supprimée(s)\n`);

    // Vérification finale
    console.log('🔍 VÉRIFICATION FINALE:\n');
    
    const finalUsers = await prisma.user.findMany({
      include: { church: true }
    });
    console.log('👥 Utilisateurs restants:');
    finalUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
    const finalChurches = await prisma.church.findMany();
    console.log('\n🏛️  Églises restantes:');
    finalChurches.forEach(church => {
      console.log(`   - ${church.name} (${church.city})`);
    });

    console.log('\n✨ NETTOYAGE TERMINÉ ! La base de données ne contient plus que les données de production.');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanup();