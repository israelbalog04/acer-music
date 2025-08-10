const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMarseilleAdmin() {
  try {
    console.log('🧪 Test avec l\'admin d\'ACER Marseille...\n');

    // Récupérer l'admin d'ACER Marseille
    const marseilleAdmin = await prisma.user.findFirst({
      where: { 
        email: 'admin@acer-marseille.com'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        churchId: true,
        role: true,
        isApproved: true
      }
    });

    if (!marseilleAdmin) {
      console.log('❌ Admin d\'ACER Marseille non trouvé');
      return;
    }

    console.log(`👤 Admin: ${marseilleAdmin.email} (${marseilleAdmin.firstName} ${marseilleAdmin.lastName})`);
    console.log(`🏛️ Église: ${marseilleAdmin.churchId}`);
    console.log(`👑 Rôle: ${marseilleAdmin.role}`);
    console.log(`✅ Approuvé: ${marseilleAdmin.isApproved ? 'OUI' : 'NON'}\n`);

    // Récupérer l'église d'ACER Marseille
    const marseilleChurch = await prisma.church.findUnique({
      where: { id: marseilleAdmin.churchId },
      select: { id: true, name: true, city: true }
    });

    console.log(`🏛️ Église: ${marseilleChurch.name} (${marseilleChurch.city})`);

    // Simuler la requête de l'API pour ACER Marseille
    const pendingUsers = await prisma.user.findMany({
      where: {
        churchId: marseilleAdmin.churchId,
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

    console.log(`\n📊 Résultat de l'API pour ACER Marseille:`);
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

    // Vérifier tous les utilisateurs d'ACER Marseille
    console.log('🔍 Tous les utilisateurs d\'ACER Marseille:');
    const allMarseilleUsers = await prisma.user.findMany({
      where: { churchId: marseilleAdmin.churchId },
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

    allMarseilleUsers.forEach((user, index) => {
      const status = user.isApproved ? '✅ Approuvé' : '❌ En attente';
      console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.role} - ${status}`);
    });

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Pour voir les utilisateurs d\'ACER Marseille:');
    console.log('1. Se connecter avec admin@acer-marseille.com');
    console.log('2. Aller sur /app/admin/pending-approvals');
    console.log('3. Vous devriez voir l\'utilisateur babe@gmail.com');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMarseilleAdmin();
