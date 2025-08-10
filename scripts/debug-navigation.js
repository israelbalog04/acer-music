const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugNavigation() {
  try {
    console.log('🔍 Débogage de la navigation SUPER_ADMIN...\n');

    // Test 1: Vérifier que le SUPER_ADMIN existe
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
        isApproved: true
      }
    });

    if (!superAdmin) {
      console.log('❌ Aucun Super Admin trouvé');
      return;
    }

    console.log(`✅ Super Admin trouvé: ${superAdmin.email}`);
    console.log(`   Rôle: ${superAdmin.role}`);
    console.log(`   Approuvé: ${superAdmin.isApproved}`);

    // Test 2: Vérifier les types Prisma
    console.log('\n📊 Test 2: Vérification des types Prisma');
    
    try {
      // Tester si SUPER_ADMIN est reconnu
      const testUser = await prisma.user.findFirst({
        where: {
          role: 'SUPER_ADMIN'
        }
      });
      console.log('✅ Enum UserRole reconnaît SUPER_ADMIN');
    } catch (error) {
      console.log('❌ Erreur avec l\'enum UserRole:', error.message);
    }

    // Test 3: Simuler la logique de navigation
    console.log('\n📊 Test 3: Simulation de la navigation');
    
    // Simuler la fonction getNavigationForRole
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

    const navigation = getNavigationForRole(superAdmin.role);
    console.log(`   Navigation générée pour ${superAdmin.role}:`);
    navigation.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} (${item.href}) - Section: ${item.section}`);
    });

    // Test 4: Vérifier les fichiers de pages
    console.log('\n📊 Test 4: Vérification des pages');
    const fs = require('fs');
    const path = require('path');

    const pagesToCheck = [
      'src/app/app/super-admin/churches/page.tsx',
      'src/app/app/super-admin/users/page.tsx'
    ];

    pagesToCheck.forEach(pagePath => {
      if (fs.existsSync(pagePath)) {
        console.log(`   ✅ ${pagePath} existe`);
      } else {
        console.log(`   ❌ ${pagePath} n'existe pas`);
      }
    });

    // Test 5: Vérifier les APIs
    console.log('\n📊 Test 5: Vérification des APIs');
    const apisToCheck = [
      'src/app/api/super-admin/churches/route.ts',
      'src/app/api/super-admin/users/route.ts'
    ];

    apisToCheck.forEach(apiPath => {
      if (fs.existsSync(apiPath)) {
        console.log(`   ✅ ${apiPath} existe`);
      } else {
        console.log(`   ❌ ${apiPath} n'existe pas`);
      }
    });

    // Test 6: Vérifier la session utilisateur
    console.log('\n📊 Test 6: Structure de session attendue');
    console.log('   La session devrait contenir:');
    console.log('   - role: "SUPER_ADMIN"');
    console.log('   - isApproved: true');
    console.log('   - churchId: string');
    console.log('   - churchName: string');
    console.log('   - churchCity: string');

    console.log('\n🎉 Débogage terminé !');
    console.log('\n📋 Solutions possibles:');
    console.log('1. Vérifier que le serveur a redémarré après les changements');
    console.log('2. Vérifier que Prisma Client a été régénéré');
    console.log('3. Vérifier la console du navigateur pour les erreurs');
    console.log('4. Vérifier que la session contient bien le rôle SUPER_ADMIN');
    console.log('5. Vider le cache du navigateur');

    console.log('\n🔍 Pour vérifier la session:');
    console.log('1. Ouvrir les outils de développement (F12)');
    console.log('2. Aller dans l\'onglet Console');
    console.log('3. Taper: console.log(session)');
    console.log('4. Vérifier que role === "SUPER_ADMIN"');

  } catch (error) {
    console.error('❌ Erreur lors du débogage :', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNavigation();
