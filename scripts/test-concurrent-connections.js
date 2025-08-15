const { testConcurrentConnections, pooledPrisma } = require('../src/lib/prisma-pool.ts');

console.log('🌊 Test des connexions simultanées Supabase');
console.log('=' .repeat(60));

async function runConcurrentTests() {
  try {
    console.log('📋 Configuration:');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`   DIRECT_URL: ${process.env.DIRECT_URL ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log('');

    // Test 1: 5 connexions simultanées
    console.log('🧪 Test 1: 5 connexions simultanées');
    console.log('-'.repeat(40));
    await testConcurrentConnections(5);
    console.log('');

    // Test 2: 10 connexions simultanées
    console.log('🧪 Test 2: 10 connexions simultanées');
    console.log('-'.repeat(40));
    await testConcurrentConnections(10);
    console.log('');

    // Test 3: 15 connexions simultanées (limite du pool)
    console.log('🧪 Test 3: 15 connexions simultanées (limite du pool)');
    console.log('-'.repeat(40));
    await testConcurrentConnections(15);
    console.log('');

    // Test 4: 20 connexions simultanées (dépassement du pool)
    console.log('🧪 Test 4: 20 connexions simultanées (dépassement du pool)');
    console.log('-'.repeat(40));
    await testConcurrentConnections(20);
    console.log('');

    // Test 5: Connexions mixtes (lecture + écriture)
    console.log('🧪 Test 5: Connexions mixtes (lecture + écriture)');
    console.log('-'.repeat(40));
    await testMixedOperations();
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

async function testMixedOperations() {
  const promises = [];
  const startTime = Date.now();

  // Opérations de lecture
  for (let i = 0; i < 5; i++) {
    promises.push(
      pooledPrisma.user.count().then(result => {
        console.log(`📖 Lecture ${i + 1}: ${result} utilisateurs`);
        return { type: 'read', result };
      })
    );
  }

  // Opérations de lecture avec relations
  for (let i = 0; i < 5; i++) {
    promises.push(
      pooledPrisma.church.findMany({
        include: {
          users: {
            take: 2
          }
        }
      }).then(result => {
        console.log(`🔗 Lecture avec relations ${i + 1}: ${result.length} églises`);
        return { type: 'read_relations', result };
      })
    );
  }

  // Opérations de requêtes brutes
  for (let i = 0; i < 3; i++) {
    promises.push(
      pooledPrisma.$queryRaw`SELECT COUNT(*) as count FROM users`.then(result => {
        console.log(`🔧 Requête brute ${i + 1}: ${result[0].count} utilisateurs`);
        return { type: 'raw_query', result };
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

  } catch (error) {
    console.error('❌ Erreur lors du test d\'opérations mixtes:', error);
  }
}

async function testStressTest() {
  console.log('🔥 Test de stress: 50 connexions rapides');
  console.log('-'.repeat(40));

  const promises = [];
  const startTime = Date.now();

  // Créer 50 connexions rapides
  for (let i = 0; i < 50; i++) {
    promises.push(
      pooledPrisma.user.count().then(result => {
        if (i % 10 === 0) {
          console.log(`⚡ Connexion ${i + 1}/50: ${result} utilisateurs`);
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

async function testConnectionRecovery() {
  console.log('🔄 Test de récupération de connexion');
  console.log('-'.repeat(40));

  try {
    // Simuler une déconnexion
    console.log('🔌 Simulation d\'une déconnexion...');
    await pooledPrisma.$disconnect();

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Tenter une reconnexion
    console.log('🔌 Tentative de reconnexion...');
    await pooledPrisma.$connect();

    // Tester une opération
    const userCount = await pooledPrisma.user.count();
    console.log(`✅ Reconnexion réussie: ${userCount} utilisateurs`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
  }
}

// Fonction principale
async function main() {
  const testType = process.argv[2] || 'all';

  console.log('🚀 Démarrage des tests de connexions simultanées\n');

  switch (testType) {
    case 'basic':
      await runConcurrentTests();
      break;
    case 'stress':
      await testStressTest();
      break;
    case 'recovery':
      await testConnectionRecovery();
      break;
    case 'all':
    default:
      await runConcurrentTests();
      console.log('');
      await testStressTest();
      console.log('');
      await testConnectionRecovery();
      break;
  }

  console.log('✅ Tests terminés !');
  console.log('');
  console.log('📋 Instructions d\'utilisation:');
  console.log('   • node scripts/test-concurrent-connections.js basic');
  console.log('   • node scripts/test-concurrent-connections.js stress');
  console.log('   • node scripts/test-concurrent-connections.js recovery');
  console.log('   • node scripts/test-concurrent-connections.js all');
}

// Exécuter les tests
main().catch(console.error);
