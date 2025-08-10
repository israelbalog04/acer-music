const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveAdminAccount() {
  try {
    console.log('🔧 Approbation du compte admin balogisrael02@gmail.com...\n');

    // Rechercher le compte
    const user = await prisma.user.findUnique({
      where: { email: 'balogisrael02@gmail.com' },
      include: {
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Compte non trouvé');
      return;
    }

    console.log('📊 Informations actuelles :');
    console.log(`   👤 Nom : ${user.firstName} ${user.lastName}`);
    console.log(`   📧 Email : ${user.email}`);
    console.log(`   🏛️ Église : ${user.church?.name} (${user.church?.city})`);
    console.log(`   👑 Rôle : ${user.role}`);
    console.log(`   ✅ Approuvé : ${user.isApproved ? 'OUI' : 'NON'}`);

    if (user.isApproved) {
      console.log('\n✅ Le compte est déjà approuvé !');
      return;
    }

    // Approuver le compte
    const updatedUser = await prisma.user.update({
      where: { email: 'balogisrael02@gmail.com' },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: 'system' // Approuvé par le système
      }
    });

    console.log('\n✅ Compte approuvé avec succès !');
    console.log('\n📊 Nouvelles informations :');
    console.log(`   ✅ Approuvé : ${updatedUser.isApproved ? 'OUI' : 'NON'}`);
    console.log(`   📅 Approuvé le : ${updatedUser.approvedAt?.toLocaleDateString('fr-FR')}`);
    console.log(`   👤 Approuvé par : ${updatedUser.approvedBy}`);

    console.log('\n🎉 Vous pouvez maintenant vous connecter !');
    console.log('   📧 Email : balogisrael02@gmail.com');
    console.log('   🔗 Page de connexion : /auth/login');

  } catch (error) {
    console.error('❌ Erreur lors de l\'approbation :', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveAdminAccount();
