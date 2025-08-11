const { PrismaClient } = require('@prisma/client');

async function deploySchema() {
  console.log('🚀 Déploiement du schéma vers la base de données de production...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    // Vérifier la connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    // Appliquer le schéma (créer les tables)
    console.log('📋 Application du schéma...');
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Schéma appliqué avec succès');

    // Vérifier que les tables existent
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log('📊 Tables créées:', tables.map(t => t.table_name));

    // Créer l'église par défaut si elle n'existe pas
    const defaultChurch = await prisma.church.findFirst({
      where: { name: 'ACER Paris' }
    });

    if (!defaultChurch) {
      console.log('🏛️ Création de l\'église par défaut ACER Paris...');
      await prisma.church.create({
        data: {
          name: 'ACER Paris',
          city: 'Paris',
          description: 'Église ACER Paris - Église par défaut',
          isActive: true
        }
      });
      console.log('✅ Église ACER Paris créée');
    } else {
      console.log('✅ Église ACER Paris existe déjà');
    }

    console.log('🎉 Déploiement terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  deploySchema()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { deploySchema };
