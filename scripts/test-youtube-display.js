const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour tester la conversion des URLs YouTube
function testYouTubeUrlConversion() {
  console.log('🔗 Test de conversion des URLs YouTube:');
  
  const testUrls = [
    'https://www.youtube.com/watch?v=HsCp5LG_zNE',
    'https://youtu.be/1SkzHP0jVtU',
    'https://youtube.com/embed/0xBjWJdKdJ8',
    'https://www.youtube.com/watch?v=8welVgKX8Qo&t=30s',
    'https://www.youtube.com/watch?v=DXDGE_lRI0E&list=PL123456',
    'invalid-url'
  ];

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/
  ];

  testUrls.forEach(url => {
    let embedUrl = '';
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        break;
      }
    }
    
    if (embedUrl) {
      console.log(`✅ ${url} → ${embedUrl}`);
    } else {
      console.log(`❌ ${url} → Conversion échouée`);
    }
  });
  
  console.log('');
}

// Fonction pour tester la validation des URLs
function testYouTubeUrlValidation() {
  console.log('🔍 Test de validation des URLs YouTube:');
  
  const testUrls = [
    'https://www.youtube.com/watch?v=HsCp5LG_zNE',
    'https://youtu.be/1SkzHP0jVtU',
    'https://youtube.com/embed/0xBjWJdKdJ8',
    'https://www.youtube.com/watch?v=8welVgKX8Qo&t=30s',
    'https://vimeo.com/123456789',
    'https://dailymotion.com/video/123456',
    'invalid-url',
    'ftp://youtube.com/watch?v=123',
    'http://fakeyoutube.com/watch?v=123'
  ];

  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;

  testUrls.forEach(url => {
    const isValid = youtubeRegex.test(url);
    console.log(`${isValid ? '✅' : '❌'} ${url}`);
  });
  
  console.log('');
}

// Fonction pour afficher les statistiques des chansons
async function displaySongStatistics() {
  try {
    console.log('📊 Statistiques des chansons:');
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    
    // Total des chansons
    const totalSongs = await prisma.song.count({
      where: { churchId: church.id }
    });
    
    // Chansons avec YouTube
    const songsWithYouTube = await prisma.song.count({
      where: {
        churchId: church.id,
        youtubeUrl: { not: null }
      }
    });
    
    // Chansons sans YouTube
    const songsWithoutYouTube = totalSongs - songsWithYouTube;
    
    // Pourcentage
    const percentage = totalSongs > 0 ? ((songsWithYouTube / totalSongs) * 100).toFixed(1) : 0;
    
    console.log(`📍 Église: ${church.name}`);
    console.log(`📈 Total des chansons: ${totalSongs}`);
    console.log(`🎬 Avec YouTube: ${songsWithYouTube} (${percentage}%)`);
    console.log(`📝 Sans YouTube: ${songsWithoutYouTube}`);
    
    // Top 5 des chansons les plus récentes avec YouTube
    const recentSongsWithYouTube = await prisma.song.findMany({
      where: {
        churchId: church.id,
        youtubeUrl: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        title: true,
        artist: true,
        youtubeUrl: true,
        createdAt: true
      }
    });
    
    if (recentSongsWithYouTube.length > 0) {
      console.log('\n🆕 5 chansons les plus récentes avec YouTube:');
      recentSongsWithYouTube.forEach((song, index) => {
        const date = new Date(song.createdAt).toLocaleDateString('fr-FR');
        console.log(`${index + 1}. ${song.title} (${song.artist || 'Artiste inconnu'}) - ${date}`);
      });
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour tester l'API des chansons
async function testSongsAPI() {
  try {
    console.log('🌐 Test de l\'API des chansons:');
    
    // Simuler une requête à l'API
    const songs = await prisma.song.findMany({
      where: {
        youtubeUrl: { not: null }
      },
      include: {
        _count: {
          select: {
            recordings: true,
            eventSongs: true
          }
        }
      },
      take: 3
    });
    
    console.log(`📡 ${songs.length} chansons récupérées via l'API:`);
    
    songs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   YouTube: ${song.youtubeUrl}`);
      console.log(`   Enregistrements: ${song._count.recordings}`);
      console.log(`   Événements: ${song._count.eventSongs}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur API:', error);
  }
}

// Fonction pour vérifier la cohérence des données
async function checkDataConsistency() {
  try {
    console.log('🔍 Vérification de la cohérence des données:');
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    
    // Vérifier les chansons avec des liens YouTube invalides
    const songsWithInvalidYouTube = await prisma.song.findMany({
      where: {
        churchId: church.id,
        youtubeUrl: { not: null }
      }
    });
    
    let invalidCount = 0;
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
    
    songsWithInvalidYouTube.forEach(song => {
      if (!youtubeRegex.test(song.youtubeUrl)) {
        console.log(`❌ Lien invalide: ${song.title} - ${song.youtubeUrl}`);
        invalidCount++;
      }
    });
    
    if (invalidCount === 0) {
      console.log('✅ Tous les liens YouTube sont valides');
    } else {
      console.log(`⚠️  ${invalidCount} liens YouTube invalides détectés`);
    }
    
    // Vérifier les chansons sans artiste
    const songsWithoutArtist = await prisma.song.count({
      where: {
        churchId: church.id,
        artist: null
      }
    });
    
    if (songsWithoutArtist > 0) {
      console.log(`⚠️  ${songsWithoutArtist} chansons sans artiste`);
    } else {
      console.log('✅ Toutes les chansons ont un artiste');
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur de vérification:', error);
  }
}

// Fonction principale
async function runTests() {
  console.log('🎵 Tests de la fonctionnalité YouTube\n');
  
  // Tests de conversion d'URLs
  testYouTubeUrlConversion();
  
  // Tests de validation
  testYouTubeUrlValidation();
  
  // Tests de base de données
  await displaySongStatistics();
  await testSongsAPI();
  await checkDataConsistency();
  
  console.log('✅ Tests terminés !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Lancez l\'application: npm run dev');
  console.log('2. Allez dans Musique > Répertoire');
  console.log('3. Vérifiez l\'affichage des vidéos YouTube');
  console.log('4. Testez les boutons "Afficher la vidéo"');
  console.log('5. Vérifiez la responsivité sur mobile');
  
  await prisma.$disconnect();
}

// Exécuter les tests
runTests().catch(console.error);
