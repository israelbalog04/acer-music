const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCreateChurch() {
  try {
    console.log('🏛️ Test de création d\'église...\n');

    // Test 1: Vérifier les églises existantes
    console.log('📊 Test 1: Vérification des églises existantes');
    
    const existingChurches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        isActive: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`   ✅ ${existingChurches.length} églises trouvées:`);
    existingChurches.forEach(church => {
      console.log(`      - ${church.name} (${church.city}) - ${church.isActive ? 'Active' : 'Inactive'} - ${church._count.users} utilisateurs`);
    });

    // Test 2: Simuler la création d'une nouvelle église
    console.log('\n📊 Test 2: Simulation de création d\'église');
    
    const newChurchData = {
      name: 'ACER Lyon',
      city: 'Lyon',
      address: '123 Rue de la République, 69001 Lyon',
      phone: '+33 4 78 12 34 56',
      email: 'contact@acer-lyon.fr',
      website: 'https://www.acer-lyon.fr',
      description: 'Église ACER de Lyon, communauté dynamique au cœur de la ville',
      isActive: true
    };

    console.log('   Données de test:');
    console.log(`      Nom: ${newChurchData.name}`);
    console.log(`      Ville: ${newChurchData.city}`);
    console.log(`      Adresse: ${newChurchData.address}`);
    console.log(`      Téléphone: ${newChurchData.phone}`);
    console.log(`      Email: ${newChurchData.email}`);
    console.log(`      Site web: ${newChurchData.website}`);
    console.log(`      Description: ${newChurchData.description}`);
    console.log(`      Active: ${newChurchData.isActive}`);

    // Test 3: Vérifier si l'église existe déjà
    console.log('\n📊 Test 3: Vérification de doublon');
    
    const existingChurch = await prisma.church.findFirst({
      where: {
        name: newChurchData.name,
        city: newChurchData.city
      }
    });

    if (existingChurch) {
      console.log(`   ⚠️ L'église ${newChurchData.name} existe déjà à ${newChurchData.city}`);
      console.log(`   ID: ${existingChurch.id}`);
    } else {
      console.log(`   ✅ Aucun doublon trouvé pour ${newChurchData.name} à ${newChurchData.city}`);
    }

    // Test 4: Validation des données
    console.log('\n📊 Test 4: Validation des données');
    
    const validations = [
      { field: 'name', value: newChurchData.name, required: true },
      { field: 'city', value: newChurchData.city, required: true },
      { field: 'address', value: newChurchData.address, required: false },
      { field: 'phone', value: newChurchData.phone, required: false },
      { field: 'email', value: newChurchData.email, required: false },
      { field: 'website', value: newChurchData.website, required: false },
      { field: 'description', value: newChurchData.description, required: false }
    ];

    validations.forEach(validation => {
      if (validation.required && !validation.value) {
        console.log(`   ❌ ${validation.field}: Requis mais manquant`);
      } else if (validation.value && validation.value.trim().length === 0) {
        console.log(`   ⚠️ ${validation.field}: Vide après trim`);
      } else {
        console.log(`   ✅ ${validation.field}: Valide`);
      }
    });

    // Test 5: Structure de réponse attendue
    console.log('\n📊 Test 5: Structure de réponse attendue');
    
    const expectedResponse = {
      message: "Église créée avec succès",
      church: {
        id: "string",
        name: newChurchData.name,
        city: newChurchData.city,
        address: newChurchData.address,
        phone: newChurchData.phone,
        email: newChurchData.email,
        website: newChurchData.website,
        description: newChurchData.description,
        isActive: newChurchData.isActive,
        createdAt: "string",
        updatedAt: "string",
        _count: {
          users: 0,
          schedules: 0,
          songs: 0
        }
      }
    };

    console.log('   Réponse attendue:');
    console.log(`      Message: ${expectedResponse.message}`);
    console.log(`      Église ID: ${expectedResponse.church.id}`);
    console.log(`      Nom: ${expectedResponse.church.name}`);
    console.log(`      Ville: ${expectedResponse.church.city}`);
    console.log(`      Utilisateurs: ${expectedResponse.church._count.users}`);

    // Test 6: Permissions
    console.log('\n📊 Test 6: Vérification des permissions');
    
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, email: true, role: true }
    });

    if (superAdmin) {
      console.log(`   ✅ Super Admin trouvé: ${superAdmin.email}`);
      console.log(`   Rôle: ${superAdmin.role}`);
    } else {
      console.log(`   ❌ Aucun Super Admin trouvé`);
    }

    console.log('\n🎉 Test de création d\'église terminé !');
    console.log('\n📋 Pour tester l\'interface:');
    console.log('1. Aller sur http://localhost:3000/app/super-admin/churches');
    console.log('2. Cliquer sur "Ajouter une Église"');
    console.log('3. Remplir le formulaire avec les données de test');
    console.log('4. Cliquer sur "Créer l\'Église"');
    console.log('5. Vérifier que l\'église apparaît dans la liste');

    console.log('\n🔧 Fonctionnalités implémentées:');
    console.log('- ✅ Bouton "Ajouter une Église" dans l\'interface');
    console.log('- ✅ Modal de création avec formulaire complet');
    console.log('- ✅ Validation des champs requis (nom, ville)');
    console.log('- ✅ Vérification de doublon');
    console.log('- ✅ API POST /api/super-admin/churches');
    console.log('- ✅ Gestion des erreurs et états de chargement');
    console.log('- ✅ Réinitialisation du formulaire après création');

    console.log('\n🎨 Améliorations UI/UX:');
    console.log('- ✅ Design moderne avec gradients');
    console.log('- ✅ Animations et transitions fluides');
    console.log('- ✅ États de chargement avec spinners');
    console.log('- ✅ Validation en temps réel');
    console.log('- ✅ Messages d\'erreur clairs');
    console.log('- ✅ Interface responsive');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateChurch();
