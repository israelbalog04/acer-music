const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugPendingUsers() {
  try {
    console.log('🔍 Diagnostic des utilisateurs en attente d\'approbation...\n');

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
      
      // Compter tous les utilisateurs
      const totalUsers = await prisma.user.count({
        where: { churchId: church.id }
      });

      // Compter les utilisateurs approuvés
      const approvedUsers = await prisma.user.count({
        where: { 
          churchId: church.id,
          isApproved: true
        }
      });

      // Compter les utilisateurs non approuvés
      const unapprovedUsers = await prisma.user.count({
        where: { 
          churchId: church.id,
          isApproved: false
        }
      });

      console.log(`   👥 Total utilisateurs: ${totalUsers}`);
      console.log(`   ✅ Approuvés: ${approvedUsers}`);
      console.log(`   ❌ Non approuvés: ${unapprovedUsers}`);

      // Lister les utilisateurs non approuvés
      const pendingUsers = await prisma.user.findMany({
        where: { 
          churchId: church.id,
          isApproved: false
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isApproved: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      if (pendingUsers.length > 0) {
        console.log(`   📋 Utilisateurs en attente (isApproved = false):`);
        pendingUsers.forEach((user, index) => {
          console.log(`      ${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
          console.log(`         Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
          console.log(`         isApproved: ${user.isApproved}`);
        });
      }



      // Lister les admins
      const admins = await prisma.user.findMany({
        where: { 
          churchId: church.id,
          role: 'ADMIN'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isApproved: true
        }
      });

      if (admins.length > 0) {
        console.log(`   👑 Admins:`);
        admins.forEach((admin, index) => {
          console.log(`      ${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
          console.log(`         isApproved: ${admin.isApproved}`);
        });
      }
    }

    // Test de l'API
    console.log('\n🧪 Test de l\'API /api/admin/users/pending');
    console.log('   Cette API devrait retourner les utilisateurs avec isApproved = false');
    console.log('   Si elle ne retourne rien, vérifiez:');
    console.log('   1. Que l\'utilisateur connecté est bien ADMIN');
    console.log('   2. Que l\'utilisateur connecté a bien un churchId');
    console.log('   3. Que les utilisateurs non approuvés ont bien isApproved = false (pas null)');

    // Statistiques globales
    console.log('\n📈 Statistiques globales:');
    // Statistiques globales
    console.log('\n📈 Statistiques globales:');
    const totalUsers = await prisma.user.count();
    const approvedUsers = await prisma.user.count({ where: { isApproved: true } });
    const unapprovedUsers = await prisma.user.count({ where: { isApproved: false } });

    console.log(`   Total utilisateurs: ${totalUsers}`);
    console.log(`   isApproved = true: ${approvedUsers}`);
    console.log(`   isApproved = false: ${unapprovedUsers}`);

    console.log('\n🔧 Solutions possibles:');
    console.log('1. Si des utilisateurs ont isApproved = null, les mettre à false');
    console.log('2. Vérifier que l\'API filtre correctement par churchId');
    console.log('3. Vérifier que la session admin a bien un churchId valide');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic :', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPendingUsers();
