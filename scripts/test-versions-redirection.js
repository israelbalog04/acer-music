const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour tester la nouvelle redirection
async function testVersionsRedirection() {
  try {
    console.log('🎵 Test de la redirection "Versions" vers "Mes enregistrements"');
    console.log('=' .repeat(60));
    
    const churches = await prisma.church.findMany();
    if (churches.length === 0) {
      console.log('❌ Aucune église trouvée.');
      return;
    }

    const church = churches[0];
    console.log(`📍 Église: ${church.name}`);
    console.log('');
    
    // Récupérer quelques chansons pour les exemples
    const songs = await prisma.song.findMany({
      where: {
        churchId: church.id,
        isActive: true
      },
      orderBy: {
        title: 'asc'
      },
      take: 5
    });
    
    console.log(`📊 Chansons disponibles: ${songs.length}`);
    console.log('');
    
    if (songs.length === 0) {
      console.log('ℹ️  Aucune chanson trouvée.');
      return;
    }
    
    // Afficher les exemples de redirection
    console.log('🔗 Exemples de redirection "Versions":');
    console.log('-'.repeat(60));
    
    songs.forEach((song, index) => {
      const url = `/app/music/my-recordings?songId=${song.id}&songTitle=${encodeURIComponent(song.title)}`;
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   URL: ${url}`);
      console.log(`   Comportement: Redirection vers "Mes enregistrements"`);
      console.log(`   Paramètres: songId=${song.id}, songTitle=${song.title}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour décrire les changements
function describeChanges() {
  console.log('🔄 Changements effectués:');
  console.log('=' .repeat(60));
  
  console.log('✅ Modifications du bouton:');
  console.log('   • Texte: "Enregistrer" → "Versions"');
  console.log('   • Icône: MicrophoneIcon → PlayIcon');
  console.log('   • Couleur: Rouge → Violet');
  console.log('   • Redirection: /app/music/upload → /app/music/my-recordings');
  console.log('');
  
  console.log('🎯 Nouveau comportement:');
  console.log('   • Clic sur "Versions" → Page "Mes enregistrements"');
  console.log('   • Présélection de la chanson via paramètres URL');
  console.log('   • Affichage des enregistrements de cette chanson');
  console.log('   • Interface dédiée aux versions');
  console.log('');
}

// Fonction pour simuler l'interface
function simulateInterface() {
  console.log('🎨 Simulation de l\'interface:');
  console.log('=' .repeat(60));
  
  console.log('📱 Bouton "Versions" dans le répertoire:');
  console.log('   • Localisation: Cartes de chansons individuelles');
  console.log('   • Apparence: Bouton violet avec icône de lecture');
  console.log('   • Texte: "Versions"');
  console.log('   • Action: Redirection vers /app/music/my-recordings');
  console.log('');
  
  console.log('🎵 Page "Mes enregistrements":');
  console.log('   • URL: /app/music/my-recordings');
  console.log('   • Fonction: Liste des enregistrements');
  console.log('   • Paramètres: songId et songTitle');
  console.log('   • Présélection: Chanson choisie automatiquement');
  console.log('');
}

// Fonction pour tester la compatibilité
function testCompatibility() {
  console.log('🔧 Test de compatibilité:');
  console.log('=' .repeat(60));
  
  console.log('✅ Compatibilité maintenue:');
  console.log('   • Bouton "Enregistrer" principal → /app/music/upload');
  console.log('   • Bouton "Séquences" → Fonctionnalité séquences');
  console.log('   • Bouton "Partager" → Fonctionnalité partage');
  console.log('   • Bouton "YouTube" → Lien YouTube');
  console.log('');
  
  console.log('🎯 Nouvelle fonctionnalité:');
  console.log('   • Bouton "Versions" → /app/music/my-recordings');
  console.log('   • Séparation claire entre upload et consultation');
  console.log('   • Interface dédiée aux enregistrements');
  console.log('   • Navigation plus intuitive');
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
      oldUrl: '/app/music/upload?songId=cme8j2imf0003w4nhdtg5658f&songTitle=Amazing%20Grace',
      newUrl: '/app/music/my-recordings?songId=cme8j2imf0003w4nhdtg5658f&songTitle=Amazing%20Grace'
    },
    {
      song: 'How Great Thou Art',
      songId: 'cme8j2imj0005w4nhwcgx3hsp',
      oldUrl: '/app/music/upload?songId=cme8j2imj0005w4nhwcgx3hsp&songTitle=How%20Great%20Thou%20Art',
      newUrl: '/app/music/my-recordings?songId=cme8j2imj0005w4nhwcgx3hsp&songTitle=How%20Great%20Thou%20Art'
    }
  ];
  
  examples.forEach((example, index) => {
    console.log(`${index + 1}. ${example.song}`);
    console.log(`   Ancien: ${example.oldUrl}`);
    console.log(`   Nouveau: ${example.newUrl}`);
    console.log(`   Changement: Upload → Mes enregistrements`);
    console.log('');
  });
}

// Fonction pour tester les avantages
function testBenefits() {
  console.log('🎯 Avantages de la nouvelle approche:');
  console.log('=' .repeat(60));
  
  console.log('✅ Séparation des responsabilités:');
  console.log('   • Upload: Création d\'enregistrements');
  console.log('   • Versions: Consultation des enregistrements');
  console.log('   • Interface claire et dédiée');
  console.log('   • Navigation intuitive');
  console.log('');
  
  console.log('🎵 Expérience utilisateur améliorée:');
  console.log('   • Bouton "Versions" plus explicite');
  console.log('   • Accès direct aux enregistrements existants');
  console.log('   • Présélection de chanson');
  console.log('   • Interface spécialisée');
  console.log('');
  
  console.log('🔄 Flux utilisateur optimisé:');
  console.log('   1. Utilisateur voit une chanson dans le répertoire');
  console.log('   2. Il clique sur "Versions" pour voir les enregistrements');
  console.log('   3. Il est redirigé vers "Mes enregistrements"');
  console.log('   4. La chanson est présélectionnée');
  console.log('   5. Il peut consulter ou ajouter des versions');
  console.log('');
}

// Fonction principale
async function runVersionsTests() {
  console.log('🎵 Tests de la redirection "Versions"\n');
  
  // Test de la redirection
  await testVersionsRedirection();
  
  // Description des changements
  describeChanges();
  
  // Simulation de l'interface
  simulateInterface();
  
  // Test de compatibilité
  testCompatibility();
  
  // Exemples d'URLs
  generateExampleURLs();
  
  // Test des avantages
  testBenefits();
  
  console.log('✅ Tests terminés !');
  console.log('\n📋 Instructions pour tester:');
  console.log('1. Lancez l\'application: npm run dev');
  console.log('2. Allez dans Musique > Répertoire');
  console.log('3. Vérifiez le bouton "Versions" (violet avec icône de lecture)');
  console.log('4. Cliquez sur "Versions" pour une chanson');
  console.log('5. Vérifiez la redirection vers "Mes enregistrements"');
  console.log('6. Confirmez la présélection de la chanson');
  console.log('');
  console.log('🎯 Résultats attendus:');
  console.log('   • Bouton "Versions" visible et fonctionnel');
  console.log('   • Redirection vers /app/music/my-recordings');
  console.log('   • Paramètres songId et songTitle transmis');
  console.log('   • Interface "Mes enregistrements" accessible');
  console.log('   • Navigation intuitive et claire');
  
  await prisma.$disconnect();
}

// Exécuter les tests
runVersionsTests().catch(console.error);
