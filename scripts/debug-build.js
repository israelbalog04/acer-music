const { execSync } = require('child_process');

async function debugBuild() {
  console.log('🔍 Diagnostic du build...');
  
  try {
    // Vérifier les variables d'environnement
    console.log('\n📋 Variables d\'environnement:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Définie' : '❌ Manquante');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Définie' : '❌ Manquante');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ Manquante');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Manquante');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Définie' : '❌ Manquante');

    // Vérifier les dépendances
    console.log('\n📦 Vérification des dépendances:');
    execSync('npm list --depth=0', { stdio: 'inherit' });

    // Vérifier Prisma
    console.log('\n🗄️ Vérification Prisma:');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Test de build sans variables d'environnement
    console.log('\n🔨 Test de build (sans variables d\'environnement):');
    try {
      execSync('npx next build --debug', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Erreur de build détectée');
      console.log('Erreur:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le script
if (require.main === module) {
  debugBuild()
    .then(() => {
      console.log('\n✅ Diagnostic terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { debugBuild };
