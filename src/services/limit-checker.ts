import { PrismaClient } from '@prisma/client';
import { SUBSCRIPTION_FEATURES } from '@/types/saas';

const prisma = new PrismaClient();

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  percentage: number;
  message?: string;
}

export class LimitChecker {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // Vérifier la limite de membres
  async checkMemberLimit(): Promise<LimitCheckResult> {
    const organization = await prisma.organization.findUnique({
      where: { id: this.organizationId },
      select: { 
        subscriptionPlan: true,
        _count: {
          select: { users: true }
        }
      }
    });

    if (!organization) {
      throw new Error('Organisation non trouvée');
    }

    const features = SUBSCRIPTION_FEATURES[organization.subscriptionPlan];
    const currentMembers = organization._count.users;
    const limit = features.maxMembers;

    return {
      allowed: limit === -1 || currentMembers < limit,
      current: currentMembers,
      limit: limit === -1 ? -1 : limit,
      percentage: limit === -1 ? 0 : (currentMembers / limit) * 100,
      message: limit === -1 ? 'Illimité' : `${currentMembers}/${limit} membres`
    };
  }

  // Vérifier la limite de stockage
  async checkStorageLimit(): Promise<LimitCheckResult> {
    const organization = await prisma.organization.findUnique({
      where: { id: this.organizationId },
      select: { 
        subscriptionPlan: true,
        storageUsed: true
      }
    });

    if (!organization) {
      throw new Error('Organisation non trouvée');
    }

    const features = SUBSCRIPTION_FEATURES[organization.subscriptionPlan];
    const currentStorage = organization.storageUsed || 0;
    const limit = features.storageLimit;

    return {
      allowed: limit === -1 || currentStorage < limit,
      current: currentStorage,
      limit: limit === -1 ? -1 : limit,
      percentage: limit === -1 ? 0 : (currentStorage / limit) * 100,
      message: limit === -1 ? 'Illimité' : `${this.formatBytes(currentStorage)}/${this.formatBytes(limit)}`
    };
  }

  // Vérifier si on peut ajouter un fichier
  async canAddFile(fileSize: number): Promise<LimitCheckResult> {
    const storageCheck = await this.checkStorageLimit();
    
    if (!storageCheck.allowed) {
      return {
        ...storageCheck,
        allowed: false,
        message: 'Limite de stockage atteinte'
      };
    }

    const newTotal = storageCheck.current + fileSize;
    const limit = storageCheck.limit;

    return {
      allowed: limit === -1 || newTotal <= limit,
      current: storageCheck.current,
      limit: limit,
      percentage: limit === -1 ? 0 : (newTotal / limit) * 100,
      message: limit === -1 ? 'Fichier autorisé' : `Nouveau total: ${this.formatBytes(newTotal)}/${this.formatBytes(limit)}`
    };
  }

  // Vérifier si on peut ajouter un membre
  async canAddMember(): Promise<LimitCheckResult> {
    const memberCheck = await this.checkMemberLimit();
    
    if (!memberCheck.allowed) {
      return {
        ...memberCheck,
        allowed: false,
        message: 'Limite de membres atteinte'
      };
    }

    return {
      ...memberCheck,
      allowed: true,
      message: `Peut ajouter un membre (${memberCheck.current + 1}/${memberCheck.limit})`
    };
  }

  // Obtenir toutes les limites en une fois
  async getAllLimits() {
    const [members, storage] = await Promise.all([
      this.checkMemberLimit(),
      this.checkStorageLimit()
    ]);

    return {
      members,
      storage,
      hasWarnings: members.percentage > 80 || storage.percentage > 80,
      hasErrors: !members.allowed || !storage.allowed
    };
  }

  // Mettre à jour l'utilisation du stockage
  async updateStorageUsage(fileSize: number, operation: 'add' | 'remove') {
    const change = operation === 'add' ? fileSize : -fileSize;
    
    await prisma.organization.update({
      where: { id: this.organizationId },
      data: {
        storageUsed: {
          increment: change
        }
      }
    });
  }

  // Formater les bytes en format lisible
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Service global pour les vérifications rapides
export class GlobalLimitChecker {
  static async checkOrganizationLimits(organizationId: string) {
    const checker = new LimitChecker(organizationId);
    return await checker.getAllLimits();
  }

  static async canOrganizationPerformAction(
    organizationId: string, 
    action: 'addMember' | 'addFile', 
    fileSize?: number
  ): Promise<boolean> {
    const checker = new LimitChecker(organizationId);
    
    switch (action) {
      case 'addMember':
        const memberCheck = await checker.canAddMember();
        return memberCheck.allowed;
      
      case 'addFile':
        if (!fileSize) throw new Error('Taille de fichier requise');
        const fileCheck = await checker.canAddFile(fileSize);
        return fileCheck.allowed;
      
      default:
        return false;
    }
  }
}
