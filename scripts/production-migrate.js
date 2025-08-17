#!/usr/bin/env node

/**
 * Script de migration robuste pour la production
 * Utilisé par GitHub Actions et Vercel
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

console.log('🚀 MIGRATION PRODUCTION - ACER Music');
console.log('=====================================');
console.log('📅', new Date().toISOString());

async function runMigration() {
  let prisma;
  
  try {
    // 1. Vérification des variables d'environnement
    console.log('\n🔍 Vérification de l\'environnement...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables d\'environnement manquantes:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      process.exit(1);
    }
    
    console.log('✅ Variables d\'environnement validées');
    
    // Vérifier que c'est bien PostgreSQL
    if (!process.env.DATABASE_URL.includes('postgresql://')) {
      console.error('❌ DATABASE_URL doit être PostgreSQL pour la production');
      process.exit(1);
    }
    
    console.log('✅ Base de données PostgreSQL confirmée');
    
    // 2. Génération du client Prisma
    console.log('\n📦 Génération du client Prisma...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Client Prisma généré');
    } catch (error) {
      console.error('❌ Erreur génération client Prisma:', error.message);
      process.exit(1);
    }
    
    // 3. Migration de la base de données
    console.log('\n🗄️ Migration de la base de données...');
    try {
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      });
      console.log('✅ Migration réussie');
    } catch (error) {
      console.warn('⚠️ Première tentative échouée, nouvel essai...');
      try {
        execSync('npx prisma db push', { 
          stdio: 'inherit',
          timeout: 120000
        });
        console.log('✅ Migration réussie au second essai');
      } catch (retryError) {
        console.error('❌ Erreur migration:', retryError.message);
        process.exit(1);
      }
    }
    
    // 4. Test de connexion et validation des tables
    console.log('\n🧪 Test de connexion à la base de données...');
    prisma = new PrismaClient();
    
    // Test des tables essentielles
    const tests = [
      { name: 'churches', query: () => prisma.church.findMany({ take: 1 }) },
      { name: 'users', query: () => prisma.user.findMany({ take: 1 }) },
      { name: 'schedules', query: () => prisma.schedule.findMany({ take: 1 }) },
      { name: 'songs', query: () => prisma.song.findMany({ take: 1 }) },
      { name: 'recordings', query: () => prisma.recording.findMany({ take: 1 }) }
    ];
    
    for (const test of tests) {
      try {
        await test.query();
        console.log(`✅ Table ${test.name} accessible`);
      } catch (error) {
        console.error(`❌ Erreur table ${test.name}:`, error.message);
        process.exit(1);
      }
    }
    
    // 5. Validation des données critiques
    console.log('\n🔍 Validation des données...');
    
    const churchCount = await prisma.church.count();
    console.log(`📊 Églises: ${churchCount}`);
    
    const userCount = await prisma.user.count();
    console.log(`👥 Utilisateurs: ${userCount}`);
    
    const songCount = await prisma.song.count();
    console.log(`🎵 Morceaux: ${songCount}`);
    
    // 6. Vérification du super admin
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (superAdmins.length === 0) {
      console.warn('⚠️ Aucun super administrateur trouvé');
      console.log('💡 Exécutez le script create-super-admin.js après le déploiement');
    } else {
      console.log(`✅ ${superAdmins.length} super administrateur(s) configuré(s)`);
      superAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.firstName} ${admin.lastName})`);
      });
    }
    
    console.log('\n🎉 Migration terminée avec succès !');
    console.log('🌐 Application prête pour la production');
    
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE lors de la migration:', error.message);
    console.log('\n🔧 Actions recommandées:');
    console.log('1. Vérifier la connexion à la base de données');
    console.log('2. Vérifier les permissions de l\'utilisateur DB');
    console.log('3. Vérifier la validité du schéma Prisma');
    console.log('4. Contacter l\'équipe technique si le problème persiste');
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Gestion des signaux pour un arrêt propre
process.on('SIGINT', async () => {
  console.log('\n⚠️ Migration interrompue par l\'utilisateur');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Migration interrompue par le système');
  process.exit(1);
});

// Exécution principale
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ Script de migration terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };