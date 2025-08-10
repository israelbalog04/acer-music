const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSuperAdminUI() {
  try {
    console.log('🧪 Test de l\'interface SUPER_ADMIN...\n');

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
        isApproved: true
      }
    });

    if (!superAdmin) {
      console.log('❌ Aucun Super Admin trouvé');
      return;
    }

    console.log(`✅ Super Admin: ${superAdmin.email}`);
    console.log(`   Rôle: ${superAdmin.role}`);
    console.log(`   Approuvé: ${superAdmin.isApproved}`);

    // Test 2: Vérifier les fichiers de l'interface
    console.log('\n📊 Test 2: Vérification des fichiers de l\'interface');
    const fs = require('fs');

    const filesToCheck = [
      'src/components/layout/sidebar.tsx',
      'src/lib/permissions.ts',
      'src/app/app/super-admin/churches/page.tsx',
      'src/app/app/super-admin/users/page.tsx',
      'src/app/api/super-admin/churches/route.ts',
      'src/app/api/super-admin/users/route.ts'
    ];

    filesToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${filePath} existe`);
      } else {
        console.log(`   ❌ ${filePath} n'existe pas`);
      }
    });

    // Test 3: Vérifier les imports dans sidebar.tsx
    console.log('\n📊 Test 3: Vérification des imports dans sidebar.tsx');
    
    const sidebarContent = fs.readFileSync('src/components/layout/sidebar.tsx', 'utf8');
    
    const requiredImports = [
      'BuildingOfficeIcon',
      'getNavigationForRole'
    ];

    requiredImports.forEach(importName => {
      if (sidebarContent.includes(importName)) {
        console.log(`   ✅ ${importName} est importé`);
      } else {
        console.log(`   ❌ ${importName} n'est pas importé`);
      }
    });

    // Test 4: Vérifier la section super-admin dans sidebar.tsx
    console.log('\n📊 Test 4: Vérification de la section super-admin');
    
    if (sidebarContent.includes("'super-admin': { name: 'Super Administration'")) {
      console.log('   ✅ Section super-admin configurée');
    } else {
      console.log('   ❌ Section super-admin manquante');
    }

    // Test 5: Vérifier la navigation dans permissions.ts
    console.log('\n📊 Test 5: Vérification de la navigation');
    
    const permissionsContent = fs.readFileSync('src/lib/permissions.ts', 'utf8');
    
    if (permissionsContent.includes('case UserRole.SUPER_ADMIN:')) {
      console.log('   ✅ Navigation SUPER_ADMIN configurée');
    } else {
      console.log('   ❌ Navigation SUPER_ADMIN manquante');
    }

    // Test 6: Vérifier les pages
    console.log('\n📊 Test 6: Vérification des pages');
    
    const churchesPageContent = fs.readFileSync('src/app/app/super-admin/churches/page.tsx', 'utf8');
    const usersPageContent = fs.readFileSync('src/app/app/super-admin/users/page.tsx', 'utf8');
    
    if (churchesPageContent.includes('session?.user?.role === \'SUPER_ADMIN\'')) {
      console.log('   ✅ Page churches vérifie le rôle SUPER_ADMIN');
    } else {
      console.log('   ❌ Page churches ne vérifie pas le rôle SUPER_ADMIN');
    }
    
    if (usersPageContent.includes('session?.user?.role === \'SUPER_ADMIN\'')) {
      console.log('   ✅ Page users vérifie le rôle SUPER_ADMIN');
    } else {
      console.log('   ❌ Page users ne vérifie pas le rôle SUPER_ADMIN');
    }

    console.log('\n🎉 Test de l\'interface terminé !');
    console.log('\n📋 Pour tester l\'interface:');
    console.log('1. Attendre que le serveur redémarre complètement');
    console.log('2. Aller sur http://localhost:3000/auth/login');
    console.log('3. Se connecter avec: superadmin@acer.com / SuperAdmin2024!');
    console.log('4. Vérifier que la sidebar affiche:');
    console.log('   - Dashboard');
    console.log('   - Toutes les Églises');
    console.log('   - Tous les Utilisateurs');
    console.log('   - Statistiques Globales');
    console.log('   - Gestion des Églises');
    console.log('   - Mon Profil');
    console.log('   - Notifications');
    console.log('   - Paramètres');

    console.log('\n🔍 Si la navigation ne s\'affiche toujours pas:');
    console.log('1. Vider le cache du navigateur (Ctrl+Shift+R)');
    console.log('2. Ouvrir les outils de développement (F12)');
    console.log('3. Aller dans l\'onglet Console');
    console.log('4. Taper: console.log(session?.user?.role)');
    console.log('5. Vérifier que le résultat est "SUPER_ADMIN"');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuperAdminUI();
