const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        church: true
      },
      orderBy: [
        { church: { name: 'asc' } },
        { role: 'asc' },
        { firstName: 'asc' }
      ]
    });

    console.log('\n=== COMPTES UTILISATEURS EXISTANTS ===\n');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }

    let currentChurch = '';
    
    users.forEach(user => {
      // Afficher l'en-tête de l'église si elle change
      if (user.church.name !== currentChurch) {
        currentChurch = user.church.name;
        console.log(`\n🏛️  ${currentChurch} (${user.church.city})`);
        console.log(''.padEnd(50, '-'));
      }

      // Afficher les informations de l'utilisateur
      const roleEmoji = {
        'ADMIN': '👑',
        'CHEF_LOUANGE': '🎵',
        'MUSICIEN': '🎼',
        'TECHNICIEN': '⚡'
      };

      console.log(`${roleEmoji[user.role] || '👤'} ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 ID: ${user.id}`);
      console.log(`   🏷️  Rôle: ${user.role}`);
      if (user.instruments && user.instruments.length > 0) {
        const instruments = Array.isArray(user.instruments) ? user.instruments : JSON.parse(user.instruments || '[]');
        console.log(`   🎹 Instruments: ${instruments.join(', ')}`);
      }
      console.log('');
    });

    console.log(`\n📊 Total: ${users.length} utilisateurs`);
    console.log('\n⚠️  IMPORTANT: Les mots de passe sont hashés et ne peuvent pas être affichés en clair.');
    console.log('💡 Pour vous connecter, utilisez les mots de passe définis lors de la création des comptes.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();