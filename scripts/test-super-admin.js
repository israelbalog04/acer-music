const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSuperAdmin() {
  try {
    console.log('🧪 Test du système SUPER_ADMIN...\n');

    // Test 1: Vérifier que le super admin existe
    console.log('📊 Test 1: Vérification du Super Admin');
    
    const superAdmin = await prisma.user.findFirst({
      where: { 
        role: 'SUPER_ADMIN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isApproved: true,
        churchId: true,
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    if (!superAdmin) {
      console.log('❌ Aucun Super Admin trouvé');
      return;
    }

    console.log(`✅ Super Admin trouvé: ${superAdmin.email}`);
    console.log(`   Nom: ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`   Rôle: ${superAdmin.role}`);
    console.log(`   Approuvé: ${superAdmin.isApproved}`);
    console.log(`   Église: ${superAdmin.church.name} (${superAdmin.church.city})`);

    // Test 2: Vérifier les permissions
    console.log('\n📊 Test 2: Vérification des permissions');
    console.log('   Le SUPER_ADMIN devrait avoir:');
    console.log('   - Accès à toutes les églises');
    console.log('   - Gestion de tous les utilisateurs');
    console.log('   - Pas besoin d\'approbation');
    console.log('   - Navigation spéciale');

    // Test 3: Compter les utilisateurs par église
    console.log('\n📊 Test 3: Statistiques par église');
    
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        _count: {
          select: {
            users: true,
            schedules: true,
            songs: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`   Total églises: ${churches.length}`);
    churches.forEach(church => {
      console.log(`   ${church.name} (${church.city}):`);
      console.log(`     - ${church._count.users} utilisateurs`);
      console.log(`     - ${church._count.schedules} événements`);
      console.log(`     - ${church._count.songs} chansons`);
    });

    // Test 4: Compter les utilisateurs par statut
    console.log('\n📊 Test 4: Statistiques des utilisateurs');
    
    const allUsers = await prisma.user.findMany({
      select: {
        isApproved: true,
        role: true
      }
    });

    const pendingUsers = allUsers.filter(u => !u.isApproved);
    const approvedUsers = allUsers.filter(u => u.isApproved);
    const superAdmins = allUsers.filter(u => u.role === 'SUPER_ADMIN');
    const admins = allUsers.filter(u => u.role === 'ADMIN');

    console.log(`   Total utilisateurs: ${allUsers.length}`);
    console.log(`   En attente: ${pendingUsers.length}`);
    console.log(`   Approuvés: ${approvedUsers.length}`);
    console.log(`   Super Admins: ${superAdmins.length}`);
    console.log(`   Admins: ${admins.length}`);

    // Test 5: Vérifier les APIs
    console.log('\n📊 Test 5: Vérification des APIs');
    console.log('   APIs à tester:');
    console.log('   - GET /api/super-admin/churches');
    console.log('   - GET /api/super-admin/users');
    console.log('   - GET /api/super-admin/analytics');
    console.log('   - GET /api/super-admin/church-management');

    // Test 6: Vérifier les pages
    console.log('\n📊 Test 6: Vérification des pages');
    console.log('   Pages à tester:');
    console.log('   - /app/super-admin/churches');
    console.log('   - /app/super-admin/users');
    console.log('   - /app/super-admin/analytics');
    console.log('   - /app/super-admin/church-management');

    // Test 7: Vérifier la navigation
    console.log('\n📊 Test 7: Vérification de la navigation');
    console.log('   Le SUPER_ADMIN devrait voir dans la sidebar:');
    console.log('   - Toutes les Églises');
    console.log('   - Tous les Utilisateurs');
    console.log('   - Statistiques Globales');
    console.log('   - Gestion des Églises');

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Pour tester le Super Admin:');
    console.log('1. Se connecter avec: superadmin@acer.com');
    console.log('2. Mot de passe: SuperAdmin2024!');
    console.log('3. Vérifier que la navigation spéciale s\'affiche');
    console.log('4. Tester les pages d\'administration globale');
    console.log('5. Vérifier l\'accès à toutes les églises');

    console.log('\n🔐 Permissions spéciales:');
    console.log('   - Pas besoin d\'approbation pour se connecter');
    console.log('   - Accès à toutes les églises');
    console.log('   - Gestion globale des utilisateurs');
    console.log('   - Statistiques globales');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuperAdmin();
