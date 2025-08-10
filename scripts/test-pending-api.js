const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPendingAPI() {
  try {
    console.log('🧪 Test de l\'API /api/admin/users/pending...\n');

    // Récupérer un admin pour simuler la session
    const admin = await prisma.user.findFirst({
      where: { 
        role: 'ADMIN',
        isApproved: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        churchId: true,
        role: true
      }
    });

    if (!admin) {
      console.log('❌ Aucun admin trouvé pour le test');
      return;
    }

    console.log(`👤 Admin de test: ${admin.email} (${admin.firstName} ${admin.lastName})`);
    console.log(`🏛️ Église: ${admin.churchId}`);
    console.log(`👑 Rôle: ${admin.role}\n`);

    // Simuler la requête de l'API
    const pendingUsers = await prisma.user.findMany({
      where: {
        churchId: admin.churchId,
        isApproved: false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        instruments: true,
        createdAt: true,
        church: {
          select: {
            name: true,
            city: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 Résultat de l'API simulée:`);
    console.log(`   Utilisateurs en attente trouvés: ${pendingUsers.length}`);

    if (pendingUsers.length > 0) {
      console.log('\n📋 Liste des utilisateurs en attente:');
      pendingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
        console.log(`      Rôle: ${user.role}`);
        console.log(`      Église: ${user.church.name} (${user.church.city})`);
        console.log(`      Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
        if (user.phone) {
          console.log(`      Téléphone: ${user.phone}`);
        }
        console.log('');
      });
    } else {
      console.log('   ❌ Aucun utilisateur en attente trouvé');
    }

    // Vérifier les permissions
    console.log('🔍 Vérification des permissions:');
    console.log(`   ✅ Admin connecté: ${admin.role === 'ADMIN' ? 'OUI' : 'NON'}`);
    console.log(`   ✅ Admin approuvé: ${admin.isApproved ? 'OUI' : 'NON'}`);
    console.log(`   ✅ ChurchId présent: ${admin.churchId ? 'OUI' : 'NON'}`);

    // Test avec différentes églises
    console.log('\n🌍 Test avec différentes églises:');
    const churches = await prisma.church.findMany({
      select: { id: true, name: true, city: true }
    });

    for (const church of churches) {
      const churchPendingUsers = await prisma.user.count({
        where: {
          churchId: church.id,
          isApproved: false
        }
      });

      console.log(`   ${church.name} (${church.city}): ${churchPendingUsers} utilisateur(s) en attente`);
    }

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Si l\'API ne fonctionne pas:');
    console.log('1. Vérifiez que l\'utilisateur connecté est bien ADMIN');
    console.log('2. Vérifiez que l\'utilisateur connecté a un churchId valide');
    console.log('3. Vérifiez que les utilisateurs non approuvés ont isApproved = false');
    console.log('4. Vérifiez les logs du serveur pour d\'éventuelles erreurs');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPendingAPI();
