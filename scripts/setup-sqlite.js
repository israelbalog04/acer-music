const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupSQLite() {
  console.log('🗄️ Configuration de SQLite locale...');
  
  try {
    // Vérifier que le fichier .env existe
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ Fichier .env non trouvé');
      console.log('💡 Copiez env.local.example vers .env et configurez les variables');
      return;
    }

    console.log('✅ Fichier .env trouvé');

    // Générer le client Prisma
    console.log('\n📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Client Prisma généré');

    // Créer la base de données SQLite
    console.log('\n🗄️ Création de la base de données SQLite...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Base de données SQLite créée');

    // Exécuter le seed
    console.log('\n🌱 Exécution du seed...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✅ Données initiales créées');

    // Créer l'église par défaut
    console.log('\n🏛️ Création de l\'église par défaut...');
    execSync('node scripts/create-default-church.js', { stdio: 'inherit' });
    console.log('✅ Église ACER Paris créée');

    // Créer le super admin
    console.log('\n👑 Création du super admin...');
    execSync('node scripts/create-super-admin.js', { stdio: 'inherit' });
    console.log('✅ Super admin créé');

    console.log('\n🎉 Configuration SQLite terminée avec succès!');
    console.log('\n📋 Informations de connexion:');
    console.log('   - Base de données: prisma/dev.db');
    console.log('   - URL: http://localhost:3000');
    console.log('   - Super Admin: admin@acer.com / Admin123!');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
  }
}

// Exécution du script
if (require.main === module) {
  setupSQLite()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { setupSQLite };
