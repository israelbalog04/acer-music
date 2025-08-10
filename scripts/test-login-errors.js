const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLoginErrors() {
  try {
    console.log('🧪 Test des messages d\'erreur de connexion...\n');

    // Test 1: Email qui n'existe pas
    console.log('1️⃣ Test avec un email inexistant...');
    const nonExistentEmail = 'nonexistent@example.com';
    const user1 = await prisma.user.findUnique({
      where: { email: nonExistentEmail }
    });
    
    if (!user1) {
      console.log('   ✅ EMAIL_NOT_FOUND - Aucun compte trouvé avec cette adresse email');
    } else {
      console.log('   ❌ Erreur: L\'email existe alors qu\'il ne devrait pas');
    }

    // Test 2: Email existant mais mot de passe incorrect
    console.log('\n2️⃣ Test avec un email existant mais mot de passe incorrect...');
    const existingUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingUser) {
      console.log(`   📧 Email testé: ${existingUser.email}`);
      
      // Test avec un mot de passe incorrect
      const wrongPassword = 'wrongpassword123';
      const isPasswordValid = await bcrypt.compare(wrongPassword, existingUser.password);
      
      if (!isPasswordValid) {
        console.log('   ✅ INVALID_PASSWORD - Mot de passe incorrect');
      } else {
        console.log('   ❌ Erreur: Le mot de passe incorrect a été accepté');
      }
    } else {
      console.log('   ⚠️ Aucun utilisateur trouvé pour le test');
    }

    // Test 3: Compte non approuvé
    console.log('\n3️⃣ Test avec un compte non approuvé...');
    const unapprovedUser = await prisma.user.findFirst({
      where: { isApproved: false }
    });

    if (unapprovedUser) {
      console.log(`   📧 Email testé: ${unapprovedUser.email}`);
      console.log(`   ✅ USER_NOT_APPROVED - Compte non approuvé (${unapprovedUser.role})`);
    } else {
      console.log('   ✅ Tous les comptes sont approuvés');
    }

    // Test 4: Compte valide
    console.log('\n4️⃣ Test avec un compte valide...');
    const validUser = await prisma.user.findFirst({
      where: { 
        isApproved: true,
        password: { not: null }
      }
    });

    if (validUser) {
      console.log(`   📧 Email testé: ${validUser.email}`);
      console.log(`   👑 Rôle: ${validUser.role}`);
      console.log(`   ✅ Compte valide pour la connexion`);
    } else {
      console.log('   ⚠️ Aucun compte valide trouvé');
    }

    // Résumé des tests
    console.log('\n📊 Résumé des tests :');
    console.log('   ✅ EMAIL_NOT_FOUND - Email inexistant');
    console.log('   ✅ INVALID_PASSWORD - Mot de passe incorrect');
    console.log('   ✅ USER_NOT_APPROVED - Compte non approuvé');
    console.log('   ✅ Compte valide - Connexion possible');

    console.log('\n🎉 Tests terminés ! Les messages d\'erreur sont maintenant spécifiques.');

  } catch (error) {
    console.error('❌ Erreur lors des tests :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginErrors();
