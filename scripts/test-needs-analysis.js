const { analyzeTeamNeeds } = require('../src/lib/event-requirements.js');

function testNeedsAnalysis() {
  console.log('🧪 Test de l\'analyse des besoins d\'équipe');

  // Test 1: Équipe vide pour un SERVICE
  console.log('\n--- Test 1: SERVICE sans équipe ---');
  const emptyTeam = [];
  const serviceAnalysis = analyzeTeamNeeds('SERVICE', emptyTeam);
  console.log('Critiques:', serviceAnalysis.critical);
  console.log('Importants:', serviceAnalysis.high);
  console.log('Sous-effectif:', serviceAnalysis.isUnderStaffed, `(${serviceAnalysis.totalMembers}/${serviceAnalysis.minRequired})`);

  // Test 2: Équipe avec seulement piano pour SERVICE
  console.log('\n--- Test 2: SERVICE avec piano seulement ---');
  const pianoOnlyTeam = [
    { role: 'Piano Principal', user: { primaryInstrument: 'Piano' } }
  ];
  const pianoAnalysis = analyzeTeamNeeds('SERVICE', pianoOnlyTeam);
  console.log('Critiques:', pianoAnalysis.critical);
  console.log('Importants:', pianoAnalysis.high);
  console.log('Satisfaits:', pianoAnalysis.satisfied);

  // Test 3: Équipe complète pour SERVICE
  console.log('\n--- Test 3: SERVICE équipe complète ---');
  const completeTeam = [
    { role: 'Piano Principal', user: { primaryInstrument: 'Piano' } },
    { role: 'Guitare Lead', user: { primaryInstrument: 'Guitare' } },
    { role: 'Chant Lead', user: { primaryInstrument: 'Chant' } },
    { role: 'Basse', user: { primaryInstrument: 'Basse' } },
    { role: 'Batterie', user: { primaryInstrument: 'Batterie' } }
  ];
  const completeAnalysis = analyzeTeamNeeds('SERVICE', completeTeam);
  console.log('Critiques:', completeAnalysis.critical);
  console.log('Importants:', completeAnalysis.high);
  console.log('Moyens:', completeAnalysis.medium);
  console.log('Satisfaits:', completeAnalysis.satisfied);
  console.log('Sous-effectif:', completeAnalysis.isUnderStaffed);

  // Test 4: REPETITION avec besoins différents
  console.log('\n--- Test 4: REPETITION partiellement complète ---');
  const repetitionTeam = [
    { role: 'Pianiste', user: { primaryInstrument: 'Piano' } },
    { role: 'Guitariste', user: { primaryInstrument: 'Guitare' } }
  ];
  const repetitionAnalysis = analyzeTeamNeeds('REPETITION', repetitionTeam);
  console.log('Critiques:', repetitionAnalysis.critical);
  console.log('Importants:', repetitionAnalysis.high);
  console.log('Moyens:', repetitionAnalysis.medium);
  console.log('Satisfaits:', repetitionAnalysis.satisfied);

  console.log('\n✅ Test de l\'analyse terminé');
  console.log('💡 Les résultats montrent comment le système adapte les besoins selon le type d\'événement');
}

testNeedsAnalysis();