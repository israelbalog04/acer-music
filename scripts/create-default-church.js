const { PrismaClient } = require('@prisma/client');

async function createDefaultChurch() {
  console.log('🏛️ Création de l\'église par défaut ACER Paris...');
  
  const prisma = new PrismaClient();

  try {
    // Vérifier si l'église ACER Paris existe déjà
    const existingChurch = await prisma.church.findFirst({
      where: {
        name: 'ACER Paris'
      }
    });

    if (existingChurch) {
      console.log('✅ Église ACER Paris existe déjà');
      return;
    }

    // Créer l'église ACER Paris
    const church = await prisma.church.create({
      data: {
        name: 'ACER Paris',
        address: '123 Rue de la Paix, Paris',
        city: 'Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@acer-paris.fr',
        website: 'https://acer-paris.fr',
        isActive: true,
      }
    });

    console.log('✅ Église ACER Paris créée avec succès!');
    console.log(`   - ID: ${church.id}`);
    console.log(`   - Nom: ${church.name}`);
    console.log(`   - Ville: ${church.city}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'église:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
if (require.main === module) {
  createDefaultChurch()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { createDefaultChurch };
