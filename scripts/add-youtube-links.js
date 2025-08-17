const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Exemples de liens YouTube pour des chansons populaires
const youtubeLinks = [
  {
    title: 'Amazing Grace',
    youtubeUrl: 'https://www.youtube.com/watch?v=HsCp5LG_zNE'
  },
  {
    title: 'How Great Thou Art',
    youtubeUrl: 'https://www.youtube.com/watch?v=1SkzHP0jVtU'
  },
  {
    title: 'Blessed Be Your Name',
    youtubeUrl: 'https://www.youtube.com/watch?v=0xBjWJdKdJ8'
  },
  {
    title: 'In Christ Alone',
    youtubeUrl: 'https://www.youtube.com/watch?v=8welVgKX8Qo'
  },
  {
    title: '10,000 Reasons',
    youtubeUrl: 'https://www.youtube.com/watch?v=DXDGE_lRI0E'
  },
  {
    title: 'What a Beautiful Name',
    youtubeUrl: 'https://www.youtube.com/watch?v=nQWFzMvCfLE'
  },
  {
    title: 'Good Good Father',
    youtubeUrl: 'https://www.youtube.com/watch?v=djrY_eFDOwE'
  },
  {
    title: 'Oceans (Where Feet May Fail)',
    youtubeUrl: 'https://www.youtube.com/watch?v=dy9nwe9_xzw'
  },
  {
    title: 'Reckless Love',
    youtubeUrl: 'https://www.youtube.com/watch?v=Sc6SSHuZvQE'
  },
  {
    title: 'Build My Life',
    youtubeUrl: 'https://www.youtube.com/watch?v=rjQd8tkCMDw'
  }
];

async function addYouTubeLinks() {
  try {
    console.log('🎵 Ajout des liens YouTube aux chansons...');

    // Récupérer toutes les églises
    const churches = await prisma.church.findMany();
    
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée. Créez d\'abord une église.');
      return;
    }

    const church = churches[0]; // Utiliser la première église
    console.log(`📍 Utilisation de l'église: ${church.name}`);

    let updatedCount = 0;
    let createdCount = 0;

    for (const linkData of youtubeLinks) {
      // Chercher si la chanson existe déjà
      let song = await prisma.song.findFirst({
        where: {
          title: {
            contains: linkData.title
          },
          churchId: church.id
        }
      });

      if (song) {
        // Mettre à jour la chanson existante
        if (!song.youtubeUrl) {
          await prisma.song.update({
            where: { id: song.id },
            data: { youtubeUrl: linkData.youtubeUrl }
          });
          console.log(`✅ Mis à jour: ${song.title} - ${linkData.youtubeUrl}`);
          updatedCount++;
        } else {
          console.log(`ℹ️  Déjà présent: ${song.title}`);
        }
      } else {
        // Créer une nouvelle chanson
        song = await prisma.song.create({
          data: {
            title: linkData.title,
            artist: 'Artiste inconnu',
            youtubeUrl: linkData.youtubeUrl,
            key: 'C',
            tags: JSON.stringify(['gospel', 'louange']),
            isActive: true,
            churchId: church.id
          }
        });
        console.log(`🆕 Créé: ${song.title} - ${linkData.youtubeUrl}`);
        createdCount++;
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`✅ Chansons mises à jour: ${updatedCount}`);
    console.log(`🆕 Nouvelles chansons créées: ${createdCount}`);
    console.log(`🎯 Total traité: ${updatedCount + createdCount}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour lister toutes les chansons avec leurs liens YouTube
async function listSongsWithYouTube() {
  try {
    console.log('📋 Liste des chansons avec liens YouTube:');
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const songs = await prisma.song.findMany({
      where: {
        churchId: churches[0].id,
        youtubeUrl: {
          not: null
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    if (songs.length === 0) {
      console.log('ℹ️  Aucune chanson avec lien YouTube trouvée.');
      return;
    }

    songs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   YouTube: ${song.youtubeUrl}`);
      console.log(`   Artiste: ${song.artist || 'Non spécifié'}`);
      console.log(`   Tonalité: ${song.key || 'Non spécifiée'}`);
      console.log('');
    });

    console.log(`📊 Total: ${songs.length} chansons avec liens YouTube`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour nettoyer les liens YouTube invalides
async function cleanInvalidYouTubeLinks() {
  try {
    console.log('🧹 Nettoyage des liens YouTube invalides...');
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const songs = await prisma.song.findMany({
      where: {
        churchId: churches[0].id,
        youtubeUrl: {
          not: null
        }
      }
    });

    let cleanedCount = 0;

    for (const song of songs) {
      const youtubeUrl = song.youtubeUrl;
      
      // Vérifier si le lien est valide
      const isValid = youtubeUrl.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/);
      
      if (!isValid) {
        await prisma.song.update({
          where: { id: song.id },
          data: { youtubeUrl: null }
        });
        console.log(`🧹 Nettoyé: ${song.title} - Lien invalide supprimé`);
        cleanedCount++;
      }
    }

    console.log(`✅ Nettoyage terminé: ${cleanedCount} liens invalides supprimés`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter selon l'argument passé
const command = process.argv[2];

switch (command) {
  case 'add':
    addYouTubeLinks();
    break;
  case 'list':
    listSongsWithYouTube();
    break;
  case 'clean':
    cleanInvalidYouTubeLinks();
    break;
  default:
    console.log('🎵 Script de gestion des liens YouTube');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/add-youtube-links.js add    - Ajouter des liens YouTube');
    console.log('  node scripts/add-youtube-links.js list   - Lister les chansons avec YouTube');
    console.log('  node scripts/add-youtube-links.js clean  - Nettoyer les liens invalides');
    console.log('');
    console.log('Exemples:');
    console.log('  node scripts/add-youtube-links.js add');
    console.log('  node scripts/add-youtube-links.js list');
}
