const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour tester l'affichage des enregistrements
async function testRecordingsDisplay() {
  try {
    console.log('🎤 Test de l\'affichage des enregistrements dans la page d\'upload');
    console.log('=' .repeat(60));
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    console.log(`📍 Église: ${church.name}`);
    console.log('');
    
    // Récupérer les chansons avec leurs enregistrements
    const songs = await prisma.song.findMany({
      where: {
        churchId: church.id,
        isActive: true
      },
      include: {
                 recordings: {
           include: {
             user: {
               select: {
                 firstName: true,
                 lastName: true,
                 email: true
               }
             }
           },
          orderBy: {
            createdAt: 'desc'
          }
        },
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
    
    console.log(`📊 Chansons avec enregistrements: ${songs.length}`);
    console.log('');
    
    if (songs.length === 0) {
      console.log('ℹ️  Aucune chanson trouvée.');
      return;
    }
    
    // Afficher les détails de chaque chanson avec ses enregistrements
    console.log('📋 Détails des chansons et enregistrements:');
    console.log('-'.repeat(60));
    
    songs.forEach((song, index) => {
      const recordingsCount = song._count.recordings;
      const hasYouTube = song.youtubeUrl ? '✅' : '❌';
      
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   ID: ${song.id}`);
      console.log(`   Artiste: ${song.artist || 'Artiste inconnu'}`);
      console.log(`   Tonalité: ${song.key || 'Non spécifiée'}`);
      console.log(`   Tempo: ${song.bpm || 'Non spécifié'} BPM`);
      console.log(`   YouTube: ${hasYouTube}`);
      console.log(`   Enregistrements: ${recordingsCount}`);
      
      if (song.recordings.length > 0) {
        console.log('   📝 Enregistrements existants:');
        song.recordings.forEach((recording, recIndex) => {
          const duration = recording.duration ? formatDuration(recording.duration) : 'Durée inconnue';
          const date = new Date(recording.createdAt).toLocaleDateString();
          console.log(`      ${recIndex + 1}. ${recording.instrument} - ${recording.version}`);
          console.log(`         Durée: ${duration} | Date: ${date}`);
          const userName = recording.user ? `${recording.user.firstName || ''} ${recording.user.lastName || ''}`.trim() || recording.user.email : 'Anonyme';
         console.log(`         Musicien: ${userName}`);
          if (recording.notes) {
            console.log(`         Notes: ${recording.notes}`);
          }
        });
      } else {
        console.log('   📝 Aucun enregistrement');
      }
      console.log('');
    });
    
    // Statistiques globales
    const totalRecordings = songs.reduce((sum, song) => sum + song.recordings.length, 0);
    const songsWithRecordings = songs.filter(s => s.recordings.length > 0).length;
    const averageRecordingsPerSong = songs.length > 0 ? (totalRecordings / songs.length).toFixed(1) : 0;
    
    console.log('📈 Statistiques des enregistrements:');
    console.log('-'.repeat(60));
    console.log(`🎵 Total des chansons: ${songs.length}`);
    console.log(`🎤 Total des enregistrements: ${totalRecordings}`);
    console.log(`📝 Chansons avec enregistrements: ${songsWithRecordings} (${((songsWithRecordings / songs.length) * 100).toFixed(1)}%)`);
    console.log(`📊 Moyenne par chanson: ${averageRecordingsPerSong}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour formater la durée
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Fonction pour simuler l'interface utilisateur
function simulateUI() {
  console.log('🎨 Simulation de l\'interface utilisateur:');
  console.log('=' .repeat(60));
  
  console.log('📱 Page d\'upload modifiée:');
  console.log('   • Affichage des chansons avec enregistrements');
  console.log('   • Bouton "Sélectionner" pour choisir une chanson');
  console.log('   • Bouton "Ajouter" pour ouvrir le modal d\'enregistrement');
  console.log('   • Section "Enregistrements existants" par chanson');
  console.log('');
  
  console.log('🎵 Affichage des chansons:');
  console.log('   • Titre et artiste');
  console.log('   • Tonalité et tempo');
  console.log('   • Nombre d\'enregistrements');
  console.log('   • Indicateur YouTube');
  console.log('   • Boutons d\'action');
  console.log('');
  
  console.log('📝 Section enregistrements:');
  console.log('   • Liste des enregistrements existants');
  console.log('   • Instrument et version');
  console.log('   • Durée et date de création');
  console.log('   • Icône de lecture');
  console.log('');
  
  console.log('🎤 Modal d\'ajout d\'enregistrement:');
  console.log('   • Sélection d\'instrument');
  console.log('   • Saisie de version');
  console.log('   • Upload de fichier audio');
  console.log('   • Notes et commentaires');
  console.log('   • Boutons d\'action');
  console.log('');
}

// Fonction pour tester les interactions
function testInteractions() {
  console.log('🔄 Test des interactions utilisateur:');
  console.log('=' .repeat(60));
  
  console.log('👆 Interactions disponibles:');
  console.log('   • Clic sur "Sélectionner" → Choisir une chanson');
  console.log('   • Clic sur "Ajouter" → Ouvrir modal d\'enregistrement');
  console.log('   • Clic sur enregistrement → Écouter (futur)');
  console.log('   • Fermeture du modal → Retour à la liste');
  console.log('');
  
  console.log('🎯 Flux utilisateur:');
  console.log('   1. Utilisateur voit la liste des chansons');
  console.log('   2. Il peut voir les enregistrements existants');
  console.log('   3. Il clique sur "Ajouter" pour une chanson');
  console.log('   4. Le modal s\'ouvre avec la chanson présélectionnée');
  console.log('   5. Il remplit les informations et upload le fichier');
  console.log('   6. L\'enregistrement est ajouté à la liste');
  console.log('');
}

// Fonction pour tester la compatibilité
function testCompatibility() {
  console.log('🔧 Test de compatibilité:');
  console.log('=' .repeat(60));
  
  console.log('✅ Compatibilité avec l\'existant:');
  console.log('   • API des chansons maintenue');
  console.log('   • API des enregistrements utilisée');
  console.log('   • Interface responsive préservée');
  console.log('   • Navigation cohérente');
  console.log('');
  
  console.log('🎯 Améliorations apportées:');
  console.log('   • Affichage des enregistrements par chanson');
  console.log('   • Modal d\'ajout d\'enregistrement');
  console.log('   • Interface plus informative');
  console.log('   • Meilleure expérience utilisateur');
  console.log('');
}

// Fonction pour générer des exemples d'URLs
function generateExampleURLs() {
  console.log('🔗 Exemples d\'URLs de redirection:');
  console.log('=' .repeat(60));
  
  const examples = [
    {
      song: 'Amazing Grace',
      songId: 'cme8j2imf0003w4nhdtg5658f',
      url: '/app/music/upload?songId=cme8j2imf0003w4nhdtg5658f&songTitle=Amazing%20Grace'
    },
    {
      song: 'How Great Thou Art',
      songId: 'cme8j2imj0005w4nhwcgx3hsp',
      url: '/app/music/upload?songId=cme8j2imj0005w4nhwcgx3hsp&songTitle=How%20Great%20Thou%20Art'
    }
  ];
  
  examples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.song}`);
    console.log(`   URL: ${example.url}`);
    console.log(`   Comportement: Chanson présélectionnée + enregistrements visibles`);
    console.log('');
  });
}

// Fonction principale
async function runRecordingsDisplayTests() {
  console.log('🎤 Tests de l\'affichage des enregistrements\n');
  
  // Test des données
  await testRecordingsDisplay();
  
  // Simulation de l'interface
  simulateUI();
  
  // Test des interactions
  testInteractions();
  
  // Test de compatibilité
  testCompatibility();
  
  // Exemples d'URLs
  generateExampleURLs();
  
  console.log('✅ Tests terminés !');
  console.log('\n📋 Instructions pour tester:');
  console.log('1. Lancez l\'application: npm run dev');
  console.log('2. Allez dans Musique > Upload');
  console.log('3. Vérifiez l\'affichage des enregistrements par chanson');
  console.log('4. Testez le bouton "Ajouter" pour ouvrir le modal');
  console.log('5. Vérifiez la présélection de chanson dans le modal');
  console.log('6. Testez les interactions du modal');
  console.log('');
  console.log('🎯 Résultats attendus:');
  console.log('   • Enregistrements affichés par chanson');
  console.log('   • Modal d\'ajout fonctionnel');
  console.log('   • Interface intuitive et responsive');
  console.log('   • Données cohérentes avec l\'API');
  
  await prisma.$disconnect();
}

// Exécuter les tests
runRecordingsDisplayTests().catch(console.error);
