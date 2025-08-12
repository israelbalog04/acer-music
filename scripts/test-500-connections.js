const { testConcurrentConnections, pooledPrisma } = require('../src/lib/prisma-pool.ts');

console.log('🌊 Test de 500 connexions simultanées Supabase');
console.log('=' .repeat(60));

async function test500Connections() {
  try {
    console.log('📋 Configuration:');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`   Pool Max: 500 connexions simultanées`);
    console.log('');

    // Test 1: 100 connexions simultanées
    console.log('🧪 Test 1: 100 connexions simultanées');
    console.log('-'.repeat(40));
    await testConcurrentConnections(100);
    console.log('');

    // Test 2: 250 connexions simultanées
    console.log('🧪 Test 2: 250 connexions simultanées');
    console.log('-'.repeat(40));
    await testConcurrentConnections(250);
    console.log('');

    // Test 3: 500 connexions simultanées
    console.log('🧪 Test 3: 500 connexions simultanées');
    console.log('-'.repeat(40));
    await testConcurrentConnections(500);
    console.log('');

    // Test 4: 750 connexions simultanées (dépassement du pool)
    console.log('🧪 Test 4: 750 connexions simultanées (dépassement du pool)');
    console.log('-'.repeat(40));
    await testConcurrentConnections(750);
    console.log('');

    // Test 5: 1000 connexions simultanées (stress test)
    console.log('🧪 Test 5: 1000 connexions simultanées (stress test)');
    console.log('-'.repeat(40));
    await testConcurrentConnections(1000);
    console.log('');

    // Afficher les statistiques finales
    console.log('📊 Statistiques finales du pool:');
    console.log(pooledPrisma.getPoolStats());

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await pooledPrisma.$disconnect();
  }
}

async function testMixedOperations500() {
  console.log('🧪 Test d\'opérations mixtes avec 500 connexions');
  console.log('-'.repeat(40));

  const promises = [];
  const startTime = Date.now();

  // Opérations de lecture (200)
  for (let i = 0; i < 200; i++) {
    promises.push(
      pooledPrisma.user.count().then(result => {
        if (i % 50 === 0) {
          console.log(`📖 Lecture ${i + 1}/200: ${result} utilisateurs`);
        }
        return { type: 'read', result };
      })
    );
  }

  // Opérations de lecture avec relations (150)
  for (let i = 0; i < 150; i++) {
    promises.push(
      pooledPrisma.church.findMany({
        include: {
          users: {
            take: 2
          }
        }
      }).then(result => {
        if (i % 50 === 0) {
          console.log(`🔗 Lecture avec relations ${i + 1}/150: ${result.length} églises`);
        }
        return { type: 'read_relations', result };
      })
    );
  }

  // Opérations de requêtes brutes (100)
  for (let i = 0; i < 100; i++) {
    promises.push(
      pooledPrisma.$queryRaw`SELECT COUNT(*) as count FROM users`.then(result => {
        if (i % 50 === 0) {
          console.log(`🔧 Requête brute ${i + 1}/100: ${result[0].count} utilisateurs`);
        }
        return { type: 'raw_query', result };
      })
    );
  }

  // Opérations de recherche complexe (50)
  for (let i = 0; i < 50; i++) {
    promises.push(
      pooledPrisma.user.findMany({
        where: {
          role: 'MUSICIEN'
        },
        include: {
          church: true,
          recordings: {
            take: 1
          }
        },
        take: 5
      }).then(result => {
        if (i % 25 === 0) {
          console.log(`🔍 Recherche complexe ${i + 1}/50: ${result.length} musiciens`);
        }
        return { type: 'complex_search', result };
      })
    );
  }

  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`🎉 Toutes les opérations mixtes réussies en ${duration}ms`);
    console.log(`📊 Répartition: ${results.length} opérations totales`);

    const stats = results.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Répartition des opérations:', stats);
    console.log(`⚡ Moyenne: ${(duration / results.length).toFixed(2)}ms par opération`);

  } catch (error) {
    console.error('❌ Erreur lors du test d\'opérations mixtes:', error);
  }
}

async function testStressTest500() {
  console.log('🔥 Test de stress: 1000 connexions rapides');
  console.log('-'.repeat(40));

  const promises = [];
  const startTime = Date.now();

  // Créer 1000 connexions rapides
  for (let i = 0; i < 1000; i++) {
    promises.push(
      pooledPrisma.user.count().then(result => {
        if (i % 100 === 0) {
          console.log(`⚡ Connexion ${i + 1}/1000: ${result} utilisateurs`);
        }
        return result;
      }).catch(error => {
        console.error(`❌ Connexion ${i + 1} échouée:`, error.message);
        throw error;
      })
    );
  }

  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`🎉 Test de stress réussi: ${results.length} connexions en ${duration}ms`);
    console.log(`📊 Moyenne: ${(duration / results.length).toFixed(2)}ms par connexion`);
    console.log('📊 Statistiques du pool:', pooledPrisma.getPoolStats());

  } catch (error) {
    console.error('❌ Erreur lors du test de stress:', error);
  }
}

async function testConnectionRecovery500() {
  console.log('🔄 Test de récupération avec 500 connexions');
  console.log('-'.repeat(40));

  try {
    // Simuler une déconnexion
    console.log('🔌 Simulation d\'une déconnexion...');
    await pooledPrisma.$disconnect();

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tenter une reconnexion
    console.log('🔌 Tentative de reconnexion...');
    await pooledPrisma.$connect();

    // Tester plusieurs opérations simultanées
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        pooledPrisma.user.count().then(result => {
          if (i % 25 === 0) {
            console.log(`✅ Reconnexion test ${i + 1}/100: ${result} utilisateurs`);
          }
          return result;
        })
      );
    }

    const results = await Promise.all(promises);
    console.log(`✅ Reconnexion réussie: ${results.length} opérations testées`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
  }
}

// Fonction principale
async function main() {
  const testType = process.argv[2] || 'all';

  console.log('🚀 Démarrage des tests de 500 connexions simultanées\n');

  switch (testType) {
    case 'basic':
      await test500Connections();
      break;
    case 'mixed':
      await testMixedOperations500();
      break;
    case 'stress':
      await testStressTest500();
      break;
    case 'recovery':
      await testConnectionRecovery500();
      break;
    case 'all':
    default:
      await test500Connections();
      console.log('');
      await testMixedOperations500();
      console.log('');
      await testStressTest500();
      console.log('');
      await testConnectionRecovery500();
      break;
  }

  console.log('✅ Tests de 500 connexions terminés !');
  console.log('');
  console.log('📋 Instructions d\'utilisation:');
  console.log('   • node scripts/test-500-connections.js basic');
  console.log('   • node scripts/test-500-connections.js mixed');
  console.log('   • node scripts/test-500-connections.js stress');
  console.log('   • node scripts/test-500-connections.js recovery');
  console.log('   • node scripts/test-500-connections.js all');
}

// Exécuter les tests
main().catch(console.error);
