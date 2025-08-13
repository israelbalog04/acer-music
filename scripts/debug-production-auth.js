const { PrismaClient } = require('@prisma/client');

async function debugProductionAuth() {
  console.log('🔍 Diagnostic de l\'authentification en production...');
  
  // Vérification des variables d'environnement critiques
  console.log('\n📋 Variables d\'environnement critiques:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : '❌ Manquante');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Définie' : '❌ Manquante');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Définie' : '❌ Manquante');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Non définie');

  if (!process.env.DATABASE_URL) {
    console.log('\n❌ DATABASE_URL manquante!');
    console.log('💡 Configurez cette variable dans Vercel:');
    console.log('   DATABASE_URL=postgresql://postgres:7cybzSYO0zZEoaUu@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres');
    return;
  }

  // Test de connexion Prisma
  console.log('\n🔌 Test de connexion Prisma...');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log('✅ Connexion Prisma réussie');

    // Test de requête simple
    console.log('\n📊 Test de requête simple...');
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Requête réussie:', result);

    // Vérifier les tables essentielles pour NextAuth
    console.log('\n📋 Vérification des tables NextAuth...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE' 
      AND table_name IN ('users', 'accounts', 'sessions', 'verificationtokens')
      ORDER BY table_name
    `;
    
    const requiredTables = ['users', 'accounts', 'sessions', 'verificationtokens'];
    const foundTables = tables.map(t => t.table_name);
    
    console.log(`✅ Tables trouvées: ${foundTables.join(', ')}`);
    
    const missingTables = requiredTables.filter(table => !foundTables.includes(table));
    if (missingTables.length > 0) {
      console.log(`❌ Tables manquantes: ${missingTables.join(', ')}`);
      console.log('💡 Exécutez: npm run setup-prod-db');
    }

    // Test de la table users
    if (foundTables.includes('users')) {
      console.log('\n👥 Test de la table users...');
      const userCount = await prisma.user.count();
      console.log(`✅ ${userCount} utilisateurs trouvés`);
      
      if (userCount > 0) {
        const sampleUser = await prisma.user.findFirst({
          select: { id: true, email: true, role: true, isApproved: true }
        });
        console.log('✅ Exemple d\'utilisateur:', sampleUser);
      }
    }

    // Test de la table churches
    console.log('\n🏛️ Test de la table churches...');
    const churchCount = await prisma.church.count();
    console.log(`✅ ${churchCount} églises trouvées`);
    
    if (churchCount > 0) {
      const churches = await prisma.church.findMany({
        select: { id: true, name: true, city: true, isActive: true }
      });
      console.log('✅ Églises:', churches);
    }

  } catch (error) {
    console.error('\n❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔍 Diagnostic:');
      console.log('1. Vérifiez que l\'URL de la base de données est correcte');
      console.log('2. Vérifiez que Supabase est actif');
      console.log('3. Vérifiez les politiques RLS dans Supabase');
      console.log('4. Vérifiez que l\'IP de Vercel est autorisée');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Diagnostic:');
      console.log('1. Vérifiez les identifiants de connexion');
      console.log('2. Vérifiez que l\'utilisateur a les droits suffisants');
      console.log('3. Vérifiez le mot de passe dans Supabase Dashboard');
    } else if (error.message.includes('does not exist')) {
      console.log('\n🔍 Diagnostic:');
      console.log('1. Les tables n\'existent pas');
      console.log('2. Exécutez: npm run setup-prod-db');
    }
    
    console.log('\n💡 Solutions:');
    console.log('1. Vérifiez les variables d\'environnement dans Vercel');
    console.log('2. Redéployez l\'application après mise à jour des variables');
    console.log('3. Vérifiez la configuration Supabase');
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du diagnostic
if (require.main === module) {
  debugProductionAuth()
    .then(() => {
      console.log('\n✅ Diagnostic terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { debugProductionAuth };
