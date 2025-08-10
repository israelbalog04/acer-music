const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminProfiles() {
  try {
    console.log('🧪 Test de la page de gestion des profils admin...\n');

    // Récupérer toutes les églises
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true
      }
    });

    console.log(`📊 ${churches.length} église(s) trouvée(s)`);

    for (const church of churches) {
      console.log(`\n🏛️ Église: ${church.name} (${church.city})`);
      
      // Compter les utilisateurs par statut
      const totalUsers = await prisma.user.count({
        where: { churchId: church.id }
      });

      const approvedUsers = await prisma.user.count({
        where: { 
          churchId: church.id,
          isApproved: true
        }
      });

      const pendingUsers = await prisma.user.count({
        where: { 
          churchId: church.id,
          isApproved: false
        }
      });

      const adminUsers = await prisma.user.count({
        where: { 
          churchId: church.id,
          role: 'ADMIN'
        }
      });

      console.log(`   👥 Total utilisateurs: ${totalUsers}`);
      console.log(`   ✅ Approuvés: ${approvedUsers}`);
      console.log(`   ⏳ En attente: ${pendingUsers}`);
      console.log(`   👑 Admins: ${adminUsers}`);

      // Lister quelques utilisateurs en attente
      const pendingUsersList = await prisma.user.findMany({
        where: { 
          churchId: church.id,
          isApproved: false
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        },
        take: 3
      });

      if (pendingUsersList.length > 0) {
        console.log(`   📋 Utilisateurs en attente (exemples):`);
        pendingUsersList.forEach(user => {
          console.log(`      - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
        });
      }

      // Lister les admins
      const adminUsersList = await prisma.user.findMany({
        where: { 
          churchId: church.id,
          role: 'ADMIN'
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          isApproved: true
        }
      });

      if (adminUsersList.length > 0) {
        console.log(`   👑 Admins:`);
        adminUsersList.forEach(admin => {
          console.log(`      - ${admin.email} (${admin.firstName} ${admin.lastName}) - ${admin.isApproved ? 'Approuvé' : 'Non approuvé'}`);
        });
      }
    }

    // Statistiques globales
    console.log('\n📈 Statistiques globales:');
    const globalStats = await prisma.user.groupBy({
      by: ['role', 'isApproved'],
      _count: {
        id: true
      }
    });

    globalStats.forEach(stat => {
      const status = stat.isApproved ? 'Approuvé' : 'Non approuvé';
      console.log(`   ${stat.role}: ${stat._count.id} (${status})`);
    });

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Pour tester la page admin:');
    console.log('1. Se connecter avec un compte admin');
    console.log('2. Aller sur /app/admin/profiles');
    console.log('3. Vérifier les filtres et les actions');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminProfiles();
