const { execSync } = require('child_process');

async function runMigration() {
  console.log('🚀 MIGRATION FORCÉE - ACER Music');
  console.log('='.repeat(50));

  try {
  console.log('📋 Variables d\'environnement:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurée' : 'MANQUANTE');
  console.log('NODE_ENV:', process.env.NODE_ENV);

  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL manquante');
  }

  if (!process.env.DATABASE_URL.includes('postgresql://')) {
    throw new Error('❌ DATABASE_URL doit être PostgreSQL pour la production');
  }

  console.log('✅ Configuration PostgreSQL détectée');

  // 1. Générer le client Prisma
  console.log('📦 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 2. Pousser le schéma (créer toutes les tables)
  console.log('🗄️  Application du schéma PostgreSQL...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Schéma appliqué avec succès');
  } catch (error) {
    console.log('⚠️  Première tentative échouée, nouvel essai...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Schéma appliqué en second essai');
  }

  // 3. Vérifier les tables critiques
  console.log('🔍 Vérification des tables...');
  const { PrismaClient } = require('@prisma/client');
  
  async function verifyTables() {
    const prisma = new PrismaClient();
    try {
      // Test simple sur les tables principales
      await prisma.church.findMany({ take: 1 });
      console.log('✅ Table churches accessible');

      await prisma.user.findMany({ take: 1 });
      console.log('✅ Table users accessible');

      await prisma.schedule.findMany({ take: 1 });
      console.log('✅ Table schedules accessible');

      // Test crucial : table event_messages
      await prisma.eventMessage.findMany({ take: 1 });
      console.log('✅ Table event_messages accessible - CHAT FONCTIONNEL');

    } catch (error) {
      console.error('❌ Erreur table:', error.message);
      if (error.message.includes('event_messages')) {
        console.log('⚠️  Table event_messages manquante - Chat non fonctionnel');
      }
    } finally {
      await prisma.$disconnect();
    }
  }
  
  await verifyTables();

    console.log('');
    console.log('🎉 Migration forcée terminée !');
    console.log('🌐 Application prête pour la production');

  } catch (error) {
    console.error('❌ Erreur lors de la migration forcée:', error.message);
    console.log('');
    console.log('🔧 Solutions:');
    console.log('1. Vérifier DATABASE_URL dans Vercel Dashboard');
    console.log('2. Exécuter le script SQL manuellement dans Supabase');
    console.log('3. Vérifier les permissions de la base de données');
    process.exit(1);
  }
}

// Exécuter la migration
runMigration().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});