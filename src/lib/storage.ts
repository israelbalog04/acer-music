import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  uploadToSupabase, 
  getSupabasePublicUrl, 
  deleteFromSupabase, 
  generateFileName,
  type StorageBucket 
} from './supabase-storage';
import { 
  createGoogleDriveStorage, 
  type GoogleDriveUploadOptions 
} from './google-drive-storage';

// Configuration des différents systèmes de stockage
const s3Client = process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION || 'eu-west-3',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'acer-music-files';

// Instance Google Drive
const googleDriveClient = createGoogleDriveStorage();

// Déterminer le type de stockage à utiliser
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local', 'supabase', 's3', 'gdrive'
const USE_S3 = STORAGE_TYPE === 's3' && s3Client;
const USE_SUPABASE = STORAGE_TYPE === 'supabase';
const USE_GDRIVE = STORAGE_TYPE === 'gdrive' && googleDriveClient;

export interface FileUploadResult {
  url: string;
  key: string;
  fileName: string;
}

export interface FileUploadOptions {
  folder: string; // 'recordings', 'sequences', 'multimedia'
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  churchId?: string;
}

/**
 * Service de stockage adaptable : Local en développement, S3 en production
 */
export class StorageService {
  /**
   * Upload un fichier vers le stockage approprié
   */
  static async uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
    const { folder, originalName, buffer, mimeType, churchId } = options;
    
    if (USE_SUPABASE) {
      return await this.uploadToSupabase(folder as StorageBucket, originalName, buffer, mimeType, churchId);
    } else if (USE_S3) {
      // Générer un nom de fichier unique pour S3
      const fileId = uuidv4();
      const fileExtension = originalName.split('.').pop() || '';
      const fileName = `${fileId}.${fileExtension}`;
      const filePath = churchId ? `${folder}/${churchId}/${fileName}` : `${folder}/${fileName}`;
      
      return await this.uploadToS3(filePath, buffer, mimeType, fileName);
    } else {
      // Stockage local
      const fileId = uuidv4();
      const fileExtension = originalName.split('.').pop() || '';
      const fileName = `${fileId}.${fileExtension}`;
      
      return await this.uploadToLocal(folder, fileName, buffer, churchId);
    }
  }

  /**
   * Upload vers Supabase Storage
   */
  private static async uploadToSupabase(
    bucket: StorageBucket,
    originalName: string,
    buffer: Buffer,
    mimeType: string,
    churchId?: string
  ): Promise<FileUploadResult> {
    try {
      // Générer un nom de fichier unique
      const fileName = generateFileName(originalName, churchId);
      
      // Créer le chemin avec séparation par église
      const filePath = churchId ? `${churchId}/${fileName}` : fileName;
      
      // Upload vers Supabase
      const data = await uploadToSupabase(bucket, filePath, buffer, {
        contentType: mimeType,
        cacheControl: '3600'
      });

      // Générer l'URL selon le type de bucket
      const bucketConfig = {
        avatars: { public: true },
        multimedia: { public: true },
        recordings: { public: false },
        sequences: { public: false }
      };

      const url = bucketConfig[bucket]?.public 
        ? getSupabasePublicUrl(bucket, filePath)
        : `/api/storage/${bucket}/${filePath}`; // Route privée à créer

      return {
        url,
        key: filePath,
        fileName
      };
      
    } catch (error) {
      console.error('Erreur upload Supabase:', error);
      throw new Error(`Échec upload Supabase: ${error}`);
    }
  }

  /**
   * Upload vers AWS S3
   */
  private static async uploadToS3(
    key: string, 
    buffer: Buffer, 
    mimeType: string, 
    fileName: string
  ): Promise<FileUploadResult> {
    if (!s3Client) {
      throw new Error('AWS S3 non configuré');
    }

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Métadonnées pour l'organisation
      Metadata: {
        'original-name': fileName,
        'upload-timestamp': new Date().toISOString(),
      },
      // Configuration de cache pour les performances
      CacheControl: 'public, max-age=31536000', // 1 an
    });

    await s3Client.send(command);

    // URL publique du fichier (ou via CloudFront CDN si configuré)
    const baseUrl = process.env.AWS_CLOUDFRONT_URL || `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'eu-west-3'}.amazonaws.com`;
    const url = `${baseUrl}/${key}`;

    return {
      url,
      key,
      fileName,
    };
  }

  /**
   * Upload vers le stockage local
   */
  private static async uploadToLocal(
    folder: string, 
    fileName: string, 
    buffer: Buffer, 
    churchId?: string
  ): Promise<FileUploadResult> {
    // Créer le chemin local avec séparation par église
    const uploadDir = churchId 
      ? join(process.cwd(), 'public', 'uploads', folder, churchId)
      : join(process.cwd(), 'public', 'uploads', folder);
    
    // Créer le dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });
    
    // Écrire le fichier
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // URL publique relative
    const url = churchId 
      ? `/uploads/${folder}/${churchId}/${fileName}`
      : `/uploads/${folder}/${fileName}`;

    return {
      url,
      key: `${folder}/${churchId || 'default'}/${fileName}`,
      fileName,
    };
  }

  /**
   * Supprimer un fichier
   */
  static async deleteFile(key: string): Promise<void> {
    if (USE_S3) {
      await this.deleteFromS3(key);
    } else {
      await this.deleteFromLocal(key);
    }
  }

  /**
   * Supprimer depuis S3
   */
  private static async deleteFromS3(key: string): Promise<void> {
    if (!s3Client) {
      throw new Error('AWS S3 non configuré');
    }

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Supprimer depuis le stockage local
   */
  private static async deleteFromLocal(key: string): Promise<void> {
    try {
      const filePath = join(process.cwd(), 'public', 'uploads', key);
      await unlink(filePath);
    } catch (error) {
      // Fichier déjà supprimé ou inexistant
      console.warn('Erreur lors de la suppression du fichier local:', error);
    }
  }

  /**
   * Générer une URL signée pour l'accès privé (S3 uniquement)
   */
  static async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!USE_S3 || !s3Client) {
      // En local, retourner l'URL publique
      return `/uploads/${key}`;
    }

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Obtenir la configuration actuelle
   */
  static getStorageInfo() {
    return {
      mode: USE_S3 ? 'S3' : 'Local',
      bucket: S3_BUCKET,
      region: process.env.AWS_REGION || 'eu-west-3',
      cdnUrl: process.env.AWS_CLOUDFRONT_URL || null,
    };
  }
}

/**
 * Utilitaires pour les validations
 */
export class FileValidator {
  static readonly AUDIO_TYPES = [
    'audio/mpeg',
    'audio/wav', 
    'audio/mp3',
    'audio/ogg',
    'audio/m4a'
  ];

  static readonly IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  static readonly DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  /**
   * Valider un fichier audio
   */
  static validateAudioFile(file: File): { valid: boolean; error?: string } {
    if (!this.AUDIO_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non supporté. Utilisez: MP3, WAV, OGG, M4A'
      };
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      return {
        valid: false,
        error: 'Fichier trop volumineux (max 50MB)'
      };
    }

    return { valid: true };
  }

  /**
   * Valider un fichier image
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!this.IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Type de fichier non supporté. Utilisez: JPG, PNG, GIF, WebP'
      };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return {
        valid: false,
        error: 'Fichier trop volumineux (max 10MB)'
      };
    }

    return { valid: true };
  }
}