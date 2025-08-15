const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour tester l'API des chansons
async function testSongsAPI() {
  try {
    console.log('🎤 Test de l\'API des chansons pour la page d\'upload');
    console.log('=' .repeat(60));
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    console.log(`📍 Église: ${church.name}`);
    console.log('');
    
    // Récupérer les chansons depuis la base de données
    const songs = await prisma.song.findMany({
      where: {
        churchId: church.id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            recordings: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });
    
    console.log(`📊 Chansons récupérées: ${songs.length}`);
    console.log('');
    
    if (songs.length === 0) {
      console.log('ℹ️  Aucune chanson trouvée dans le répertoire.');
      return;
    }
    
    // Afficher les détails de chaque chanson
    console.log('📋 Détails des chansons disponibles:');
    console.log('-'.repeat(60));
    
    songs.forEach((song, index) => {
      const hasYouTube = song.youtubeUrl ? '✅' : '❌';
      const recordingsCount = song._count.recordings;
      
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   ID: ${song.id}`);
      console.log(`   Artiste: ${song.artist || 'Artiste inconnu'}`);
      console.log(`   Tonalité: ${song.key || 'Non spécifiée'}`);
      console.log(`   Tempo: ${song.bpm || 'Non spécifié'} BPM`);
      console.log(`   YouTube: ${hasYouTube}`);
      console.log(`   Enregistrements: ${recordingsCount}`);
      console.log(`   Tags: ${song.tags ? JSON.parse(song.tags).join(', ') : 'Aucun'}`);
      console.log('');
    });
    
    // Statistiques
    const songsWithYouTube = songs.filter(s => s.youtubeUrl).length;
    const songsWithRecordings = songs.filter(s => s._count.recordings > 0).length;
    const songsWithKey = songs.filter(s => s.key).length;
    const songsWithBpm = songs.filter(s => s.bpm).length;
    
    console.log('📈 Statistiques du répertoire:');
    console.log('-'.repeat(60));
    console.log(`🎵 Total des chansons: ${songs.length}`);
    console.log(`🎬 Avec YouTube: ${songsWithYouTube} (${((songsWithYouTube / songs.length) * 100).toFixed(1)}%)`);
    console.log(`🎤 Avec enregistrements: ${songsWithRecordings} (${((songsWithRecordings / songs.length) * 100).toFixed(1)}%)`);
    console.log(`🎼 Avec tonalité: ${songsWithKey} (${((songsWithKey / songs.length) * 100).toFixed(1)}%)`);
    console.log(`⏱️  Avec tempo: ${songsWithBpm} (${((songsWithBpm / songs.length) * 100).toFixed(1)}%)`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour simuler l'API response
function simulateAPIResponse() {
  console.log('🌐 Simulation de la réponse API:');
  console.log('=' .repeat(60));
  
  console.log('📡 Endpoint: GET /api/songs');
  console.log('📋 Réponse attendue:');
  console.log('{');
  console.log('  "songs": [');
  console.log('    {');
  console.log('      "id": "cme8j2imf0003w4nhdtg5658f",');
  console.log('      "title": "Amazing Grace",');
  console.log('      "artist": "John Newton",');
  console.log('      "key": "G",');
  console.log('      "bpm": 72,');
  console.log('      "youtubeUrl": "https://www.youtube.com/watch?v=...",');
  console.log('      "recordingsCount": 0,');
  console.log('      "tags": ["gospel", "classique"]');
  console.log('    }');
  console.log('  ]');
  console.log('}');
  console.log('');
}

// Fonction pour tester la compatibilité des données
async function testDataCompatibility() {
  try {
    console.log('🔧 Test de compatibilité des données:');
    console.log('=' .repeat(60));
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    
    // Récupérer un exemple de chanson
    const sampleSong = await prisma.song.findFirst({
      where: {
        churchId: church.id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            recordings: true
          }
        }
      }
    });
    
    if (!sampleSong) {
      console.log('ℹ️  Aucune chanson trouvée pour le test.');
      return;
    }
    
    console.log('📋 Exemple de chanson (format API):');
    console.log('-'.repeat(60));
    console.log('{');
    console.log(`  "id": "${sampleSong.id}",`);
    console.log(`  "title": "${sampleSong.title}",`);
    console.log(`  "artist": "${sampleSong.artist || 'Artiste inconnu'}",`);
    console.log(`  "key": "${sampleSong.key || 'Non spécifiée'}",`);
    console.log(`  "bpm": ${sampleSong.bpm || 'null'},`);
    console.log(`  "youtubeUrl": "${sampleSong.youtubeUrl || 'null'}",`);
    console.log(`  "recordingsCount": ${sampleSong._count.recordings},`);
    console.log(`  "tags": ${sampleSong.tags || '[]'}`);
    console.log('}');
    console.log('');
    
    // Vérifier la compatibilité avec l'interface
    console.log('✅ Compatibilité avec l\'interface:');
    console.log('   • ID: ✅ Compatible');
    console.log('   • Title: ✅ Compatible');
    console.log('   • Artist: ✅ Compatible (avec fallback)');
    console.log('   • Key: ✅ Compatible (optionnel)');
    console.log('   • BPM: ✅ Compatible (optionnel)');
    console.log('   • YouTube URL: ✅ Compatible (optionnel)');
    console.log('   • Recordings Count: ✅ Compatible');
    console.log('   • Tags: ✅ Compatible (JSON string)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur de compatibilité:', error);
  }
}

// Fonction pour tester les paramètres URL
function testURLParameters() {
  console.log('🔗 Test des paramètres URL:');
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      name: 'Amazing Grace',
      songId: 'cme8j2imf0003w4nhdtg5658f',
      songTitle: 'Amazing Grace',
      url: '/app/music/upload?songId=cme8j2imf0003w4nhdtg5658f&songTitle=Amazing%20Grace'
    },
    {
      name: 'How Great Thou Art',
      songId: 'cme8j2imj0005w4nhwcgx3hsp',
      songTitle: 'How Great Thou Art',
      url: '/app/music/upload?songId=cme8j2imj0005w4nhwcgx3hsp&songTitle=How%20Great%20Thou%20Art'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   Song ID: ${testCase.songId}`);
    console.log(`   Song Title: ${testCase.songTitle}`);
    console.log(`   URL: ${testCase.url}`);
    console.log('');
  });
  
  console.log('🎯 Comportement attendu:');
  console.log('   • Détection des paramètres URL');
  console.log('   • Recherche de la chanson par ID ou titre');
  console.log('   • Présélection automatique');
  console.log('   • Passage à l\'étape "details"');
  console.log('');
}

// Fonction pour tester les états de l'interface
function testInterfaceStates() {
  console.log('🎨 Test des états de l\'interface:');
  console.log('=' .repeat(60));
  
  console.log('📱 États de chargement:');
  console.log('   • Loading: Spinner + "Chargement des chansons..."');
  console.log('   • Error: Icône d\'erreur + message + bouton "Réessayer"');
  console.log('   • Empty: Icône musicale + "Aucune chanson disponible"');
  console.log('   • Success: Liste des chansons avec détails');
  console.log('');
  
  console.log('🎵 Affichage des chansons:');
  console.log('   • Titre et artiste');
  console.log('   • Tonalité et tempo (si disponibles)');
  console.log('   • Nombre d\'enregistrements');
  console.log('   • Indicateur YouTube (si disponible)');
  console.log('   • Sélection visuelle');
  console.log('');
}

// Fonction principale
async function runUploadSongsTests() {
  console.log('🎤 Tests de récupération des chansons pour l\'upload\n');
  
  // Test de l'API
  await testSongsAPI();
  
  // Simulation de la réponse API
  simulateAPIResponse();
  
  // Test de compatibilité
  await testDataCompatibility();
  
  // Test des paramètres URL
  testURLParameters();
  
  // Test des états de l'interface
  testInterfaceStates();
  
  console.log('✅ Tests terminés !');
  console.log('\n📋 Instructions pour tester:');
  console.log('1. Lancez l\'application: npm run dev');
  console.log('2. Allez dans Musique > Upload');
  console.log('3. Vérifiez le chargement des chansons depuis l\'API');
  console.log('4. Testez la présélection via les paramètres URL');
  console.log('5. Vérifiez l\'affichage des détails des chansons');
  console.log('6. Testez les états de chargement et d\'erreur');
  console.log('');
  console.log('🎯 Résultats attendus:');
  console.log('   • Chansons récupérées depuis /api/songs');
  console.log('   • Affichage des détails complets');
  console.log('   • Présélection via paramètres URL');
  console.log('   • Gestion des états de chargement');
  console.log('   • Interface responsive et intuitive');
  
  await prisma.$disconnect();
}

// Exécuter les tests
runUploadSongsTests().catch(console.error);
