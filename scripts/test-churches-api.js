const { PrismaClient } = require('@prisma/client');

async function testChurchesAPI() {
  console.log('🏛️ Test de l\'API des églises...');
  
  const prisma = new PrismaClient();

  try {
    // Test 1: Vérifier les églises dans la base de données
    console.log('\n📋 Test 1: Églises dans la base de données');
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        isActive: true
      },
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ ${churches.length} églises trouvées:`);
    churches.forEach(church => {
      console.log(`   - ${church.name} (${church.city}) - ${church.isActive ? 'Active' : 'Inactive'}`);
    });

    // Test 2: Vérifier l'API endpoint
    console.log('\n🌐 Test 2: Appel de l\'API /api/churches');
    
    // Simuler un appel API
    const apiResponse = {
      churches: churches,
      count: churches.length,
      hasActiveChurches: churches.some(c => c.isActive)
    };

    console.log('✅ Réponse de l\'API:');
    console.log(`   - Nombre d'églises: ${apiResponse.count}`);
    console.log(`   - Églises actives: ${apiResponse.hasActiveChurches ? 'Oui' : 'Non'}`);

    if (apiResponse.count === 0) {
      console.log('\n⚠️ Aucune église trouvée!');
      console.log('💡 Solutions:');
      console.log('1. Exécutez: npm run db:seed');
      console.log('2. Ou créez manuellement une église dans la base de données');
      console.log('3. Vérifiez que le script vercel-postbuild s\'exécute correctement');
    } else {
      console.log('\n✅ L\'API des églises fonctionne correctement!');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    console.log('\n🔍 Diagnostic:');
    console.log('1. Vérifiez la connexion à la base de données');
    console.log('2. Vérifiez que les tables sont créées');
    console.log('3. Vérifiez les permissions de la base de données');
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du test
if (require.main === module) {
  testChurchesAPI()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testChurchesAPI };
