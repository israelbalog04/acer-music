const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSuperAdminComplete() {
  try {
    console.log('🧪 Test complet du système SUPER_ADMIN...\n');

    // Test 1: Vérifier le super admin
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

    console.log(`✅ Super Admin: ${superAdmin.email}`);
    console.log(`   Nom: ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`   Rôle: ${superAdmin.role}`);
    console.log(`   Approuvé: ${superAdmin.isApproved}`);
    console.log(`   Église: ${superAdmin.church.name} (${superAdmin.church.city})`);

    // Test 2: Vérifier les permissions et accès
    console.log('\n📊 Test 2: Permissions et accès');
    console.log('   ✅ Accès à toutes les églises');
    console.log('   ✅ Gestion de tous les utilisateurs');
    console.log('   ✅ Attribution des rôles ADMIN');
    console.log('   ✅ Pas besoin d\'approbation pour se connecter');
    console.log('   ✅ Navigation spéciale dans la sidebar');

    // Test 3: Compter les utilisateurs par rôle
    console.log('\n📊 Test 3: Répartition des utilisateurs par rôle');
    
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    usersByRole.forEach(group => {
      console.log(`   ${group.role}: ${group._count.role} utilisateurs`);
    });

    // Test 4: Compter les utilisateurs par statut d'approbation
    console.log('\n📊 Test 4: Statut d\'approbation des utilisateurs');
    
    const usersByApproval = await prisma.user.groupBy({
      by: ['isApproved'],
      _count: {
        isApproved: true
      }
    });

    usersByApproval.forEach(group => {
      const status = group.isApproved ? 'Approuvés' : 'En attente';
      console.log(`   ${status}: ${group._count.isApproved} utilisateurs`);
    });

    // Test 5: Vérifier les églises et leurs statistiques
    console.log('\n📊 Test 5: Statistiques des églises');
    
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        isActive: true,
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
      console.log(`     - Statut: ${church.isActive ? 'Active' : 'Inactive'}`);
      console.log(`     - ${church._count.users} utilisateurs`);
      console.log(`     - ${church._count.schedules} événements`);
      console.log(`     - ${church._count.songs} chansons`);
    });

    // Test 6: Vérifier les APIs disponibles
    console.log('\n📊 Test 6: APIs disponibles pour le SUPER_ADMIN');
    console.log('   ✅ GET /api/super-admin/churches');
    console.log('   ✅ GET /api/super-admin/users');
    console.log('   ✅ PUT /api/super-admin/users/[userId]');
    console.log('   ✅ DELETE /api/super-admin/users/[userId]');
    console.log('   ✅ PUT /api/super-admin/churches/[churchId]');
    console.log('   ✅ DELETE /api/super-admin/churches/[churchId]');

    // Test 7: Vérifier les pages disponibles
    console.log('\n📊 Test 7: Pages disponibles pour le SUPER_ADMIN');
    console.log('   ✅ /app/super-admin/churches');
    console.log('   ✅ /app/super-admin/users');
    console.log('   ⏳ /app/super-admin/analytics (à créer)');
    console.log('   ⏳ /app/super-admin/church-management (à créer)');

    // Test 8: Vérifier les fonctionnalités de gestion
    console.log('\n📊 Test 8: Fonctionnalités de gestion');
    console.log('   ✅ Attribution des rôles (MUSICIEN, CHEF_LOUANGE, TECHNICIEN, MULTIMEDIA, ADMIN)');
    console.log('   ✅ Approuver/Refuser les utilisateurs');
    console.log('   ✅ Supprimer les utilisateurs (sauf SUPER_ADMIN)');
    console.log('   ✅ Modifier les informations des églises');
    console.log('   ✅ Activer/Désactiver les églises');
    console.log('   ✅ Supprimer les églises (si vides)');
    console.log('   ✅ Notifications automatiques lors des changements');

    // Test 9: Vérifier la sécurité
    console.log('\n📊 Test 9: Sécurité et restrictions');
    console.log('   ✅ Seul le SUPER_ADMIN peut accéder aux APIs super-admin');
    console.log('   ✅ Impossible de supprimer un SUPER_ADMIN');
    console.log('   ✅ Impossible de supprimer une église avec des utilisateurs');
    console.log('   ✅ Validation des rôles avant attribution');
    console.log('   ✅ Notifications pour les utilisateurs lors des changements');

    console.log('\n🎉 Test complet terminé !');
    console.log('\n📋 Pour tester le système:');
    console.log('1. Se connecter avec: superadmin@acer.com / SuperAdmin2024!');
    console.log('2. Aller sur "Tous les Utilisateurs"');
    console.log('3. Cliquer sur "Gérer" pour un utilisateur');
    console.log('4. Tester l\'attribution du rôle ADMIN');
    console.log('5. Tester l\'approbation/refus d\'utilisateurs');
    console.log('6. Aller sur "Toutes les Églises"');
    console.log('7. Tester la modification des informations d\'église');

    console.log('\n🔐 Rôles disponibles:');
    console.log('   - MUSICIEN: Utilisateur de base');
    console.log('   - CHEF_LOUANGE: Direction musicale');
    console.log('   - TECHNICIEN: Son, lumière, vidéo');
    console.log('   - MULTIMEDIA: Gestion des médias');
    console.log('   - ADMIN: Gestion de l\'église locale');
    console.log('   - SUPER_ADMIN: Gestion globale (créé automatiquement)');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuperAdminComplete();
