const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://butlptmveyaluxlnwizr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dGxwdG12ZXlhbHV4bG53aXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkxNDkzNSwiZXhwIjoyMDcwNDkwOTM1fQ.bRdVnxaLfcBdOpTMByYPjMZlo29kGKycRdDRNVQY3qM';

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = `
-- Créer l'enum MessageType s'il n'existe pas
DO $$ BEGIN
    CREATE TYPE "MessageType" AS ENUM ('TEXT', 'SYSTEM', 'ANNOUNCEMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Créer la table event_messages
CREATE TABLE IF NOT EXISTS "public"."event_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "parentId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_messages_pkey" PRIMARY KEY ("id")
);

-- Créer les index
CREATE INDEX IF NOT EXISTS "event_messages_scheduleId_idx" ON "public"."event_messages"("scheduleId");
CREATE INDEX IF NOT EXISTS "event_messages_userId_idx" ON "public"."event_messages"("userId");
CREATE INDEX IF NOT EXISTS "event_messages_churchId_idx" ON "public"."event_messages"("churchId");
CREATE INDEX IF NOT EXISTS "event_messages_parentId_idx" ON "public"."event_messages"("parentId");
CREATE INDEX IF NOT EXISTS "event_messages_createdAt_idx" ON "public"."event_messages"("createdAt");
`;

async function runMigration() {
  console.log('🚀 Migration Supabase - Création table event_messages');
  console.log('='.repeat(60));

  try {
    console.log('📡 Connexion à Supabase...');
    
    // Exécuter la migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });

    if (error) {
      console.error('❌ Erreur lors de la migration:', error);
      
      // Essayer avec une approche alternative
      console.log('🔄 Tentative alternative...');
      
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'event_messages');

      if (tableError) {
        console.error('❌ Impossible de vérifier les tables:', tableError);
        return;
      }

      if (tables && tables.length === 0) {
        console.log('⚠️  Table event_messages manquante');
        console.log('📋 Exécutez manuellement le script dans Supabase SQL Editor:');
        console.log('scripts/create-event-messages-table.sql');
      } else {
        console.log('✅ Table event_messages existe déjà');
      }
    } else {
      console.log('✅ Migration exécutée avec succès');
      console.log('📊 Résultat:', data);
    }

    // Vérifier que la table existe
    console.log('🔍 Vérification de la table...');
    const { data: testQuery, error: testError } = await supabase
      .from('event_messages')
      .select('count');

    if (testError) {
      console.error('❌ Table non accessible:', testError.message);
    } else {
      console.log('✅ Table event_messages accessible et prête');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

runMigration();