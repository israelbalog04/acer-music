const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  console.log('👑 Création du Super Administrateur...');
  
  // Vérification des variables d'environnement
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  
  console.log('\n📋 Variables d\'environnement:');
  console.log('SUPER_ADMIN_EMAIL:', superAdminEmail ? '✅ Définie' : '❌ Manquante');
  console.log('SUPER_ADMIN_PASSWORD:', superAdminPassword ? '✅ Définie' : '❌ Manquante');
  console.log('SUPER_ADMIN_NAME:', superAdminName);
  
  if (!superAdminEmail || !superAdminPassword) {
    console.log('\n❌ Variables d\'environnement manquantes!');
    console.log('💡 Configurez ces variables dans Vercel:');
    console.log('   - SUPER_ADMIN_EMAIL=votre-email@example.com');
    console.log('   - SUPER_ADMIN_PASSWORD=votre-mot-de-passe-securise');
    console.log('   - SUPER_ADMIN_NAME=Nom du Super Admin (optionnel)');
    return;
  }

  const prisma = new PrismaClient();

  try {
    // Vérifier si un super admin existe déjà
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        role: 'SUPER_ADMIN'
      }
    });

    if (existingSuperAdmin) {
      console.log('✅ Un Super Administrateur existe déjà');
      console.log(`   - Email: ${existingSuperAdmin.email}`);
      console.log(`   - Nom: ${existingSuperAdmin.name}`);
      return;
    }

    // Récupérer l'église ACER Paris
    const church = await prisma.church.findFirst({
      where: {
        name: 'ACER Paris'
      }
    });

    if (!church) {
      console.log('❌ Église ACER Paris non trouvée');
      console.log('💡 Exécutez d\'abord: npm run create-default-church');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    // Créer le super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: superAdminName,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        churchId: church.id,
        isApproved: true,
        isActive: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Super Administrateur créé avec succès!');
    console.log(`   - ID: ${superAdmin.id}`);
    console.log(`   - Email: ${superAdmin.email}`);
    console.log(`   - Nom: ${superAdmin.name}`);
    console.log(`   - Rôle: ${superAdmin.role}`);
    console.log(`   - Église: ${church.name}`);
    console.log(`   - Approuvé: ${superAdmin.isApproved ? 'Oui' : 'Non'}`);

    console.log('\n🔐 Informations de connexion:');
    console.log(`   - Email: ${superAdminEmail}`);
    console.log(`   - Mot de passe: ${superAdminPassword}`);
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');

  } catch (error) {
    console.error('❌ Erreur lors de la création du Super Admin:', error.message);
    
    if (error.code === 'P2002') {
      console.log('\n🔍 Diagnostic: Un utilisateur avec cet email existe déjà');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
if (require.main === module) {
  createSuperAdmin()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { createSuperAdmin };
