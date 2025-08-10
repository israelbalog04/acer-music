import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuration S3
const s3Client = process.env.AWS_ACCESS_KEY_ID ? new S3Client({
  region: process.env.AWS_REGION || 'eu-west-3',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'acer-music-files';
const USE_S3 = process.env.NODE_ENV === 'production' && s3Client;

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
    
    // Générer un nom de fichier unique
    const fileId = uuidv4();
    const fileExtension = originalName.split('.').pop() || '';
    const fileName = `${fileId}.${fileExtension}`;
    
    // Créer le chemin avec l'ID de l'église pour la séparation des données
    const filePath = churchId 
      ? `${folder}/${churchId}/${fileName}`
      : `${folder}/${fileName}`;

    if (USE_S3) {
      return await this.uploadToS3(filePath, buffer, mimeType, fileName);
    } else {
      return await this.uploadToLocal(folder, fileName, buffer, churchId);
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