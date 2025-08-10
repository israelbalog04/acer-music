import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperUser() {
  try {
    console.log('🚀 Création d\'un Super Utilisateur...\n');

    // Récupérer la première église (pour l'associer au super admin)
    const firstChurch = await prisma.church.findFirst({
      where: { isActive: true }
    });

    if (!firstChurch) {
      console.log('❌ Aucune église active trouvée');
      return;
    }

    console.log(`🏛️ Église associée: ${firstChurch.name} (${firstChurch.city})`);

    // Données du super utilisateur
    const superUserData = {
      email: 'superadmin@acer.com',
      firstName: 'Super',
      lastName: 'Administrateur',
      phone: '+33123456789',
      password: 'SuperAdmin2024!',
      role: UserRole.SUPER_ADMIN,
      instruments: JSON.stringify(['Piano', 'Direction']),
      churchId: firstChurch.id,
      isApproved: true, // Auto-approuvé
      approvedAt: new Date(),
      approvedBy: 'system'
    };

    // Vérifier si le super utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: superUserData.email }
    });

    if (existingUser) {
      console.log('⚠️ Un super utilisateur existe déjà avec cet email');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Rôle: ${existingUser.role}`);
      console.log(`   Approuvé: ${existingUser.isApproved}`);
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(superUserData.password, 12);

    // Créer le super utilisateur
    const superUser = await prisma.user.create({
      data: {
        email: superUserData.email,
        firstName: superUserData.firstName,
        lastName: superUserData.lastName,
        phone: superUserData.phone,
        password: hashedPassword,
        role: superUserData.role,
        instruments: superUserData.instruments,
        churchId: superUserData.churchId,
        isApproved: superUserData.isApproved,
        approvedAt: superUserData.approvedAt,
        approvedBy: superUserData.approvedBy
      },
      include: {
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    console.log('✅ Super utilisateur créé avec succès !');
    console.log('\n📋 Informations du compte:');
    console.log(`   Nom: ${superUser.firstName} ${superUser.lastName}`);
    console.log(`   Email: ${superUser.email}`);
    console.log(`   Mot de passe: ${superUserData.password}`);
    console.log(`   Rôle: ${superUser.role}`);
    console.log(`   Église: ${superUser.church.name} (${superUser.church.city})`);
    console.log(`   Approuvé: ${superUser.isApproved}`);
    console.log(`   Créé le: ${superUser.createdAt.toLocaleDateString('fr-FR')}`);

    console.log('\n🔐 Permissions du Super Admin:');
    console.log('   - Accès à toutes les églises');
    console.log('   - Gestion de tous les utilisateurs');
    console.log('   - Gestion de toutes les églises');
    console.log('   - Statistiques globales');
    console.log('   - Pas besoin d\'approbation');

    console.log('\n🎯 Pages accessibles:');
    console.log('   - /app/super-admin/churches (Toutes les Églises)');
    console.log('   - /app/super-admin/users (Tous les Utilisateurs)');
    console.log('   - /app/super-admin/analytics (Statistiques Globales)');
    console.log('   - /app/super-admin/church-management (Gestion des Églises)');

    console.log('\n⚠️ IMPORTANT: Changez le mot de passe après la première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création du super utilisateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser();