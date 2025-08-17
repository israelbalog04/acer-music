const { execSync } = require('child_process');

console.log('🚀 Migration de production pour ACER Music');
console.log('📊 Ajout du système de chat par événement...');

try {
  // Vérifier que les variables d'environnement sont configurées
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL manquante');
  }

  console.log('📋 Variables d\'environnement détectées');
  
  // Générer le client Prisma
  console.log('⚙️  Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Appliquer le schéma à la base de données
  console.log('📦 Application du schéma à la base de données...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Migration terminée avec succès !');
  console.log('🎉 Le système de chat par événement est maintenant disponible');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
  console.log('');
  console.log('📋 Pour résoudre ce problème:');
  console.log('1. Vérifiez que DATABASE_URL est configurée');
  console.log('2. Vérifiez la connectivité à la base de données');
  console.log('3. Exécutez manuellement: npx prisma db push');
  process.exit(1);
}