const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSession() {
  try {
    console.log('🔍 Test de la session SUPER_ADMIN...\n');

    // Test 1: Vérifier le super admin dans la base de données
    console.log('📊 Test 1: Vérification du Super Admin en base');
    
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
      console.log('❌ Aucun Super Admin trouvé en base');
      return;
    }

    console.log(`✅ Super Admin en base: ${superAdmin.email}`);
    console.log(`   Rôle: ${superAdmin.role}`);
    console.log(`   Approuvé: ${superAdmin.isApproved}`);
    console.log(`   Église: ${superAdmin.church.name} (${superAdmin.church.city})`);

    // Test 2: Simuler la structure de session attendue
    console.log('\n📊 Test 2: Structure de session attendue');
    
    const expectedSession = {
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: `${superAdmin.firstName} ${superAdmin.lastName}`,
        role: superAdmin.role,
        instruments: JSON.stringify(['Piano', 'Direction']),
        avatar: null,
        churchId: superAdmin.churchId,
        churchName: superAdmin.church.name,
        churchCity: superAdmin.church.city,
        isApproved: superAdmin.isApproved,
      }
    };

    console.log('   Session attendue:');
    console.log(`   - id: ${expectedSession.user.id}`);
    console.log(`   - email: ${expectedSession.user.email}`);
    console.log(`   - name: ${expectedSession.user.name}`);
    console.log(`   - role: ${expectedSession.user.role}`);
    console.log(`   - churchId: ${expectedSession.user.churchId}`);
    console.log(`   - churchName: ${expectedSession.user.churchName}`);
    console.log(`   - churchCity: ${expectedSession.user.churchCity}`);
    console.log(`   - isApproved: ${expectedSession.user.isApproved}`);

    // Test 3: Vérifier que le rôle est bien SUPER_ADMIN
    console.log('\n📊 Test 3: Vérification du rôle');
    
    if (expectedSession.user.role === 'SUPER_ADMIN') {
      console.log('✅ Le rôle est bien SUPER_ADMIN');
    } else {
      console.log(`❌ Le rôle est ${expectedSession.user.role} au lieu de SUPER_ADMIN`);
    }

    // Test 4: Simuler la navigation
    console.log('\n📊 Test 4: Simulation de la navigation');
    
    const getNavigationForRole = (role) => {
      const baseNavigation = [
        { name: 'Dashboard', href: '/app', icon: 'HomeIcon', section: 'main' }
      ];

      switch (role) {
        case 'SUPER_ADMIN':
          return [
            ...baseNavigation,
            // Gestion Globale
            { name: 'Toutes les Églises', href: '/app/super-admin/churches', icon: 'BuildingOfficeIcon', section: 'super-admin' },
            { name: 'Tous les Utilisateurs', href: '/app/super-admin/users', icon: 'UsersIcon', section: 'super-admin' },
            { name: 'Statistiques Globales', href: '/app/super-admin/analytics', icon: 'ChartBarIcon', section: 'super-admin' },
            { name: 'Gestion des Églises', href: '/app/super-admin/church-management', icon: 'Cog6ToothIcon', section: 'super-admin' },
            // Compte
            { name: 'Mon Profil', href: '/app/account/profile', icon: 'UserIcon', section: 'account' },
            { name: 'Notifications', href: '/app/notifications', icon: 'BellIcon', section: 'account' },
            { name: 'Paramètres', href: '/app/account/settings', icon: 'Cog6ToothIcon', section: 'account' }
          ];
        default:
          return baseNavigation;
      }
    };

    const navigation = getNavigationForRole(expectedSession.user.role);
    console.log(`   Navigation générée pour ${expectedSession.user.role}:`);
    navigation.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} (${item.href}) - Section: ${item.section}`);
    });

    // Test 5: Vérifier les sections
    console.log('\n📊 Test 5: Vérification des sections');
    
    const sections = {
      main: { name: 'Principal', color: 'text-gray-700' },
      admin: { name: 'Administration', color: 'text-[#3244c7]' },
      music: { name: 'Musique', color: 'text-[#3244c7]' },
      planning: { name: 'Planning', color: 'text-[#3244c7]' },
      team: { name: 'Équipe', color: 'text-[#3244c7]' },
      account: { name: 'Mon Compte', color: 'text-[#3244c7]' },
      'super-admin': { name: 'Super Administration', color: 'text-[#3244c7]' }
    };

    // Grouper les éléments par section
    const groupedNavigation = navigation.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    }, {});

    Object.entries(groupedNavigation).forEach(([section, items]) => {
      const sectionInfo = sections[section] || { name: section, color: 'text-gray-700' };
      console.log(`   Section ${sectionInfo.name}:`);
      items.forEach(item => {
        console.log(`     - ${item.name}`);
      });
    });

    console.log('\n🎉 Test de session terminé !');
    console.log('\n📋 Pour déboguer dans le navigateur:');
    console.log('1. Se connecter avec superadmin@acer.com');
    console.log('2. Ouvrir les outils de développement (F12)');
    console.log('3. Aller dans l\'onglet Console');
    console.log('4. Taper: console.log(JSON.stringify(session, null, 2))');
    console.log('5. Vérifier que role === "SUPER_ADMIN"');

    console.log('\n🔍 Si le problème persiste:');
    console.log('1. Vider le cache du navigateur (Ctrl+Shift+R)');
    console.log('2. Vérifier que le serveur a redémarré');
    console.log('3. Vérifier les erreurs dans la console');
    console.log('4. Vérifier que Prisma Client a été régénéré');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSession();
