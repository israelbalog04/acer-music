const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSuperAdminLogin() {
  try {
    console.log('🧪 Test de connexion du Super Admin...\n');

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
        password: true,
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

    // Test 2: Vérifier le mot de passe
    console.log('\n📊 Test 2: Vérification du mot de passe');
    
    const testPassword = 'SuperAdmin2024!';
    const isPasswordValid = await bcrypt.compare(testPassword, superAdmin.password);
    
    console.log(`   Mot de passe testé: ${testPassword}`);
    console.log(`   Mot de passe valide: ${isPasswordValid ? '✅ OUI' : '❌ NON'}`);

    // Test 3: Simuler la logique d'authentification
    console.log('\n📊 Test 3: Simulation de l\'authentification');
    
    if (!superAdmin.isApproved && superAdmin.role !== 'SUPER_ADMIN') {
      console.log('❌ Utilisateur non approuvé et pas SUPER_ADMIN');
    } else {
      console.log('✅ Utilisateur peut se connecter (approuvé ou SUPER_ADMIN)');
    }

    // Test 4: Vérifier les types Prisma
    console.log('\n📊 Test 4: Vérification des types Prisma');
    
    try {
      // Tester si SUPER_ADMIN est reconnu dans l'enum
      const testUser = await prisma.user.findFirst({
        where: {
          role: 'SUPER_ADMIN'
        }
      });
      console.log('✅ Enum UserRole reconnaît SUPER_ADMIN');
    } catch (error) {
      console.log('❌ Erreur avec l\'enum UserRole:', error.message);
    }

    // Test 5: Vérifier la structure de la session
    console.log('\n📊 Test 5: Structure de session attendue');
    console.log('   La session devrait contenir:');
    console.log('   - id: string');
    console.log('   - email: string');
    console.log('   - name: string');
    console.log('   - role: "SUPER_ADMIN"');
    console.log('   - instruments: string[]');
    console.log('   - avatar: string | null');
    console.log('   - churchId: string');
    console.log('   - churchName: string');
    console.log('   - churchCity: string');
    console.log('   - isApproved: boolean');

    console.log('\n🎉 Test terminé !');
    console.log('\n📋 Pour tester la connexion:');
    console.log('1. Aller sur http://localhost:3000/auth/login');
    console.log('2. Email: superadmin@acer.com');
    console.log('3. Mot de passe: SuperAdmin2024!');
    console.log('4. Vérifier que la connexion fonctionne');
    console.log('5. Vérifier que la navigation SUPER_ADMIN s\'affiche');

    console.log('\n🔍 Si la connexion échoue:');
    console.log('1. Vérifier que le serveur a redémarré');
    console.log('2. Vérifier que Prisma Client a été régénéré');
    console.log('3. Vérifier les logs du serveur');
    console.log('4. Vérifier que l\'enum UserRole contient SUPER_ADMIN');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuperAdminLogin();
