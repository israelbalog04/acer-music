const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminAccount() {
  try {
    console.log('🔍 Vérification du compte admin balogisrael02@gmail.com...\n');

    // Rechercher le compte
    const user = await prisma.user.findUnique({
      where: { email: 'balogisrael02@gmail.com' },
      include: {
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Compte non trouvé');
      console.log('\n📋 Solutions possibles :');
      console.log('1. Vérifier l\'email (balogisrael02@gmail.com)');
      console.log('2. Créer le compte admin avec : npm run create-admin');
      console.log('3. Ou s\'inscrire via /auth/register avec le rôle Admin');
      return;
    }

    console.log('✅ Compte trouvé !');
    console.log('\n📊 Informations du compte :');
    console.log(`   👤 Nom : ${user.firstName} ${user.lastName}`);
    console.log(`   📧 Email : ${user.email}`);
    console.log(`   🏛️ Église : ${user.church?.name} (${user.church?.city})`);
    console.log(`   👑 Rôle : ${user.role}`);
    console.log(`   ✅ Approuvé : ${user.isApproved ? 'OUI' : 'NON'}`);
    console.log(`   📅 Créé le : ${user.createdAt.toLocaleDateString('fr-FR')}`);
    
    if (user.approvedAt) {
      console.log(`   ✅ Approuvé le : ${user.approvedAt.toLocaleDateString('fr-FR')}`);
    }
    
    if (user.approvedBy) {
      console.log(`   👤 Approuvé par : ${user.approvedBy}`);
    }

    // Vérifier les problèmes potentiels
    console.log('\n🔍 Diagnostic :');
    
    if (!user.isApproved) {
      console.log('❌ PROBLÈME : Compte non approuvé');
      console.log('   Solution : Approuver le compte via l\'interface admin');
    } else {
      console.log('✅ Compte approuvé');
    }

    if (!user.password) {
      console.log('❌ PROBLÈME : Pas de mot de passe');
      console.log('   Solution : Réinitialiser le mot de passe');
    } else {
      console.log('✅ Mot de passe configuré');
    }

    if (user.role !== 'ADMIN') {
      console.log('❌ PROBLÈME : Rôle non admin');
      console.log(`   Rôle actuel : ${user.role}`);
      console.log('   Solution : Changer le rôle en ADMIN');
    } else {
      console.log('✅ Rôle admin correct');
    }

    // Lister tous les admins de la même église
    console.log('\n👥 Autres admins de la même église :');
    const otherAdmins = await prisma.user.findMany({
      where: {
        churchId: user.churchId,
        role: 'ADMIN',
        email: { not: 'balogisrael02@gmail.com' }
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        isApproved: true
      }
    });

    if (otherAdmins.length === 0) {
      console.log('   Aucun autre admin trouvé');
    } else {
      otherAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.firstName} ${admin.lastName}) - ${admin.isApproved ? 'Approuvé' : 'Non approuvé'}`);
      });
    }

    // Suggestions de résolution
    console.log('\n🛠️ Solutions recommandées :');
    
    if (!user.isApproved) {
      console.log('1. Se connecter avec un autre admin pour approuver ce compte');
      console.log('2. Ou utiliser un compte admin de test :');
      console.log('   - admin@acer-paris.com (password)');
      console.log('   - admin@acer-lyon.com (password)');
    }
    
    if (!user.password) {
      console.log('3. Réinitialiser le mot de passe via l\'interface admin');
    }

    console.log('\n4. Vérifier que le mot de passe est correct');
    console.log('5. Essayer de se connecter sur /auth/login');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminAccount();
