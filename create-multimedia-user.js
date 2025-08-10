const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createMultimediaUser() {
  try {
    console.log('🔍 Recherche d\'une église existante...');
    
    // Trouver une église existante
    const church = await prisma.church.findFirst();
    
    if (!church) {
      console.error('❌ Aucune église trouvée. Créez d\'abord une église.');
      return;
    }
    
    console.log(`✅ Église trouvée: ${church.name}`);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'multimedia@test.com' }
    });
    
    if (existingUser) {
      console.log('⚠️  L\'utilisateur multimedia@test.com existe déjà');
      console.log('📧 Email: multimedia@test.com');
      console.log('🔑 Mot de passe: multimedia123');
      console.log('👤 Rôle: MULTIMEDIA');
      return;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('multimedia123', 10);
    
    // Créer l'utilisateur MULTIMEDIA
    const multimediaUser = await prisma.user.create({
      data: {
        email: 'multimedia@test.com',
        firstName: 'Jean',
        lastName: 'Photographe',
        phone: '+33 6 12 34 56 78',
        password: hashedPassword,
        role: 'MULTIMEDIA',
        instruments: JSON.stringify(['Appareil Photo', 'Caméra']),
        primaryInstrument: 'Appareil Photo',
        skillLevel: 'INTERMEDIATE',
        musicalExperience: 2,
        canLead: false,
        preferredGenres: JSON.stringify(['Gospel', 'Contemporain']),
        bio: 'Photographe et vidéaste de l\'équipe multimédia. Spécialisé dans la capture des moments de louange et des événements musicaux.',
        birthDate: new Date('1990-05-15'),
        joinedChurchDate: new Date('2022-01-15'),
        address: '123 Rue de la Musique, 75001 Paris',
        whatsapp: '+33 6 12 34 56 78',
        emergencyContact: JSON.stringify({
          name: 'Marie Photographe',
          phone: '+33 6 98 76 54 32',
          relation: 'Épouse'
        }),
        socialMedia: JSON.stringify({
          instagram: '@jean_photographe',
          facebook: 'jean.photographe',
          youtube: 'JeanPhotographe'
        }),
        isPublic: true,
        notificationPrefs: JSON.stringify({
          email: true,
          push: true,
          sms: false
        }),
        language: 'fr',
        generalAvailability: JSON.stringify({
          monday: ['morning', 'evening'],
          tuesday: ['morning', 'evening'],
          wednesday: ['morning', 'evening'],
          thursday: ['morning', 'evening'],
          friday: ['morning', 'evening'],
          saturday: ['morning', 'afternoon', 'evening'],
          sunday: ['morning', 'afternoon', 'evening']
        }),
        churchId: church.id
      }
    });
    
    console.log('✅ Utilisateur MULTIMEDIA créé avec succès !');
    console.log('📧 Email: multimedia@test.com');
    console.log('🔑 Mot de passe: multimedia123');
    console.log('👤 Nom: Jean Photographe');
    console.log('🎭 Rôle: MULTIMEDIA');
    console.log('🏛️  Église: ' + church.name);
    console.log('📱 Téléphone: +33 6 12 34 56 78');
    console.log('📸 Instruments: Appareil Photo, Caméra');
    console.log('📝 Bio: Photographe et vidéaste de l\'équipe multimédia');
    
    console.log('\n🎯 Fonctionnalités disponibles:');
    console.log('- 📸 Upload d\'images des musiciens');
    console.log('- 🏷️  Gestion des tags et métadonnées');
    console.log('- 📅 Liaison avec les événements');
    console.log('- 👁️  Contrôle de visibilité (public/privé)');
    console.log('- ✅ Gestion des statuts (actif/inactif)');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMultimediaUser();
