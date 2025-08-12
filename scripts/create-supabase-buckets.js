require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function createSupabaseBuckets() {
  console.log('🚀 Création des buckets Supabase pour ACER Music...');
  
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

  // Configuration des buckets
  const bucketsConfig = [
    {
      name: 'multimedia',
      public: false,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 52428800, // 50MB
      description: 'Images, photos, vidéos des musiciens'
    },
    {
      name: 'recordings',
      public: false,
      allowedMimeTypes: ['audio/*'],
      fileSizeLimit: 104857600, // 100MB
      description: 'Fichiers audio des enregistrements'
    },
    {
      name: 'sequences',
      public: false,
      allowedMimeTypes: ['text/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 10485760, // 10MB
      description: 'Fichiers de partitions musicales'
    },
    {
      name: 'avatars',
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880, // 5MB
      description: 'Photos de profil des utilisateurs'
    }
  ];

  try {
    console.log('\n🔌 Connexion à Supabase...');
    
    // Lister les buckets existants
    console.log('\n📋 Buckets existants:');
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Erreur lors de la liste des buckets:', listError.message);
      return;
    }

    const existingBucketNames = existingBuckets.map(bucket => bucket.name);
    console.log(`✅ ${existingBuckets.length} buckets trouvés:`, existingBucketNames);

    // Créer ou vérifier chaque bucket
    console.log('\n🔨 Création/Vérification des buckets...');
    
    for (const config of bucketsConfig) {
      console.log(`\n📦 Bucket: ${config.name}`);
      console.log(`   Description: ${config.description}`);
      console.log(`   Public: ${config.public ? 'Oui' : 'Non'}`);
      console.log(`   Taille max: ${config.fileSizeLimit / 1024 / 1024}MB`);
      
      if (existingBucketNames.includes(config.name)) {
        console.log(`   ✅ Existe déjà`);
        
        // Vérifier la configuration du bucket existant
        const { data: bucketInfo, error: getError } = await supabase.storage.getBucket(config.name);
        if (!getError && bucketInfo) {
          console.log(`   📋 Configuration actuelle:`);
          console.log(`      - Public: ${bucketInfo.public}`);
          console.log(`      - File size limit: ${bucketInfo.file_size_limit || 'Non défini'}`);
        }
      } else {
        console.log(`   🔨 Création en cours...`);
        
        const { data: newBucket, error: createError } = await supabase.storage.createBucket(config.name, {
          public: config.public,
          allowedMimeTypes: config.allowedMimeTypes,
          fileSizeLimit: config.fileSizeLimit
        });
        
        if (createError) {
          console.log(`   ❌ Erreur lors de la création:`, createError.message);
        } else {
          console.log(`   ✅ Créé avec succès!`);
        }
      }
    }

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { data: finalBuckets, error: finalError } = await supabase.storage.listBuckets();
    
    if (!finalError) {
      console.log(`✅ ${finalBuckets.length} buckets au total:`);
      finalBuckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }

    console.log('\n🎉 Configuration des buckets terminée!');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Configurez les politiques RLS (Row Level Security)');
    console.log('2. Testez l\'upload de fichiers dans l\'application');
    console.log('3. Vérifiez les permissions d\'accès');

  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    console.log('\n🔍 Diagnostic:');
    console.log('1. Vérifiez les variables d\'environnement Supabase');
    console.log('2. Vérifiez que le service role key a les bonnes permissions');
    console.log('3. Vérifiez la configuration RLS');
  }
}

// Exécution du script
if (require.main === module) {
  createSupabaseBuckets()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { createSupabaseBuckets };
