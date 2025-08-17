const { execSync } = require('child_process');

async function robustBuild() {
  console.log('🚀 Build robuste en cours...');
  
  try {
    // Étape 1: Vérifier les variables d'environnement critiques
    console.log('\n📋 Vérification des variables d\'environnement...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️ Variables d\'environnement manquantes:', missingVars.join(', '));
      console.log('💡 Utilisation de valeurs par défaut pour le build...');
      
      // Définir des valeurs par défaut pour le build
      process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';
      process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'dummy-secret-for-build';
      process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    } else {
      console.log('✅ Toutes les variables d\'environnement sont définies');
    }

    // Étape 2: Générer le client Prisma
    console.log('\n🗄️ Génération du client Prisma...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Client Prisma généré avec succès');
    } catch (error) {
      console.log('❌ Erreur lors de la génération Prisma:', error.message);
      throw error;
    }

    // Étape 3: Build Next.js
    console.log('\n🔨 Build Next.js...');
    try {
      execSync('npx next build', { stdio: 'inherit' });
      console.log('✅ Build Next.js réussi');
    } catch (error) {
      console.log('❌ Erreur lors du build Next.js:', error.message);
      throw error;
    }

    console.log('\n🎉 Build terminé avec succès !');

  } catch (error) {
    console.error('\n❌ Erreur lors du build:', error.message);
    console.log('\n🔍 Suggestions de résolution:');
    console.log('1. Vérifiez que toutes les dépendances sont installées');
    console.log('2. Vérifiez les variables d\'environnement dans Vercel');
    console.log('3. Vérifiez la configuration Prisma');
    console.log('4. Vérifiez les imports dans le code');
    
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  robustBuild()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { robustBuild };
