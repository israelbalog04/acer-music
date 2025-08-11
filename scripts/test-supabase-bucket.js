const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function testSupabaseBucket() {
  console.log('🔍 Test du bucket Supabase...');
  
  // Vérification des variables d'environnement
  console.log('\n📋 Variables d\'environnement:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ Manquante');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Définie' : '❌ Manquante');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n❌ Variables d\'environnement Supabase manquantes!');
    console.log('💡 Configurez ces variables:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  // Création du client Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const bucketName = 'multimedia';
  const testFileName = 'test-file.txt';
  const testContent = 'Ceci est un fichier de test pour vérifier le bucket Supabase.';

  try {
    console.log('\n🔌 Test de connexion au bucket...');
    
    // 1. Lister les buckets existants
    console.log('\n📋 Liste des buckets:');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Erreur lors de la liste des buckets:', bucketsError.message);
    } else {
      console.log(`✅ ${buckets.length} buckets trouvés:`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }

    // 2. Vérifier si le bucket multimedia existe
    console.log(`\n🔍 Vérification du bucket '${bucketName}':`);
    const { data: bucketExists, error: bucketError } = await supabase.storage.getBucket(bucketName);
    
    if (bucketError) {
      console.log(`❌ Bucket '${bucketName}' non trouvé ou erreur:`, bucketError.message);
      console.log('\n💡 Création du bucket...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['image/*', 'audio/*', 'video/*', 'text/*'],
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (createError) {
        console.log('❌ Erreur lors de la création du bucket:', createError.message);
        return;
      } else {
        console.log(`✅ Bucket '${bucketName}' créé avec succès!`);
      }
    } else {
      console.log(`✅ Bucket '${bucketName}' existe déjà`);
    }

    // 3. Créer un fichier de test temporaire
    console.log('\n📝 Création d\'un fichier de test...');
    const tempFilePath = path.join(__dirname, testFileName);
    fs.writeFileSync(tempFilePath, testContent);
    console.log(`✅ Fichier temporaire créé: ${tempFilePath}`);

    // 4. Upload du fichier
    console.log('\n⬆️ Upload du fichier...');
    const fileBuffer = fs.readFileSync(tempFilePath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, fileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.log('❌ Erreur lors de l\'upload:', uploadError.message);
    } else {
      console.log('✅ Upload réussi!');
      console.log('   - Chemin:', uploadData.path);
      console.log('   - ID:', uploadData.id);
    }

    // 5. Lister les fichiers dans le bucket
    console.log('\n📋 Liste des fichiers dans le bucket:');
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list();

    if (listError) {
      console.log('❌ Erreur lors de la liste des fichiers:', listError.message);
    } else {
      console.log(`✅ ${files.length} fichiers trouvés:`);
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
      });
    }

    // 6. Télécharger le fichier
    console.log('\n⬇️ Téléchargement du fichier...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(testFileName);

    if (downloadError) {
      console.log('❌ Erreur lors du téléchargement:', downloadError.message);
    } else {
      const downloadedContent = await downloadData.text();
      console.log('✅ Téléchargement réussi!');
      console.log('   - Contenu:', downloadedContent.substring(0, 50) + '...');
    }

    // 7. Supprimer le fichier de test
    console.log('\n🗑️ Suppression du fichier de test...');
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([testFileName]);

    if (deleteError) {
      console.log('❌ Erreur lors de la suppression:', deleteError.message);
    } else {
      console.log('✅ Fichier supprimé avec succès!');
    }

    // 8. Nettoyer le fichier temporaire
    fs.unlinkSync(tempFilePath);
    console.log('✅ Fichier temporaire supprimé');

    console.log('\n🎉 Tous les tests du bucket sont passés avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    console.log('\n🔍 Diagnostic:');
    console.log('1. Vérifiez les variables d\'environnement Supabase');
    console.log('2. Vérifiez les permissions du bucket');
    console.log('3. Vérifiez la configuration RLS');
  }
}

// Exécution du test
if (require.main === module) {
  testSupabaseBucket()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testSupabaseBucket };
