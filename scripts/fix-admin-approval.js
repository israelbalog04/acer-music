const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminApproval() {
  try {
    console.log('🔧 Vérification et correction des admins non approuvés...\n');

    // Récupérer tous les admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isApproved: true,
        churchId: true
      }
    });

    console.log(`📊 ${admins.length} admin(s) trouvé(s)`);

    let fixedCount = 0;
    for (const admin of admins) {
      console.log(`\n👤 ${admin.email} (${admin.firstName} ${admin.lastName})`);
      console.log(`   isApproved: ${admin.isApproved ? 'OUI' : 'NON'}`);

      if (!admin.isApproved) {
        console.log(`   🔧 Correction en cours...`);
        
        await prisma.user.update({
          where: { id: admin.id },
          data: {
            isApproved: true,
            approvedAt: new Date(),
            approvedBy: 'system-auto-fix'
          }
        });

        console.log(`   ✅ Admin corrigé !`);
        fixedCount++;
      } else {
        console.log(`   ✅ Déjà approuvé`);
      }
    }

    console.log(`\n🎉 Correction terminée !`);
    console.log(`   Admins corrigés: ${fixedCount}`);

    // Vérification finale
    const unapprovedAdmins = await prisma.user.count({
      where: {
        role: 'ADMIN',
        isApproved: false
      }
    });

    console.log(`   Admins non approuvés restants: ${unapprovedAdmins}`);

    if (unapprovedAdmins === 0) {
      console.log(`\n✅ Tous les admins sont maintenant approuvés !`);
    } else {
      console.log(`\n⚠️ Il reste encore ${unapprovedAdmins} admin(s) non approuvé(s)`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction :', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminApproval();
