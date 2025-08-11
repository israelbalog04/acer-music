const { execSync } = require('child_process');

async function setupProductionDB() {
  console.log('🚀 Configuration de la base de données de production...');
  
  try {
    // Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Pousser le schéma vers la base de données
    console.log('📋 Application du schéma vers la base de données...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    
    // Exécuter le seed pour créer les données initiales
    console.log('🌱 Exécution du seed pour les données initiales...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Base de données de production configurée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  }
}

// Exécuter le script
if (require.main === module) {
  setupProductionDB()
    .then(() => {
      console.log('✅ Configuration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { setupProductionDB };
