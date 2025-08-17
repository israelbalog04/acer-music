import { google } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

export interface GoogleDriveUploadResult {
  url: string;
  key: string;
  fileName: string;
  fileId: string;
}

export interface GoogleDriveUploadOptions {
  folder: string;
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  churchId?: string;
}

/**
 * Service de stockage Google Drive pour ACER Music
 */
export class GoogleDriveStorage {
  private drive: any;
  private auth: any;

  constructor(private config: GoogleDriveConfig) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.auth.setCredentials({
      refresh_token: config.refreshToken
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Upload un fichier vers Google Drive
   */
  async uploadFile(options: GoogleDriveUploadOptions): Promise<GoogleDriveUploadResult> {
    const { folder, originalName, buffer, mimeType, churchId } = options;

    try {
      // Générer un nom de fichier unique
      const fileId = uuidv4();
      const fileExtension = originalName.split('.').pop() || '';
      const fileName = `${fileId}.${fileExtension}`;

      // Créer le dossier parent si nécessaire
      const folderId = await this.ensureFolderExists(folder, churchId);

      // Convertir le buffer en stream
      const stream = Readable.from(buffer);

      // Métadonnées du fichier
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
        description: `Fichier ACER Music - ${originalName}`,
      };

      // Media du fichier
      const media = {
        mimeType: mimeType,
        body: stream,
      };

      // Upload vers Google Drive
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink',
      });

      // Rendre le fichier public pour les médias publics
      if (this.isPublicFolder(folder)) {
        await this.makeFilePublic(response.data.id);
      }

      // Générer l'URL d'accès
      const url = this.isPublicFolder(folder) 
        ? `https://drive.google.com/uc?id=${response.data.id}&export=download`
        : `/api/storage/gdrive/${response.data.id}`;

      return {
        url,
        key: response.data.id,
        fileName,
        fileId: response.data.id,
      };

    } catch (error) {
      console.error('Erreur upload Google Drive:', error);
      throw new Error(`Échec upload Google Drive: ${error}`);
    }
  }

  /**
   * Supprimer un fichier de Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      console.error('Erreur suppression Google Drive:', error);
      throw new Error(`Échec suppression Google Drive: ${error}`);
    }
  }

  /**
   * Obtenir une URL de téléchargement temporaire
   */
  async getDownloadUrl(fileId: string, expiresIn = 3600): Promise<string> {
    try {
      // Pour Google Drive, on peut générer une URL directe
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'webContentLink,webViewLink',
      });

      return response.data.webContentLink || response.data.webViewLink;
    } catch (error) {
      console.error('Erreur génération URL Google Drive:', error);
      return `/api/storage/gdrive/${fileId}`;
    }
  }

  /**
   * Créer ou récupérer un dossier
   */
  private async ensureFolderExists(folder: string, churchId?: string): Promise<string> {
    const folderName = churchId ? `${folder}-${churchId}` : folder;
    
    try {
      // Chercher si le dossier existe déjà
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Créer le dossier s'il n'existe pas
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Dossier ACER Music - ${folder}${churchId ? ` - ${churchId}` : ''}`,
      };

      const folderResponse = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      return folderResponse.data.id;
    } catch (error) {
      console.error('Erreur création dossier Google Drive:', error);
      throw new Error(`Échec création dossier: ${error}`);
    }
  }

  /**
   * Rendre un fichier public
   */
  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (error) {
      console.warn('Impossible de rendre le fichier public:', error);
    }
  }

  /**
   * Vérifier si un dossier doit être public
   */
  private isPublicFolder(folder: string): boolean {
    const publicFolders = ['multimedia', 'avatars'];
    return publicFolders.includes(folder);
  }

  /**
   * Obtenir les informations d'utilisation du stockage
   */
  async getStorageInfo(): Promise<any> {
    try {
      const response = await this.drive.about.get({
        fields: 'storageQuota',
      });

      return {
        mode: 'Google Drive',
        quota: response.data.storageQuota,
      };
    } catch (error) {
      console.error('Erreur récupération info stockage:', error);
      return {
        mode: 'Google Drive',
        quota: null,
      };
    }
  }
}

/**
 * Factory pour créer une instance Google Drive
 */
export function createGoogleDriveStorage(): GoogleDriveStorage | null {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  // Vérifier que toutes les variables sont présentes
  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('Configuration Google Drive incomplète');
    return null;
  }

  const config: GoogleDriveConfig = {
    clientId,
    clientSecret,
    redirectUri,
    refreshToken,
  };

  return new GoogleDriveStorage(config);
}