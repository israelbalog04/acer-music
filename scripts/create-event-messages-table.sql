-- Script SQL pour créer la table event_messages dans Supabase
-- À exécuter dans Supabase SQL Editor

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

-- Ajouter les contraintes de clés étrangères (si les tables existent)
DO $$ 
BEGIN
    -- Foreign key vers schedules
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedules') THEN
        ALTER TABLE "public"."event_messages" 
        ADD CONSTRAINT "event_messages_scheduleId_fkey" 
        FOREIGN KEY ("scheduleId") REFERENCES "public"."schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign key vers users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE "public"."event_messages" 
        ADD CONSTRAINT "event_messages_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Foreign key vers churches
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'churches') THEN
        ALTER TABLE "public"."event_messages" 
        ADD CONSTRAINT "event_messages_churchId_fkey" 
        FOREIGN KEY ("churchId") REFERENCES "public"."churches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Self-referencing foreign key pour parent/replies
    ALTER TABLE "public"."event_messages" 
    ADD CONSTRAINT "event_messages_parentId_fkey" 
    FOREIGN KEY ("parentId") REFERENCES "public"."event_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

EXCEPTION
    WHEN others THEN 
        RAISE NOTICE 'Erreur lors de la création des contraintes: %', SQLERRM;
END $$;

-- Fonction pour mettre à jour updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour auto-update du updatedAt
DROP TRIGGER IF EXISTS update_event_messages_updated_at ON "public"."event_messages";
CREATE TRIGGER update_event_messages_updated_at
    BEFORE UPDATE ON "public"."event_messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vérification
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'event_messages' 
ORDER BY ordinal_position;

-- Afficher le résultat
SELECT 'Table event_messages créée avec succès!' as status;