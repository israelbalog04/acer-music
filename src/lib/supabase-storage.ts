import { createSupabaseServiceClient } from './supabase/server'
import { createSupabaseClient } from './supabase/client'

export type StorageBucket = 'avatars' | 'recordings' | 'sequences' | 'multimedia'

// Configuration des buckets
export const BUCKET_CONFIG = {
  avatars: { public: true, maxSize: 5 * 1024 * 1024 }, // 5MB
  recordings: { public: false, maxSize: 50 * 1024 * 1024 }, // 50MB  
  sequences: { public: false, maxSize: 10 * 1024 * 1024 }, // 10MB
  multimedia: { public: true, maxSize: 20 * 1024 * 1024 }, // 20MB
} as const

/**
 * Upload un fichier vers Supabase Storage (côté serveur)
 */
export async function uploadToSupabase(
  bucket: StorageBucket,
  path: string,
  file: File | Buffer,
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
) {
  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType,
      upsert: options?.upsert || false
    })

  if (error) {
    console.error(`Erreur upload Supabase (${bucket}/${path}):`, error)
    throw new Error(`Erreur upload: ${error.message}`)
  }

  return data
}

/**
 * Récupérer l'URL publique d'un fichier
 */
export function getSupabasePublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createSupabaseServiceClient()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
    
  return data.publicUrl
}

/**
 * Récupérer l'URL signée d'un fichier privé (côté client)
 */
export async function getSupabaseSignedUrl(
  bucket: StorageBucket, 
  path: string, 
  expiresIn = 3600
): Promise<string> {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Erreur URL signée: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Supprimer un fichier
 */
export async function deleteFromSupabase(bucket: StorageBucket, path: string) {
  const supabase = createSupabaseServiceClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`)
  }
}

/**
 * Lister les fichiers d'un dossier
 */
export async function listSupabaseFiles(bucket: StorageBucket, path = '') {
  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path)

  if (error) {
    throw new Error(`Erreur listing: ${error.message}`)
  }

  return data
}

/**
 * Générer un nom de fichier unique
 */
export function generateFileName(originalName: string, userId?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  const baseName = originalName.split('.').slice(0, -1).join('.')
  
  const prefix = userId ? `${userId}_` : ''
  return `${prefix}${baseName}_${timestamp}_${random}.${extension}`
}

/**
 * Valider un fichier selon les règles du bucket
 */
export function validateFile(file: File, bucket: StorageBucket): { valid: boolean; error?: string } {
  const config = BUCKET_CONFIG[bucket]
  
  // Vérifier la taille
  if (file.size > config.maxSize) {
    const maxMB = Math.round(config.maxSize / (1024 * 1024))
    return { 
      valid: false, 
      error: `Fichier trop volumineux. Maximum: ${maxMB}MB` 
    }
  }

  // Vérifier le type de fichier selon le bucket
  const allowedTypes = {
    avatars: ['image/jpeg', 'image/png', 'image/webp'],
    recordings: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    sequences: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
    multimedia: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }

  if (!allowedTypes[bucket].includes(file.type)) {
    return { 
      valid: false, 
      error: `Type de fichier non autorisé pour ${bucket}. Types autorisés: ${allowedTypes[bucket].join(', ')}` 
    }
  }

  return { valid: true }
}