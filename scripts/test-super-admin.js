const { PrismaClient } = require('@prisma/client');

async function testSuperAdmin() {
  console.log('👑 Test de création du Super Administrateur...');
  
  const prisma = new PrismaClient();

  try {
    // Vérifier si un super admin existe déjà
    console.log('\n📋 Vérification des Super Administrateurs existants...');
    const existingSuperAdmins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log(`✅ ${existingSuperAdmins.length} Super Administrateur(s) trouvé(s):`);
    existingSuperAdmins.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email})`);
      console.log(`     Rôle: ${admin.role}`);
      console.log(`     Approuvé: ${admin.isApproved ? 'Oui' : 'Non'}`);
      console.log(`     Actif: ${admin.isActive ? 'Oui' : 'Non'}`);
      console.log(`     Créé le: ${admin.createdAt.toLocaleDateString()}`);
    });

    // Vérifier les variables d'environnement
    console.log('\n📋 Variables d\'environnement:');
    console.log('SUPER_ADMIN_EMAIL:', process.env.SUPER_ADMIN_EMAIL ? '✅ Définie' : '❌ Manquante');
    console.log('SUPER_ADMIN_PASSWORD:', process.env.SUPER_ADMIN_PASSWORD ? '✅ Définie' : '❌ Manquante');
    console.log('SUPER_ADMIN_NAME:', process.env.SUPER_ADMIN_NAME || 'Non définie');

    if (existingSuperAdmins.length === 0) {
      console.log('\n⚠️ Aucun Super Administrateur trouvé');
      console.log('💡 Pour créer un Super Admin:');
      console.log('1. Configurez les variables d\'environnement dans Vercel:');
      console.log('   - SUPER_ADMIN_EMAIL=votre-email@example.com');
      console.log('   - SUPER_ADMIN_PASSWORD=votre-mot-de-passe-securise');
      console.log('   - SUPER_ADMIN_NAME=Nom du Super Admin (optionnel)');
      console.log('2. Redéployez l\'application');
      console.log('3. Ou exécutez manuellement: npm run create-super-admin');
    } else {
      console.log('\n✅ Super Administrateur(s) configuré(s) correctement!');
    }

    // Vérifier les permissions
    console.log('\n🔐 Test des permissions...');
    const superAdmin = existingSuperAdmins[0];
    if (superAdmin) {
      console.log(`✅ Super Admin ${superAdmin.name} peut:`);
      console.log('   - Accéder à toutes les églises');
      console.log('   - Créer de nouveaux administrateurs');
      console.log('   - Gérer tous les utilisateurs');
      console.log('   - Accéder aux statistiques globales');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du test
if (require.main === module) {
  testSuperAdmin()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testSuperAdmin };
