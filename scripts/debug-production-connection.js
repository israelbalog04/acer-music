const { PrismaClient } = require('@prisma/client');

async function debugProductionConnection() {
  console.log('🔍 Diagnostic de la connexion de production...');
  
  // Vérification des variables d'environnement
  console.log('\n📋 Variables d\'environnement:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : '❌ Manquante');
  console.log('DIRECT_URL:', process.env.DIRECT_URL ? `${process.env.DIRECT_URL.substring(0, 30)}...` : '❌ Manquante');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Définie' : '❌ Manquante');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Définie' : '❌ Manquante');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ Manquante');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Définie' : '❌ Manquante');

  if (!process.env.DATABASE_URL) {
    console.log('\n❌ DATABASE_URL manquante!');
    console.log('💡 Configurez cette variable dans Vercel:');
    console.log('   DATABASE_URL=postgresql://postgres:1QY5JNhPLYsEnCAA@db.kvjntbmainapryjjjouo.supabase.co:5432/postgres');
    return;
  }

  // Extraire les informations de l'URL
  const dbUrl = process.env.DATABASE_URL;
  const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (urlMatch) {
    const [, user, password, host, port, database] = urlMatch;
    console.log('\n🔍 Analyse de l\'URL de connexion:');
    console.log(`   - Utilisateur: ${user}`);
    console.log(`   - Mot de passe: ${password.substring(0, 4)}...`);
    console.log(`   - Host: ${host}`);
    console.log(`   - Port: ${port}`);
    console.log(`   - Base de données: ${database}`);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['query', 'info', 'warn', 'error']
  });

  try {
    console.log('\n🔌 Tentative de connexion...');
    await prisma.$connect();
    console.log('✅ Connexion réussie!');

    console.log('\n📊 Test de requête simple...');
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    console.log('✅ Requête réussie:', result);

    console.log('\n📋 Vérification des tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE' 
      ORDER BY table_name
    `;
    console.log(`✅ ${tables.length} tables trouvées`);

    console.log('\n🏛️ Vérification des églises...');
    const churches = await prisma.church.findMany({
      select: { id: true, name: true, city: true, isActive: true }
    });
    console.log(`✅ ${churches.length} églises trouvées:`, churches);

    console.log('\n👥 Vérification des utilisateurs...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isApproved: true }
    });
    console.log(`✅ ${users.length} utilisateurs trouvés`);

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
  debugProductionConnection()
    .then(() => {
      console.log('\n✅ Diagnostic terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { debugProductionConnection };
