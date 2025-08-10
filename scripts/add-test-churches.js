const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestChurches() {
  try {
    console.log('🏛️ Ajout d\'églises de test...\n');

    const churches = [
      {
        name: 'ACER Paris',
        city: 'Paris',
        address: '123 Rue de la Musique, 75001 Paris',
        phone: '+33 1 42 34 56 78',
        email: 'contact@acer-paris.com',
        website: 'https://acer-paris.com',
        description: 'Église ACER Paris - Centre de musique et de louange'
      },
      {
        name: 'ACER Lyon',
        city: 'Lyon',
        address: '456 Avenue de la Louange, 69001 Lyon',
        phone: '+33 4 72 34 56 78',
        email: 'contact@acer-lyon.com',
        website: 'https://acer-lyon.com',
        description: 'Église ACER Lyon - Communauté musicale dynamique'
      },
      {
        name: 'ACER Marseille',
        city: 'Marseille',
        address: '789 Boulevard de l\'Adoration, 13001 Marseille',
        phone: '+33 4 91 34 56 78',
        email: 'contact@acer-marseille.com',
        website: 'https://acer-marseille.com',
        description: 'Église ACER Marseille - Passion pour la musique sacrée'
      },
      {
        name: 'ACER Toulouse',
        city: 'Toulouse',
        address: '321 Rue du Chant, 31000 Toulouse',
        phone: '+33 5 61 34 56 78',
        email: 'contact@acer-toulouse.com',
        website: 'https://acer-toulouse.com',
        description: 'Église ACER Toulouse - Harmonie et spiritualité'
      }
    ];

    for (const churchData of churches) {
      // Vérifier si l'église existe déjà
      const existingChurch = await prisma.church.findUnique({
        where: { name: churchData.name }
      });

      if (existingChurch) {
        console.log(`✅ ${churchData.name} existe déjà`);
        continue;
      }

      // Créer l'église
      const church = await prisma.church.create({
        data: churchData
      });

      console.log(`✅ ${church.name} créée avec succès`);

      // Créer un admin pour chaque église
      const adminEmail = `admin@${churchData.name.toLowerCase().replace(' ', '-')}.com`;
      
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (!existingAdmin) {
        const admin = await prisma.user.create({
          data: {
            email: adminEmail,
            firstName: 'Admin',
            lastName: churchData.name.split(' ')[1], // Lyon, Marseille, etc.
            password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // "password"
            role: 'ADMIN',
            instruments: JSON.stringify(['Piano', 'Direction']),
            isApproved: true,
            churchId: church.id,
          }
        });

        console.log(`👤 Admin créé pour ${church.name}: ${adminEmail}`);
      }
    }

    // Afficher les statistiques
    const totalChurches = await prisma.church.count();
    const totalAdmins = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    console.log('\n📊 Statistiques :');
    console.log(`  🏛️ Total églises : ${totalChurches}`);
    console.log(`  👤 Total admins : ${totalAdmins}`);

    console.log('\n🎉 Églises de test ajoutées avec succès !');
    console.log('\n📧 Comptes admin créés :');
    console.log('  - admin@acer-paris.com (mot de passe: password)');
    console.log('  - admin@acer-lyon.com (mot de passe: password)');
    console.log('  - admin@acer-marseille.com (mot de passe: password)');
    console.log('  - admin@acer-toulouse.com (mot de passe: password)');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des églises:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestChurches();
