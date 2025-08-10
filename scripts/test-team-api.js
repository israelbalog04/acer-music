const fetch = require('node-fetch');

async function testTeamEventsAPI() {
  console.log('🧪 Test de l\'API équipes par événement');
  
  try {
    // Simuler l'appel API (devrait être fait depuis le navigateur avec session)
    console.log('⚠️  Cette API nécessite une authentification');
    console.log('📋 Endpoints disponibles:');
    console.log('   GET /api/teams/by-events');
    console.log('   Paramètres:');
    console.log('     - limit: nombre d\'événements (défaut: 50)');
    console.log('     - includeCompleted: inclure événements terminés (défaut: false)');
    console.log('     - type: filtrer par type (SERVICE, REPETITION, CONCERT, FORMATION)');
    
    console.log('\n✅ API prête à être testée depuis le navigateur');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testTeamEventsAPI();