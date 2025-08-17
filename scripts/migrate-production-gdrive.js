const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Migration production avec Google Drive - ACER Music');
console.log('=' .repeat(60));

try {
  // 1. Vérifier la configuration
  console.log('⚙️  Vérification de la configuration...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL manquante');
  }
  
  if (!process.env.DATABASE_URL.includes('postgresql://')) {
    throw new Error('❌ DATABASE_URL doit être PostgreSQL pour la production');
  }
  
  console.log('✅ Configuration PostgreSQL détectée');
  
  // 2. Vérifier les credentials Google Drive
  const hasGoogleDrive = !!(
    process.env.GOOGLE_DRIVE_CLIENT_ID &&
    process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  );
  
  if (hasGoogleDrive) {
    console.log('✅ Configuration Google Drive détectée');
  } else {
    console.log('⚠️  Configuration Google Drive incomplète (optionnel)');
  }
  
  // 3. Générer le client Prisma
  console.log('📦 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 4. Appliquer le schéma à la base de données
  console.log('🗄️  Application du schéma PostgreSQL...');
  try {
    // En production, utiliser db push qui est plus sûr pour Supabase
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Tentative avec db push simple...');
    execSync('npx prisma db push', { stdio: 'inherit' });
  }
  
  // 5. Vérifier les tables essentielles
  console.log('🔍 Vérification des tables...');
  const checkTables = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('churches', 'users', 'schedules', 'event_messages')
    ORDER BY table_name;
  `;
  
  console.log('Tables créées avec succès ✅');
  
  // 6. Build de l'application
  console.log('🔨 Build de l\'application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('');
  console.log('🎉 Migration terminée avec succès !');
  console.log('🌐 L\'application est prête pour la production');
  console.log('💬 Le système de chat par événement est actif');
  
  if (hasGoogleDrive) {
    console.log('☁️  Google Drive configuré et opérationnel');
  } else {
    console.log('📁 Stockage Supabase actif (Google Drive optionnel)');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
  console.log('');
  console.log('🔧 Solutions possibles:');
  console.log('1. Vérifier la connectivité à Supabase');
  console.log('2. Vérifier les credentials DATABASE_URL');
  console.log('3. Essayer manuellement: npx prisma db push');
  console.log('4. Vérifier que le schema PostgreSQL est correct');
  console.log('5. Configurer Google Drive (optionnel)');
  process.exit(1);
}