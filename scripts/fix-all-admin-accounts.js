const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllAdminAccounts() {
  try {
    console.log('🔧 Correction de tous les comptes admin non approuvés...\n');

    // Trouver tous les comptes admin non approuvés
    const unapprovedAdmins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isApproved: false
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

    console.log(`📊 ${unapprovedAdmins.length} compte(s) admin non approuvé(s) trouvé(s)`);

    if (unapprovedAdmins.length === 0) {
      console.log('✅ Tous les comptes admin sont déjà approuvés !');
      return;
    }

    // Afficher les comptes trouvés
    console.log('\n📋 Comptes admin non approuvés :');
    unapprovedAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName}) - ${admin.church?.name}`);
    });

    // Approuver tous les comptes admin
    const updatePromises = unapprovedAdmins.map(admin => 
      prisma.user.update({
        where: { id: admin.id },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: 'system-auto-fix'
        }
      })
    );

    const updatedAdmins = await Promise.all(updatePromises);

    console.log('\n✅ Tous les comptes admin ont été approuvés !');
    
    console.log('\n📊 Résumé des modifications :');
    updatedAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} - ✅ Approuvé le ${admin.approvedAt?.toLocaleDateString('fr-FR')}`);
    });

    // Vérifier qu'il n'y a plus de comptes admin non approuvés
    const remainingUnapproved = await prisma.user.count({
      where: {
        role: 'ADMIN',
        isApproved: false
      }
    });

    console.log(`\n🔍 Vérification : ${remainingUnapproved} compte(s) admin non approuvé(s) restant(s)`);

    if (remainingUnapproved === 0) {
      console.log('🎉 Tous les comptes admin sont maintenant approuvés !');
    } else {
      console.log('⚠️ Il reste encore des comptes admin non approuvés');
    }

    // Afficher les statistiques finales
    const totalAdmins = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    const approvedAdmins = await prisma.user.count({
      where: {
        role: 'ADMIN',
        isApproved: true
      }
    });

    console.log('\n📈 Statistiques finales :');
    console.log(`   👑 Total admins : ${totalAdmins}`);
    console.log(`   ✅ Admins approuvés : ${approvedAdmins}`);
    console.log(`   ❌ Admins non approuvés : ${totalAdmins - approvedAdmins}`);

    console.log('\n🎊 Correction terminée ! Tous les admins peuvent maintenant se connecter.');

  } catch (error) {
    console.error('❌ Erreur lors de la correction :', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAdminAccounts();
