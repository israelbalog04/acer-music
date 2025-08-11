const { PrismaClient } = require('@prisma/client');

async function checkDBStatus() {
  console.log('🔍 Vérification de l\'état de la base de données...');
  
  const prisma = new PrismaClient();

  try {
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Vérifier les tables existantes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`📊 Nombre de tables trouvées: ${tables.length}`);
    console.log('📋 Tables disponibles:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Vérifier les églises
    const churches = await prisma.church.findMany({
      select: { id: true, name: true, city: true, isActive: true }
    });
    
    console.log(`\n🏛️ Nombre d'églises: ${churches.length}`);
    churches.forEach(church => {
      console.log(`   - ${church.name} (${church.city}) - ${church.isActive ? 'Active' : 'Inactive'}`);
    });

    // Vérifier les utilisateurs
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isApproved: true }
    });
    
    console.log(`\n👥 Nombre d'utilisateurs: ${users.length}`);
    const approvedUsers = users.filter(u => u.isApproved);
    const pendingUsers = users.filter(u => !u.isApproved);
    console.log(`   - Approuvés: ${approvedUsers.length}`);
    console.log(`   - En attente: ${pendingUsers.length}`);

    // Vérifier les chansons
    const songs = await prisma.song.count();
    console.log(`\n🎵 Nombre de chansons: ${songs}`);

    // Vérifier les événements
    const schedules = await prisma.schedule.count();
    console.log(`📅 Nombre d'événements: ${schedules}`);

    console.log('\n✅ Vérification terminée avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    
    if (error.code === 'P1001') {
      console.log('💡 Suggestion: Vérifiez la variable DATABASE_URL');
    } else if (error.code === 'P2002') {
      console.log('💡 Suggestion: Problème de contrainte unique');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('💡 Suggestion: Les tables n\'existent pas. Exécutez: npm run setup-prod-db');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  checkDBStatus()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { checkDBStatus };
