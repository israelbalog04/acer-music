const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminPage() {
  try {
    console.log('🧪 Test de la page admin /app/admin/pending-approvals...\n');

    // Test 1: Vérifier que la page existe
    console.log('📊 Test 1: Vérification de l\'existence de la page');
    const fs = require('fs');
    const path = require('path');
    
    const pagePath = path.join(process.cwd(), 'src/app/app/admin/pending-approvals/page.tsx');
    const pageExists = fs.existsSync(pagePath);
    
    console.log(`   Page existe: ${pageExists ? '✅ OUI' : '❌ NON'}`);
    console.log(`   Chemin: ${pagePath}`);

    // Test 2: Vérifier que l'API existe
    console.log('\n📊 Test 2: Vérification de l\'existence de l\'API');
    const apiPath = path.join(process.cwd(), 'src/app/api/admin/users/pending/route.ts');
    const apiExists = fs.existsSync(apiPath);
    
    console.log(`   API existe: ${apiExists ? '✅ OUI' : '❌ NON'}`);
    console.log(`   Chemin: ${apiPath}`);

    // Test 3: Vérifier la navigation
    console.log('\n📊 Test 3: Vérification de la navigation');
    const permissionsPath = path.join(process.cwd(), 'src/lib/permissions.ts');
    const permissionsContent = fs.readFileSync(permissionsPath, 'utf8');
    
    const hasPendingApprovals = permissionsContent.includes('pending-approvals');
    console.log(`   Lien dans la navigation: ${hasPendingApprovals ? '✅ OUI' : '❌ NON'}`);

    // Test 4: Simuler une requête API
    console.log('\n📊 Test 4: Simulation de l\'API');
    
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
        role: true,
        createdAt: true
      }
    });

    console.log(`📊 Utilisateurs en attente: ${pendingUsers.length}`);
    
    if (pendingUsers.length > 0) {
      console.log('📋 Liste des utilisateurs:');
      pendingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
      });
    }

    // Test 5: Vérifier les composants UI
    console.log('\n📊 Test 5: Vérification des composants UI');
    
    // Vérifier que Card existe
    const cardPath = path.join(process.cwd(), 'src/components/ui/card.tsx');
    const cardExists = fs.existsSync(cardPath);
    console.log(`   Composant Card: ${cardExists ? '✅ OUI' : '❌ NON'}`);

    // Vérifier que Button existe
    const buttonPath = path.join(process.cwd(), 'src/components/ui/button.tsx');
    const buttonExists = fs.existsSync(buttonPath);
    console.log(`   Composant Button: ${buttonExists ? '✅ OUI' : '❌ NON'}`);

    // Test 6: Vérifier les imports dans la page
    console.log('\n📊 Test 6: Vérification des imports');
    if (pageExists) {
      const pageContent = fs.readFileSync(pagePath, 'utf8');
      
      const hasCardImport = pageContent.includes('Card');
      const hasButtonImport = pageContent.includes('Button');
      const hasUseSession = pageContent.includes('useSession');
      const hasUseEffect = pageContent.includes('useEffect');
      
      console.log(`   Import Card: ${hasCardImport ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Import Button: ${hasButtonImport ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Import useSession: ${hasUseSession ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Import useEffect: ${hasUseEffect ? '✅ OUI' : '❌ NON'}`);
    }

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Pour tester la page:');
    console.log('1. Se connecter avec un compte admin');
    console.log('2. Aller sur /app/admin/pending-approvals');
    console.log('3. Vérifier que les utilisateurs s\'affichent');
    console.log('4. Vérifier les logs du navigateur (F12)');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminPage();
