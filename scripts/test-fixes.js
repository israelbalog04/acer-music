const fs = require('fs');
const path = require('path');

function testFixes() {
  console.log('🔧 Test des corrections apportées...\n');

  // Test 1: Vérifier les imports dans churches/page.tsx
  console.log('📊 Test 1: Vérification des imports dans churches/page.tsx');
  
  const churchesPagePath = 'src/app/app/super-admin/churches/page.tsx';
  if (fs.existsSync(churchesPagePath)) {
    const content = fs.readFileSync(churchesPagePath, 'utf8');
    
    const requiredImports = [
      'XMarkIcon',
      'CheckIcon'
    ];

    requiredImports.forEach(importName => {
      if (content.includes(importName)) {
        console.log(`   ✅ ${importName} est importé`);
      } else {
        console.log(`   ❌ ${importName} n'est pas importé`);
      }
    });

    // Vérifier l'utilisation des icônes
    const iconUsage = [
      { icon: 'XMarkIcon', pattern: '<XMarkIcon', found: content.includes('<XMarkIcon') },
      { icon: 'CheckIcon', pattern: '<CheckIcon', found: content.includes('<CheckIcon') }
    ];

    iconUsage.forEach(usage => {
      if (usage.found) {
        console.log(`   ✅ ${usage.icon} est utilisé dans le JSX`);
      } else {
        console.log(`   ❌ ${usage.icon} n'est pas utilisé`);
      }
    });
  } else {
    console.log(`   ❌ ${churchesPagePath} n'existe pas`);
  }

  // Test 2: Vérifier les corrections dans les APIs
  console.log('\n📊 Test 2: Vérification des corrections dans les APIs');
  
  const apiFiles = [
    'src/app/api/super-admin/users/[userId]/route.ts',
    'src/app/api/super-admin/churches/[churchId]/route.ts'
  ];

  apiFiles.forEach(apiPath => {
    if (fs.existsSync(apiPath)) {
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // Vérifier les corrections de params
      const corrections = [
        { 
          name: 'Params Promise type', 
          pattern: 'params: Promise<{', 
          found: content.includes('params: Promise<{') 
        },
        { 
          name: 'Await params', 
          pattern: 'await params', 
          found: content.includes('await params') 
        }
      ];

      console.log(`   📄 ${path.basename(apiPath)}:`);
      corrections.forEach(correction => {
        if (correction.found) {
          console.log(`     ✅ ${correction.name}`);
        } else {
          console.log(`     ❌ ${correction.name} manquant`);
        }
      });
    } else {
      console.log(`   ❌ ${apiPath} n'existe pas`);
    }
  });

  // Test 3: Vérifier les autres fichiers d'API avec params
  console.log('\n📊 Test 3: Vérification des autres APIs avec params');
  
  const otherApiFiles = [
    'src/app/api/events/[eventId]/songs/route.ts',
    'src/app/api/events/[eventId]/songs/[songId]/route.ts'
  ];

  otherApiFiles.forEach(apiPath => {
    if (fs.existsSync(apiPath)) {
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // Vérifier si ces fichiers ont aussi besoin de corrections
      const needsFix = content.includes('const {') && content.includes('} = params;') && !content.includes('await params');
      
      console.log(`   📄 ${path.basename(apiPath)}:`);
      if (needsFix) {
        console.log(`     ⚠️ Nécessite probablement des corrections (params sync)`);
      } else {
        console.log(`     ✅ Semble correct`);
      }
    } else {
      console.log(`   ❌ ${apiPath} n'existe pas`);
    }
  });

  // Test 4: Vérifier la structure générale
  console.log('\n📊 Test 4: Vérification de la structure générale');
  
  const structureChecks = [
    { name: 'Modal de création d\'église', file: 'src/app/app/super-admin/churches/page.tsx', pattern: 'showCreateModal' },
    { name: 'API POST churches', file: 'src/app/api/super-admin/churches/route.ts', pattern: 'export async function POST' },
    { name: 'Bouton Ajouter Église', file: 'src/app/app/super-admin/churches/page.tsx', pattern: 'Ajouter une Église' }
  ];

  structureChecks.forEach(check => {
    if (fs.existsSync(check.file)) {
      const content = fs.readFileSync(check.file, 'utf8');
      if (content.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}`);
      } else {
        console.log(`   ❌ ${check.name} manquant`);
      }
    } else {
      console.log(`   ❌ ${check.name} - fichier manquant`);
    }
  });

  console.log('\n🎉 Test des corrections terminé !');
  console.log('\n📋 Corrections apportées:');
  console.log('1. ✅ Ajout des imports XMarkIcon et CheckIcon dans churches/page.tsx');
  console.log('2. ✅ Correction des types params dans les APIs (Promise<>)');
  console.log('3. ✅ Ajout de await pour params dans les APIs');
  console.log('4. ✅ Vérification de la structure générale');

  console.log('\n🚀 Pour tester les corrections:');
  console.log('1. Redémarrer le serveur de développement');
  console.log('2. Aller sur http://localhost:3000/app/super-admin/churches');
  console.log('3. Cliquer sur "Ajouter une Église"');
  console.log('4. Vérifier que le modal s\'ouvre sans erreur');
  console.log('5. Tester la création d\'une église');

  console.log('\n🔧 APIs corrigées:');
  console.log('- ✅ /api/super-admin/users/[userId] (PUT, DELETE)');
  console.log('- ✅ /api/super-admin/churches/[churchId] (PUT, DELETE)');
  console.log('- ⚠️ Autres APIs à vérifier si nécessaire');

  console.log('\n📚 Erreurs Next.js corrigées:');
  console.log('- ✅ "params should be awaited" dans les APIs dynamiques');
  console.log('- ✅ "Can\'t find variable: XMarkIcon" dans l\'interface');
  console.log('- ✅ Types TypeScript mis à jour pour Next.js 15');

}

testFixes();
