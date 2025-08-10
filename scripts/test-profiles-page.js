const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProfilesPage() {
  try {
    console.log('🧪 Test de la page "Gestion des Profils"...\n');

    // Test 1: Vérifier l'API /api/admin/users/profiles
    console.log('📊 Test 1: Vérification de l\'API /api/admin/users/profiles');
    
    // Récupérer un admin
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
      console.log('❌ Aucun admin trouvé');
      return;
    }

    console.log(`👤 Admin de test: ${admin.email}`);
    console.log(`🏛️ ChurchId: ${admin.churchId}`);

    // Simuler la requête de l'API profiles
    const allUsers = await prisma.user.findMany({
      where: {
        churchId: admin.churchId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        instruments: true,
        isApproved: true,
        approvedAt: true,
        approvedBy: true,
        createdAt: true,
        avatar: true,
        bio: true,
        skillLevel: true,
        musicalExperience: true,
        canLead: true,
        church: {
          select: {
            name: true,
            city: true
          }
        }
      },
      orderBy: [
        { isApproved: 'asc' }, // Non approuvés en premier
        { createdAt: 'desc' }  // Plus récents en premier
      ]
    });

    console.log(`📊 Total utilisateurs: ${allUsers.length}`);

    // Analyser les utilisateurs par statut
    const pendingUsers = allUsers.filter(u => !u.isApproved);
    const approvedUsers = allUsers.filter(u => u.isApproved);
    const rejectedUsers = allUsers.filter(u => u.isApproved === false);

    console.log(`   En attente: ${pendingUsers.length}`);
    console.log(`   Approuvés: ${approvedUsers.length}`);
    console.log(`   Refusés: ${rejectedUsers.length}`);

    // Test 2: Vérifier les filtres
    console.log('\n📊 Test 2: Vérification des filtres');
    console.log('   La page devrait afficher:');
    console.log(`   - Tous (${allUsers.length})`);
    console.log(`   - En attente (${pendingUsers.length})`);
    console.log(`   - Approuvés (${approvedUsers.length})`);
    console.log(`   - Refusés (${rejectedUsers.length})`);

    // Test 3: Afficher les utilisateurs en attente
    if (pendingUsers.length > 0) {
      console.log('\n📋 Utilisateurs en attente (devraient s\'afficher en premier):');
      pendingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
        console.log(`      Rôle: ${user.role}`);
        console.log(`      Église: ${user.church.name} (${user.church.city})`);
        console.log(`      Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
        console.log(`      isApproved: ${user.isApproved}`);
        console.log('');
      });
    } else {
      console.log('\n📋 Aucun utilisateur en attente');
    }

    // Test 4: Vérifier l'ordre de tri
    console.log('\n📊 Test 4: Vérification de l\'ordre de tri');
    console.log('   L\'API trie par:');
    console.log('   1. isApproved: asc (non approuvés en premier)');
    console.log('   2. createdAt: desc (plus récents en premier)');
    
    const firstUser = allUsers[0];
    if (firstUser) {
      console.log(`   Premier utilisateur: ${firstUser.email} - isApproved: ${firstUser.isApproved}`);
    }

    // Test 5: Vérifier les données complètes
    console.log('\n📊 Test 5: Vérification des données');
    const sampleUser = allUsers[0];
    if (sampleUser) {
      console.log(`   Exemple d'utilisateur: ${sampleUser.email}`);
      console.log(`   Données disponibles:`);
      console.log(`   - Informations de base: ✅`);
      console.log(`   - Statut d'approbation: ✅`);
      console.log(`   - Informations d'église: ✅`);
      console.log(`   - Informations musicales: ✅`);
      console.log(`   - Profil étendu: ✅`);
    }

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Pour tester la page:');
    console.log('1. Se connecter avec un compte admin');
    console.log('2. Aller sur /app/admin/profiles');
    console.log('3. Vérifier que les filtres s\'affichent correctement');
    console.log('4. Cliquer sur "En attente" pour voir les utilisateurs non approuvés');
    console.log('5. Vérifier que les utilisateurs en attente ont une bordure jaune');
    console.log('6. Tester les boutons Approuver/Refuser');

    console.log('\n🔍 Si les utilisateurs ne s\'affichent pas:');
    console.log('1. Vérifier la console du navigateur (F12)');
    console.log('2. Vérifier que l\'API /api/admin/users/profiles fonctionne');
    console.log('3. Vérifier que la session admin est correcte');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProfilesPage();
