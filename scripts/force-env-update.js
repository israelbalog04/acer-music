const fs = require('fs');
const path = require('path');

function forceEnvUpdate() {
  console.log('🔧 Forçage de la mise à jour des variables d\'environnement...');
  
  // Variables d'environnement de production
  const productionEnv = {
    DATABASE_URL: 'postgresql://postgres:7cybzSYO0zZEoaUu@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres',
    DIRECT_URL: 'postgresql://postgres:7cybzSYO0zZEoaUu@db.butlptmveyaluxlnwizr.supabase.co:5432/postgres',
    NEXT_PUBLIC_SUPABASE_URL: 'https://butlptmveyaluxlnwizr.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTQ5MzUsImV4cCI6MjA3MDQ5MDkzNX0.w9L6CPWuocE9aeuDj0zes6_kePyDKkUD3M1aTXfgADA',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM'
  };

  console.log('\n📋 Variables d\'environnement de production:');
  Object.entries(productionEnv).forEach(([key, value]) => {
    console.log(`   ${key}: ${value.substring(0, 30)}...`);
  });

  // Créer un fichier .env.production temporaire
  const envContent = Object.entries(productionEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envPath = path.join(__dirname, '..', '.env.production');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Fichier .env.production créé avec succès!');
    console.log(`   Chemin: ${envPath}`);
    
    console.log('\n📋 Contenu du fichier:');
    console.log(envContent);
    
    console.log('\n💡 Instructions:');
    console.log('1. Ce fichier sera utilisé lors du build Vercel');
    console.log('2. Assurez-vous que ces variables sont aussi dans Vercel Dashboard');
    console.log('3. Redéployez l\'application');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier:', error.message);
  }

  // Vérifier si le fichier existe
  if (fs.existsSync(envPath)) {
    console.log('\n✅ Fichier .env.production vérifié');
    const stats = fs.statSync(envPath);
    console.log(`   Taille: ${stats.size} bytes`);
    console.log(`   Modifié: ${stats.mtime}`);
  }
}

// Exécution du script
if (require.main === module) {
  forceEnvUpdate();
  console.log('\n✅ Script terminé');
}

module.exports = { forceEnvUpdate };
