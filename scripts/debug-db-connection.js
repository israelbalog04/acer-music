const { PrismaClient } = require('@prisma/client');

console.log('🔍 Diagnostic de connexion à la base de données Supabase');
console.log('=' .repeat(60));

// Configuration de Prisma avec retry et timeout
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

// Écouter les événements de log
prisma.$on('query', (e) => {
  console.log('🔍 Query:', e.query);
  console.log('⏱️  Duration:', e.duration + 'ms');
});

async function testConnection() {
  try {
    console.log('📋 Configuration détectée:');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log('');

    // Test de connexion simple
    console.log('🔌 Test de connexion initiale...');
    await prisma.$connect();
    console.log('✅ Connexion réussie');

    // Test de requête simple
    console.log('📊 Test de requête simple...');
    const userCount = await prisma.user.count();
    console.log(`✅ Nombre d'utilisateurs: ${userCount}`);

    // Test de requête plus complexe
    console.log('🔍 Test de requête complexe...');
    const churches = await prisma.church.findMany({
      include: {
        users: {
          take: 1
        }
      }
    });
    console.log(`✅ Églises trouvées: ${churches.length}`);

    // Test de performance
    console.log('⚡ Test de performance...');
    const startTime = Date.now();
    await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });
    const endTime = Date.now();
    console.log(`✅ Requête exécutée en ${endTime - startTime}ms`);

    await prisma.$disconnect();
    console.log('✅ Déconnexion réussie');

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('');
    
    // Analyse de l'erreur
    if (error.message.includes('Can\'t reach database server')) {
      console.log('🔧 Solutions possibles:');
      console.log('   1. Vérifiez que Supabase est actif');
      console.log('   2. Vérifiez les paramètres de connexion');
      console.log('   3. Vérifiez les restrictions IP');
      console.log('   4. Utilisez DIRECT_URL pour éviter le pooler');
    }
    
    if (error.message.includes('pooler')) {
      console.log('🌊 Problème avec le pooler Supabase:');
      console.log('   • Le pooler peut être temporairement indisponible');
      console.log('   • Utilisez DIRECT_URL pour une connexion directe');
      console.log('   • Vérifiez les quotas de connexion');
    }
  }
}

async function testWithRetry() {
  console.log('🔄 Test avec retry automatique...');
  console.log('=' .repeat(60));
  
  const maxRetries = 3;
  let attempt = 1;
  
  while (attempt <= maxRetries) {
    try {
      console.log(`📋 Tentative ${attempt}/${maxRetries}...`);
      await prisma.$connect();
      
      const userCount = await prisma.user.count();
      console.log(`✅ Connexion réussie - Utilisateurs: ${userCount}`);
      
      await prisma.$disconnect();
      return true;
      
    } catch (error) {
      console.log(`❌ Tentative ${attempt} échouée: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Attente de ${delay}ms avant la prochaine tentative...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      attempt++;
    }
  }
  
  console.log('❌ Toutes les tentatives ont échoué');
  return false;
}

async function testConnectionPool() {
  console.log('🌊 Test du pool de connexions...');
  console.log('=' .repeat(60));
  
  try {
    // Test avec plusieurs connexions simultanées
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        prisma.user.count().then(count => {
          console.log(`✅ Connexion ${i + 1}: ${count} utilisateurs`);
          return count;
        })
      );
    }
    
    const results = await Promise.all(promises);
    console.log(`✅ Toutes les connexions réussies: ${results.length}`);
    
  } catch (error) {
    console.error('❌ Erreur avec le pool:', error.message);
  }
}

async function checkEnvironment() {
  console.log('🔧 Vérification de l\'environnement...');
  console.log('=' .repeat(60));
  
  console.log('📋 Variables d\'environnement:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Non défini'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Configuré' : 'Non configuré'}`);
  console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? 'Configuré' : 'Non configuré'}`);
  
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    if (url.includes('pooler.supabase.com')) {
      console.log('🌊 Utilise le pooler Supabase');
    } else if (url.includes('supabase.com')) {
      console.log('🔗 Utilise la connexion directe Supabase');
    }
  }
  
  console.log('');
  console.log('📦 Informations système:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Architecture: ${process.arch}`);
}

async function suggestSolutions() {
  console.log('💡 Suggestions de solutions...');
  console.log('=' .repeat(60));
  
  console.log('1. 🔧 Configuration Supabase:');
  console.log('   • Vérifiez que votre projet Supabase est actif');
  console.log('   • Vérifiez les paramètres de connexion dans le dashboard');
  console.log('   • Vérifiez les restrictions IP si configurées');
  console.log('');
  
  console.log('2. 🌊 Problèmes de pooler:');
  console.log('   • Le pooler peut être temporairement indisponible');
  console.log('   • Utilisez DIRECT_URL pour éviter le pooler');
  console.log('   • Vérifiez les quotas de connexion');
  console.log('');
  
  console.log('3. 🔄 Configuration Prisma:');
  console.log('   • Ajoutez des retry automatiques');
  console.log('   • Configurez des timeouts appropriés');
  console.log('   • Utilisez des connexions persistantes');
  console.log('');
  
  console.log('4. 📊 Monitoring:');
  console.log('   • Surveillez les métriques de connexion');
  console.log('   • Configurez des alertes en cas de déconnexion');
  console.log('   • Loggez les erreurs de connexion');
}

// Fonction principale
async function runDiagnostics() {
  console.log('🚀 Démarrage du diagnostic...\n');
  
  await checkEnvironment();
  console.log('');
  
  await testConnection();
  console.log('');
  
  await testWithRetry();
  console.log('');
  
  await testConnectionPool();
  console.log('');
  
  await suggestSolutions();
  
  await prisma.$disconnect();
}

// Exécuter le diagnostic
runDiagnostics().catch(console.error);
