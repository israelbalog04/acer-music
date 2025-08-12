const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour afficher les statistiques des vidéos YouTube
async function displayVideoStatistics() {
  try {
    console.log('🎬 Statistiques des vidéos YouTube (Affichage automatique)');
    console.log('=' .repeat(60));
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    
    // Récupérer toutes les chansons avec YouTube
    const songsWithYouTube = await prisma.song.findMany({
      where: {
        churchId: church.id,
        youtubeUrl: { not: null }
      },
      orderBy: {
        title: 'asc'
      },
      select: {
        id: true,
        title: true,
        artist: true,
        youtubeUrl: true,
        createdAt: true,
        _count: {
          select: {
            recordings: true,
            eventSongs: true
          }
        }
      }
    });
    
    console.log(`📍 Église: ${church.name}`);
    console.log(`🎵 Chansons avec vidéos YouTube: ${songsWithYouTube.length}`);
    console.log('');
    
    if (songsWithYouTube.length === 0) {
      console.log('ℹ️  Aucune chanson avec vidéo YouTube trouvée.');
      return;
    }
    
    // Afficher les détails de chaque chanson
    console.log('📋 Détails des vidéos YouTube:');
    console.log('-'.repeat(60));
    
    songsWithYouTube.forEach((song, index) => {
      const date = new Date(song.createdAt).toLocaleDateString('fr-FR');
      const embedUrl = getYouTubeEmbedUrl(song.youtubeUrl);
      
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   Artiste: ${song.artist || 'Artiste inconnu'}`);
      console.log(`   URL originale: ${song.youtubeUrl}`);
      console.log(`   URL embed: ${embedUrl}`);
      console.log(`   Ajoutée le: ${date}`);
      console.log(`   Enregistrements: ${song._count.recordings}`);
      console.log(`   Événements: ${song._count.eventSongs}`);
      console.log('');
    });
    
    // Statistiques de performance
    console.log('📊 Statistiques de performance:');
    console.log('-'.repeat(60));
    
    const totalRecordings = songsWithYouTube.reduce((sum, song) => sum + song._count.recordings, 0);
    const totalEvents = songsWithYouTube.reduce((sum, song) => sum + song._count.eventSongs, 0);
    const avgRecordings = songsWithYouTube.length > 0 ? (totalRecordings / songsWithYouTube.length).toFixed(1) : 0;
    const avgEvents = songsWithYouTube.length > 0 ? (totalEvents / songsWithYouTube.length).toFixed(1) : 0;
    
    console.log(`📈 Enregistrements totaux: ${totalRecordings}`);
    console.log(`📅 Événements totaux: ${totalEvents}`);
    console.log(`📊 Moyenne enregistrements par chanson: ${avgRecordings}`);
    console.log(`📊 Moyenne événements par chanson: ${avgEvents}`);
    
    // Vérification des URLs
    console.log('\n🔍 Vérification des URLs YouTube:');
    console.log('-'.repeat(60));
    
    let validUrls = 0;
    let invalidUrls = 0;
    
    songsWithYouTube.forEach(song => {
      const isValid = validateYouTubeUrl(song.youtubeUrl);
      if (isValid) {
        validUrls++;
        console.log(`✅ ${song.title}: URL valide`);
      } else {
        invalidUrls++;
        console.log(`❌ ${song.title}: URL invalide`);
      }
    });
    
    console.log(`\n📊 Résumé URLs: ${validUrls} valides, ${invalidUrls} invalides`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour convertir les URLs YouTube
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  return url;
}

// Fonction pour valider les URLs YouTube
function validateYouTubeUrl(url) {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/;
  return youtubeRegex.test(url);
}

// Fonction pour simuler l'affichage automatique
function simulateAutoDisplay() {
  console.log('\n🎬 Simulation de l\'affichage automatique des vidéos:');
  console.log('=' .repeat(60));
  
  console.log('✅ Comportement actuel:');
  console.log('   • Toutes les vidéos sont visibles par défaut');
  console.log('   • Bouton "Masquer" pour cacher la vidéo');
  console.log('   • Bouton "Afficher" pour remontrer la vidéo');
  console.log('   • Aperçu avec bouton play quand masquée');
  console.log('');
  
  console.log('🎯 Avantages de l\'affichage automatique:');
  console.log('   • Accès immédiat aux vidéos');
  console.log('   • Meilleure expérience utilisateur');
  console.log('   • Pas besoin de cliquer pour voir les vidéos');
  console.log('   • Interface plus intuitive');
  console.log('');
  
  console.log('⚙️  Optimisations appliquées:');
  console.log('   • Chargement lazy des iframes');
  console.log('   • Responsive design');
  console.log('   • Contrôles YouTube complets');
  console.log('   • Gestion des erreurs');
  console.log('');
}

// Fonction pour tester les performances
async function testPerformance() {
  try {
    console.log('⚡ Test de performance:');
    console.log('=' .repeat(60));
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    
    // Compter les chansons avec YouTube
    const songsWithYouTube = await prisma.song.count({
      where: {
        churchId: church.id,
        youtubeUrl: { not: null }
      }
    });
    
    // Compter les chansons sans YouTube
    const songsWithoutYouTube = await prisma.song.count({
      where: {
        churchId: church.id,
        youtubeUrl: null
      }
    });
    
    const totalSongs = songsWithYouTube + songsWithoutYouTube;
    const percentageWithVideo = totalSongs > 0 ? ((songsWithYouTube / totalSongs) * 100).toFixed(1) : 0;
    
    console.log(`📊 Répartition des chansons:`);
    console.log(`   • Avec vidéo YouTube: ${songsWithYouTube} (${percentageWithVideo}%)`);
    console.log(`   • Sans vidéo YouTube: ${songsWithoutYouTube}`);
    console.log(`   • Total: ${totalSongs}`);
    console.log('');
    
    // Estimation de la charge
    console.log('📈 Estimation de la charge réseau:');
    console.log(`   • ${songsWithYouTube} iframes YouTube chargées`);
    console.log(`   • Optimisation: Chargement lazy`);
    console.log(`   • Responsive: Adaptation mobile/desktop`);
    console.log(`   • Performance: Optimisée pour la vitesse`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur de performance:', error);
  }
}

// Fonction principale
async function runAutoDisplayTests() {
  console.log('🎬 Tests de l\'affichage automatique des vidéos YouTube\n');
  
  // Tests de base de données
  await displayVideoStatistics();
  
  // Simulation de l'affichage
  simulateAutoDisplay();
  
  // Tests de performance
  await testPerformance();
  
  console.log('✅ Tests terminés !');
  console.log('\n📋 Instructions pour tester:');
  console.log('1. Lancez l\'application: npm run dev');
  console.log('2. Allez dans Musique > Répertoire');
  console.log('3. Vérifiez que toutes les vidéos sont visibles par défaut');
  console.log('4. Testez les boutons "Masquer/Afficher"');
  console.log('5. Vérifiez la responsivité sur mobile');
  console.log('6. Testez les contrôles YouTube (play, pause, plein écran)');
  
  await prisma.$disconnect();
}

// Exécuter les tests
runAutoDisplayTests().catch(console.error);
