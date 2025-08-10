const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminInterface() {
  try {
    console.log('🔍 Diagnostic de l\'interface admin...\n');

    // Test 1: Vérifier tous les admins et leurs églises
    console.log('📊 Test 1: Vérification des admins et leurs églises');
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: {
        church: {
          select: { name: true, city: true }
        }
      }
    });

    console.log(`   ${admins.length} admin(s) trouvé(s):`);
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} - ${admin.church.name} (${admin.church.city})`);
      console.log(`      ChurchId: ${admin.churchId}`);
      console.log(`      isApproved: ${admin.isApproved}`);
    });

    // Test 2: Vérifier les utilisateurs en attente par église
    console.log('\n📊 Test 2: Utilisateurs en attente par église');
    const churches = await prisma.church.findMany({
      select: { id: true, name: true, city: true }
    });

    for (const church of churches) {
      const pendingUsers = await prisma.user.count({
        where: {
          churchId: church.id,
          isApproved: false
        }
      });

      const totalUsers = await prisma.user.count({
        where: { churchId: church.id }
      });

      console.log(`   ${church.name} (${church.city}):`);
      console.log(`      Total utilisateurs: ${totalUsers}`);
      console.log(`      En attente: ${pendingUsers}`);
    }

    // Test 3: Simuler l'API pour chaque admin
    console.log('\n📊 Test 3: Simulation de l\'API pour chaque admin');
    for (const admin of admins) {
      console.log(`\n👤 Admin: ${admin.email}`);
      console.log(`   Église: ${admin.church.name} (${admin.church.city})`);
      
      const pendingUsers = await prisma.user.findMany({
        where: {
          churchId: admin.churchId,
          isApproved: false
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        }
      });

      console.log(`   Utilisateurs en attente: ${pendingUsers.length}`);
      
      if (pendingUsers.length > 0) {
        pendingUsers.forEach((user, index) => {
          console.log(`      ${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
        });
      } else {
        console.log(`      Aucun utilisateur en attente`);
      }
    }

    // Test 4: Vérifier les permissions de session
    console.log('\n📊 Test 4: Vérification des permissions');
    console.log('   L\'API /api/admin/users/pending vérifie:');
    console.log('   1. Session utilisateur existe');
    console.log('   2. Rôle = ADMIN');
    console.log('   3. churchId de l\'admin');
    console.log('   4. Utilisateurs avec isApproved = false dans la même église');

    // Test 5: Vérifier s'il y a des problèmes de données
    console.log('\n📊 Test 5: Vérification des données');
    
    // Utilisateurs avec isApproved = null
    const nullApprovedUsers = await prisma.user.findMany({
      where: {
        isApproved: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        churchId: true
      }
    });

    if (nullApprovedUsers.length > 0) {
      console.log(`   ⚠️ ${nullApprovedUsers.length} utilisateur(s) avec isApproved = null:`);
      nullApprovedUsers.forEach(user => {
        console.log(`      - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
      });
    } else {
      console.log(`   ✅ Aucun utilisateur avec isApproved = null`);
    }

    // Utilisateurs sans churchId
    const usersWithoutChurch = await prisma.user.findMany({
      where: {
        churchId: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (usersWithoutChurch.length > 0) {
      console.log(`   ⚠️ ${usersWithoutChurch.length} utilisateur(s) sans churchId:`);
      usersWithoutChurch.forEach(user => {
        console.log(`      - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
      });
    } else {
      console.log(`   ✅ Tous les utilisateurs ont un churchId`);
    }

    console.log('\n🎉 Diagnostic terminé !');
    console.log('\n📋 Solutions possibles:');
    console.log('1. Vérifiez que vous êtes connecté avec le bon admin');
    console.log('2. Vérifiez que l\'admin a bien un churchId');
    console.log('3. Vérifiez que les utilisateurs ont isApproved = false (pas null)');
    console.log('4. Vérifiez les logs du navigateur pour d\'éventuelles erreurs');
    console.log('5. Vérifiez les logs du serveur');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminInterface();
