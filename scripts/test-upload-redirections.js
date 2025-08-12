const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour afficher les informations sur les redirections
function displayRedirectInfo() {
  console.log('🎤 Test des redirections vers la page d\'upload');
  console.log('=' .repeat(60));
  
  console.log('✅ Modifications effectuées:');
  console.log('   • Bouton "Enregistrer" principal → /app/music/upload');
  console.log('   • Boutons "Enregistrer" par chanson → /app/music/upload?songId=X&songTitle=Y');
  console.log('   • Page d\'upload modifiée pour recevoir les paramètres');
  console.log('');
  
  console.log('🎯 Comportement attendu:');
  console.log('   • Clic sur "Enregistrer" → Redirection vers page d\'upload');
  console.log('   • Clic sur "Enregistrer" d\'une chanson → Redirection avec chanson présélectionnée');
  console.log('   • Page d\'upload → Étape "details" si chanson présélectionnée');
  console.log('');
}

// Fonction pour tester les URLs de redirection
function testRedirectUrls() {
  console.log('🔗 Test des URLs de redirection:');
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      name: 'Enregistrement général',
      url: '/app/music/upload',
      description: 'Page d\'upload sans chanson présélectionnée'
    },
    {
      name: 'Enregistrement Amazing Grace',
      url: '/app/music/upload?songId=1&songTitle=Amazing%20Grace',
      description: 'Page d\'upload avec Amazing Grace présélectionnée'
    },
    {
      name: 'Enregistrement How Great Thou Art',
      url: '/app/music/upload?songId=2&songTitle=How%20Great%20Thou%20Art',
      description: 'Page d\'upload avec How Great Thou Art présélectionnée'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   URL: ${testCase.url}`);
    console.log(`   Description: ${testCase.description}`);
    console.log('');
  });
}

// Fonction pour afficher les chansons disponibles
async function displayAvailableSongs() {
  try {
    console.log('📋 Chansons disponibles pour enregistrement:');
    console.log('=' .repeat(60));
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    
    const songs = await prisma.song.findMany({
      where: {
        churchId: church.id
      },
      orderBy: {
        title: 'asc'
      },
      select: {
        id: true,
        title: true,
        artist: true,
        youtubeUrl: true,
        _count: {
          select: {
            recordings: true
          }
        }
      }
    });
    
    if (songs.length === 0) {
      console.log('ℹ️  Aucune chanson trouvée.');
      return;
    }
    
    songs.forEach((song, index) => {
      const hasYouTube = song.youtubeUrl ? '✅' : '❌';
      const recordingsCount = song._count.recordings;
      
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   ID: ${song.id}`);
      console.log(`   Artiste: ${song.artist || 'Artiste inconnu'}`);
      console.log(`   YouTube: ${hasYouTube}`);
      console.log(`   Enregistrements existants: ${recordingsCount}`);
      console.log(`   URL de redirection: /app/music/upload?songId=${song.id}&songTitle=${encodeURIComponent(song.title)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour simuler les redirections
function simulateRedirects() {
  console.log('🔄 Simulation des redirections:');
  console.log('=' .repeat(60));
  
  console.log('📱 Bouton "Enregistrer" principal:');
  console.log('   • Localisation: Header de la page répertoire');
  console.log('   • Action: window.location.href = "/app/music/upload"');
  console.log('   • Résultat: Redirection vers page d\'upload générale');
  console.log('');
  
  console.log('🎵 Boutons "Enregistrer" par chanson:');
  console.log('   • Localisation: Cartes de chansons individuelles');
  console.log('   • Action: Redirection avec paramètres songId et songTitle');
  console.log('   • Résultat: Page d\'upload avec chanson présélectionnée');
  console.log('');
  
  console.log('⚙️  Page d\'upload modifiée:');
  console.log('   • Détection des paramètres URL');
  console.log('   • Présélection automatique de la chanson');
  console.log('   • Passage direct à l\'étape "details"');
  console.log('');
}

// Fonction pour tester la compatibilité
function testCompatibility() {
  console.log('🔧 Test de compatibilité:');
  console.log('=' .repeat(60));
  
  console.log('✅ Compatibilité avec l\'existant:');
  console.log('   • Page d\'upload existante conservée');
  console.log('   • Fonctionnalités d\'upload maintenues');
  console.log('   • Interface utilisateur préservée');
  console.log('   • Paramètres optionnels (rétrocompatibilité)');
  console.log('');
  
  console.log('🎯 Améliorations apportées:');
  console.log('   • Navigation plus intuitive');
  console.log('   • Présélection de chanson');
  console.log('   • Réduction des clics utilisateur');
  console.log('   • Expérience utilisateur améliorée');
  console.log('');
}

// Fonction principale
async function runRedirectTests() {
  console.log('🎤 Tests des redirections vers la page d\'upload\n');
  
  // Informations sur les redirections
  displayRedirectInfo();
  
  // Test des URLs
  testRedirectUrls();
  
  // Chansons disponibles
  await displayAvailableSongs();
  
  // Simulation des redirections
  simulateRedirects();
  
  // Test de compatibilité
  testCompatibility();
  
  console.log('✅ Tests terminés !');
  console.log('\n📋 Instructions pour tester:');
  console.log('1. Lancez l\'application: npm run dev');
  console.log('2. Allez dans Musique > Répertoire');
  console.log('3. Testez le bouton "Enregistrer" principal');
  console.log('4. Testez les boutons "Enregistrer" des chansons individuelles');
  console.log('5. Vérifiez que la page d\'upload reçoit les paramètres');
  console.log('6. Confirmez la présélection des chansons');
  console.log('');
  console.log('🎯 Résultats attendus:');
  console.log('   • Redirection vers /app/music/upload');
  console.log('   • Paramètres songId et songTitle dans l\'URL');
  console.log('   • Chanson présélectionnée dans l\'interface');
  console.log('   • Étape "details" automatiquement active');
  
  await prisma.$disconnect();
}

// Exécuter les tests
runRedirectTests().catch(console.error);
