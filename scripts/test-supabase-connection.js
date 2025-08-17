const { PrismaClient } = require('@prisma/client');

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion à Supabase...');
  
  // Afficher les variables d'environnement (sans les valeurs sensibles)
  console.log('\n📋 Variables d\'environnement:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 
    `${process.env.DATABASE_URL.substring(0, 20)}...` : '❌ Manquante');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 
    '✅ Définie' : '❌ Manquante');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
    '✅ Définie' : '❌ Manquante');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 
    '✅ Définie' : '❌ Manquante');

  if (!process.env.DATABASE_URL) {
    console.log('\n❌ DATABASE_URL manquante!');
    console.log('💡 Configurez cette variable dans Vercel:');
    console.log('   - Allez dans votre projet Vercel');
    console.log('   - Settings > Environment Variables');
    console.log('   - Ajoutez DATABASE_URL avec votre URL Supabase');
    return;
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('\n🔌 Tentative de connexion...');
    await prisma.$connect();
    console.log('✅ Connexion réussie!');

    // Test simple de requête
    console.log('\n📊 Test de requête...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Requête réussie:', result);

    // Vérifier les tables
    console.log('\n📋 Vérification des tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`✅ ${tables.length} tables trouvées:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Test de l'église
    console.log('\n🏛️ Test de l\'église...');
    const churches = await prisma.church.findMany({
      select: { id: true, name: true, city: true }
    });
    console.log(`✅ ${churches.length} églises trouvées:`, churches);

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
    } else if (error.message.includes('does not exist')) {
      console.log('\n🔍 Diagnostic:');
      console.log('1. Les tables n\'existent pas');
      console.log('2. Exécutez: npm run setup-prod-db');
    }
    
    console.log('\n💡 Solutions:');
    console.log('1. Configurez les variables d\'environnement dans Vercel');
    console.log('2. Vérifiez la configuration Supabase');
    console.log('3. Exécutez: npm run setup-prod-db');
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  testSupabaseConnection()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testSupabaseConnection };
