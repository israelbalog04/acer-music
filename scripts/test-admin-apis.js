const fetch = require('node-fetch');

async function testAdminAPIs() {
  console.log('🔍 Test des APIs admin...\n');

  const baseURL = 'http://localhost:3000';
  
  // Simuler une session admin (on va juste tester si les routes existent)
  const testAPIs = [
    '/api/admin/users',
    '/api/admin/events', 
    '/api/admin/availability'
  ];

  for (const api of testAPIs) {
    try {
      console.log(`Test de ${api}...`);
      const response = await fetch(`${baseURL}${api}`);
      
      if (response.status === 401) {
        console.log(`   ✅ Route existe mais nécessite authentification (401)`);
      } else if (response.status === 200) {
        console.log(`   ✅ Route fonctionne (200)`);
      } else if (response.status === 403) {
        console.log(`   ✅ Route existe mais accès refusé (403)`);
      } else {
        console.log(`   ❌ Erreur ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ⚠️  Serveur non démarré - impossible de tester`);
      } else {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
  }

  console.log('\n✅ Test des APIs terminé');
}

testAdminAPIs();
