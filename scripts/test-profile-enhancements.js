const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProfileEnhancements() {
  console.log('🧪 Test des améliorations de profil');
  
  try {
    // 1. Récupérer un utilisateur existant
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.firstName} ${user.lastName}`);
    
    // 2. Tester la mise à jour des nouveaux champs
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: 'Musicien passionné depuis plus de 10 ans, spécialisé dans la louange moderne.',
        skillLevel: 'INTERMEDIATE',
        musicalExperience: 10,
        voiceType: 'TENOR',
        canLead: true,
        primaryInstrument: 'Guitare Électrique',
        preferredGenres: JSON.stringify(['Gospel', 'Contemporain', 'Rock Chrétien']),
        whatsapp: '+33 6 12 34 56 78',
        emergencyContact: JSON.stringify({
          name: 'Marie Dupont',
          phone: '+33 6 98 76 54 32',
          relation: 'Épouse'
        }),
        socialMedia: JSON.stringify({
          instagram: '@musicien_gospel',
          youtube: 'MusicienGospel'
        }),
        isPublic: true,
        language: 'fr',
        generalAvailability: JSON.stringify({
          sunday_morning: true,
          sunday_evening: true,
          weekdays: false,
          rehearsals: true
        })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        skillLevel: true,
        musicalExperience: true,
        voiceType: true,
        canLead: true,
        primaryInstrument: true,
        preferredGenres: true,
        whatsapp: true,
        emergencyContact: true,
        socialMedia: true,
        isPublic: true,
        language: true,
        generalAvailability: true
      }
    });
    
    console.log('✅ Profil mis à jour avec les nouveaux champs:');
    console.log(`   Bio: ${updatedUser.bio}`);
    console.log(`   Niveau: ${updatedUser.skillLevel}`);
    console.log(`   Expérience: ${updatedUser.musicalExperience} ans`);
    console.log(`   Type vocal: ${updatedUser.voiceType}`);
    console.log(`   Peut diriger: ${updatedUser.canLead ? 'Oui' : 'Non'}`);
    console.log(`   Instrument principal: ${updatedUser.primaryInstrument}`);
    console.log(`   Genres préférés: ${updatedUser.preferredGenres}`);
    console.log(`   WhatsApp: ${updatedUser.whatsapp}`);
    console.log(`   Contact d'urgence: ${updatedUser.emergencyContact}`);
    console.log(`   Réseaux sociaux: ${updatedUser.socialMedia}`);
    console.log(`   Profil public: ${updatedUser.isPublic ? 'Oui' : 'Non'}`);
    console.log(`   Langue: ${updatedUser.language}`);
    console.log(`   Disponibilités: ${updatedUser.generalAvailability}`);
    
    // 3. Tester la récupération complète via l'API (simulée)
    const profileData = await prisma.user.findFirst({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        instruments: true,
        primaryInstrument: true,
        skillLevel: true,
        musicalExperience: true,
        voiceType: true,
        canLead: true,
        preferredGenres: true,
        avatar: true,
        bio: true,
        birthDate: true,
        joinedChurchDate: true,
        address: true,
        whatsapp: true,
        emergencyContact: true,
        socialMedia: true,
        isPublic: true,
        notificationPrefs: true,
        language: true,
        generalAvailability: true,
        createdAt: true,
        updatedAt: true,
        church: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });
    
    console.log('\n✅ Récupération complète du profil réussie');
    console.log(`   Utilisateur: ${profileData.firstName} ${profileData.lastName}`);
    console.log(`   Email: ${profileData.email}`);
    console.log(`   Église: ${profileData.church.name} (${profileData.church.city})`);
    
    console.log('\n✅ Test des améliorations de profil terminé avec succès!');
    console.log('\n📋 Nouveaux champs disponibles:');
    console.log('   🎵 Informations musicales: niveau, expérience, voix, capacité de direction');
    console.log('   👤 Profil: bio, date de naissance, date d\'arrivée');
    console.log('   📱 Contact: WhatsApp, contact d\'urgence, réseaux sociaux');
    console.log('   ⚙️  Préférences: visibilité, langue, disponibilités');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProfileEnhancements();